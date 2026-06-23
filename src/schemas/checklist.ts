import { z } from "zod";
import { ChecklistStatus } from "@/lib/enums";

const checklistStatusEnum = z.enum([
  ChecklistStatus.CONFORME,
  ChecklistStatus.NAO_CONFORME,
  ChecklistStatus.NA,
]);

export const checklistItemSchema = z.object({
  category: z.string().min(1),
  item_name: z.string().min(1),
  status: checklistStatusEnum.default(ChecklistStatus.NA),
  notes: z.string().max(1000).optional().nullable().or(z.literal("")),
  photo_ids: z.array(z.string().uuid()).optional(),
});

export const checklistCategorySchema = z.object({
  category: z.string(),
  categoryLabel: z.string(),
  items: z.array(checklistItemSchema),
});

export const checklistBatchSchema = z.object({
  inspectionId: z.string().uuid(),
  categories: z.array(checklistCategorySchema),
});

export type ChecklistItemInput = z.infer<typeof checklistItemSchema>;
export type ChecklistCategoryInput = z.infer<typeof checklistCategorySchema>;
export type ChecklistBatchInput = z.infer<typeof checklistBatchSchema>;

export { CHECKLIST_CATEGORIES } from "@/lib/constants";
