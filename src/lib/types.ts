import type { Database } from "@/types/database";

export type { Database, Json } from "@/types/database";

type Tables = Database["public"]["Tables"];

export type Inspection = Tables["inspections"]["Row"];
export type InspectionInsert = Tables["inspections"]["Insert"];
export type InspectionUpdate = Tables["inspections"]["Update"];

export type InspectionChecklist = Tables["inspection_checklists"]["Row"];
export type InspectionPhoto = Tables["inspection_photos"]["Row"];
export type InspectionComment = Tables["inspection_comments"]["Row"];
export type InspectionReport = Tables["inspection_reports"]["Row"];

export type FinancialEntry = Tables["financial_entries"]["Row"];
export type FinancialEntryInsert = Tables["financial_entries"]["Insert"];

export type Profile = Tables["profiles"]["Row"];
export type ProfileUpdate = Tables["profiles"]["Update"];

export type Company = Tables["companies"]["Row"];
export type CompanyUpdate = Tables["companies"]["Update"];

export type { UserRole } from "@/lib/enums";
