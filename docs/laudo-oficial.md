# Laudo oficial — template canônica (pdfmake)

O documento oficial usa **a mesma template** da prévia (`buildLaudoDocDefinition` → pdfmake no navegador).

```
Cliente (autenticado)
  → create-report PREPARE { inspectionId }
       valida tenant / vistoria
       calcula contentDigest (snapshot do banco)
       devolve verificationCode, validationUrl, issueToken, contentDigest
  → generateLaudoPdf({ mode: "official" }) no browser
       mesma pipeline da prévia (sem marca d'água)
       imprime código + contentDigest no PDF (corpo) e linha `TORRES_BINDING_V1` em `/Keywords` (metadado)
  → create-report SEAL { inspectionId, pdfBase64, issueToken, verificationCode, contentDigest }
       valida token e digest
       verifica binding no PDF (linha canônica `TORRES_BINDING_V1|vc=...|cd=...` no binário ou corpus FlateDecode)
       SHA-256 do arquivo → integrity_hash
       grava bucket privado reports
       inspection_reports + COMPLETED
  → cliente baixa o arquivo gravado (Storage)
```

## Prévia vs oficial

| | Prévia | Oficial |
|---|--------|---------|
| Gerador | pdfmake / `buildLaudoDocDefinition` | Idêntico |
| Marca d'água | `PREVIA — NAO OFICIAL` | Não |
| Código | `PREVIA-NAO-OFICIAL` | Servidor |
| Digest | Não | `contentDigest` (snapshot servidor) |
| Arquivo registrado | Não | Sim (`reports`) |
| Validação pública | Não | `/validar/{codigo}` |

## Integridade

- **`inspection_reports.integrity_hash`**: SHA-256 dos **bytes do PDF** armazenado no Storage.
- **`contentDigest`**: SHA-256 de um snapshot canônico da vistoria (inspeção + checklist + contagem de fotos + código + versão). Amarra o PDF à vistoria; aparece no PDF e deve estar presente no arquivo enviado no SEAL.
- **`validate-report`**: baixa o PDF do Storage, recalcula SHA-256 e compara com `integrity_hash`.

Não é possível imprimir no PDF o SHA-256 do próprio arquivo **e** exigir que esse valor seja igual ao hash dos bytes que contêm o texto (referência circular). Por isso o PDF exibe o **digest de conteúdo** e a validação pública usa o **hash do arquivo**.

**Otimização:** `optimizePdfBlob` remove `/Keywords` e outros metadados. O fluxo oficial (`generateLaudoPdf` → SEAL) **não** deve passar pelo optimizer antes do SEAL; qualquer transformação pós-`applyTorresOfficialPdfBinding` que remova o binding fará o SEAL rejeitar o arquivo.

## Limites

- PDF até **40 MB** no SEAL (base64 ~1,4× no corpo HTTP).
- Geração no navegador: timeout de **180s**; fotos embutidas com concorrência **4** (max ~560×420 JPEG).
- Para 75–100+ fotos, monitorar tamanho do PDF e tempo; se insuficiente, evoluir para worker Node reutilizando `buildLaudoDocDefinition` (sem redesenhar).

## O que o cliente não pode fazer

- Forjar `integrity_hash`, `storage_path` ou código sem passar pelo PREPARE/SEAL.
- Upload direto no bucket `reports` (RLS).
- Alterar vistoria `COMPLETED` (triggers).
