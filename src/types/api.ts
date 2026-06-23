import type { Inspection } from "@/services/inspection-service";

export type RecentInspection = Pick<
  Inspection,
  "id" | "inspection_number" | "plate" | "brand" | "model" | "status" | "inspection_date" | "client_name"
>;
