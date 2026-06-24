import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { updateUserSchema, type UpdateUserInput } from "@/features/users/schemas/user-admin";
import { UserRole } from "@/lib/enums";
import type { TeamProfile } from "@/services/user-service";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EditUserDialogProps {
  user: TeamProfile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (userId: string, data: UpdateUserInput) => Promise<void>;
  isSubmitting?: boolean;
}

export function EditUserDialog({
  user,
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
}: EditUserDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateUserInput>({
    resolver: zodResolver(updateUserSchema),
  });

  useEffect(() => {
    if (user && open) {
      reset({
        fullName: user.full_name,
        email: user.email ?? "",
        role: user.role as UserRole,
      });
    }
  }, [user, open, reset]);

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar usuário</DialogTitle>
          <DialogDescription>Atualize nome, e-mail e função da conta.</DialogDescription>
        </DialogHeader>

        <form
          className="space-y-4"
          onSubmit={handleSubmit(async (data) => {
            await onSubmit(user.id, data);
            onOpenChange(false);
          })}
        >
          <div className="space-y-2">
            <Label htmlFor="edit-user-name">Nome</Label>
            <Input id="edit-user-name" className="touch-target" {...register("fullName")} />
            {errors.fullName && <p className="text-sm text-destructive">{errors.fullName.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-user-email">Email</Label>
            <Input id="edit-user-email" type="email" className="touch-target" {...register("email")} />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-user-role">Papel</Label>
            <select
              id="edit-user-role"
              className="flex h-11 w-full touch-target rounded-md border border-input bg-background px-3 text-sm"
              {...register("role")}
            >
              <option value={UserRole.SUPER_ADMIN}>Super Admin</option>
              <option value={UserRole.VISTORIADOR}>Vistoriador</option>
            </select>
            {errors.role && <p className="text-sm text-destructive">{errors.role.message}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Salvar alterações"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
