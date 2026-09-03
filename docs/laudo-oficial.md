# Laudo oficial — fonte da verdade no servidor

O documento oficial de uma vistoria **não** é o PDF gerado no navegador.

```
Cliente
  → create-report { inspectionId }
       JWT + tenant + created_by
       lê vistoria, checklist, fotos, empresa e vistoriador no banco
       gera o PDF no isolate (pdf-lib)
       grava no bucket privado `reports` com service_role
       calcula SHA-256 do arquivo
       registra inspection_reports
       marca a vistoria COMPLETED
  → cliente só baixa o arquivo já emitido
```

## O que o cliente pode fazer

- Pedir a emissão com o `inspectionId` da vistoria autorizada.
- Ver a **prévia** HTML/pdfmake no navegador (marca d'água "PRÉVIA — NÃO OFICIAL").
- Baixar o PDF oficial depois que o servidor gravou o arquivo.

## O que o cliente não pode fazer

- Enviar código, hash, path, URL ou bytes de PDF para virar laudo oficial.
- Fazer upload ou overwrite no bucket `reports`.
- Inserir/atualizar/apagar linhas em `inspection_reports`.
- Alterar placa, chassi, parecer, checklist ou fotos depois que a vistoria está `COMPLETED`.

## Limitação técnica (Edge)

`pdfmake` + fontes custom + dezenas de fotos rasterizadas não cabem de forma confiável no tempo e na memória de uma Edge Function.

O PDF oficial usa `pdf-lib` (Helvetica) e lista as fotografias pelo path canônico do banco. As imagens continuam no bucket privado `inspection-photos`. A prévia visual rica permanece no frontend e **não** é o documento oficial.

## Validação pública

O código impresso no PDF aponta para `/validar/{codigo}`. O hash SHA-256 fica no servidor (`inspection_reports.integrity_hash`) e é o do arquivo gravado, não de um JSON montado no cliente.

## Namespace `pending/`

Não aceitar mais laudo em `pending/`. Arquivos antigos **não** são apagados. SELECT autenticado exige path `{tenant}/{inspection}/*.pdf`. Remoção física fica para um script de limpeza posterior.
