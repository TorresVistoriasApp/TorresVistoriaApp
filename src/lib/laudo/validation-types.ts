export type ReportValidationResult = {
  valid: boolean;
  message?: string;
  integrityVerified?: boolean;
  hashStatus?: "OK" | "FALHA" | "INDISPONIVEL";
  status?: string;
  companyName?: string;
  laudoNumber?: string;
  verificationCode?: string;
  issuedAt?: string;
  issuedAtFormatted?: string;
  inspectionNumber?: number;
  inspectionDate?: string;
};
