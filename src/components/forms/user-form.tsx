import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { inviteUserSchema, type InviteUserInput } from "@/schemas/auth";
import { UserRole } from "@/lib/enums";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function UserForm({
  onSubmit,
  isSubmitting,
}: {
  onSubmit: (data: InviteUserInput) => Promise<void>;
  isSubmitting?: boolean;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InviteUserInput>({
    resolver: zodResolver(inviteUserSchema),
    defaultValues: { role: UserRole.VISTORIADOR },
  });

  return (
    <form
      onSubmit={handleSubmit(async (data) => {
        await onSubmit(data);
        reset({ email: "", fullName: "", role: UserRole.VISTORIADOR });
      })}
      className="space-y-4"
      data-testid="invite-user-form"
    >
      <div className="space-y-2">
        <Label htmlFor="invite-email">E-mail</Label>
        <Input id="invite-email" type="email" className="touch-target" {...register("email")} />
        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="invite-name">Nome completo</Label>
        <Input id="invite-name" className="touch-target" {...register("fullName")} />
        {errors.fullName && <p className="text-sm text-destructive">{errors.fullName.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="invite-role">Função</Label>
        <select
          id="invite-role"
          className="flex h-11 w-full touch-target rounded-md border border-input bg-background px-3 text-sm"
          {...register("role")}
        >
          <option value={UserRole.VISTORIADOR}>Vistoriador</option>
          <option value={UserRole.SUPER_ADMIN}>Super Admin</option>
        </select>
        {errors.role && <p className="text-sm text-destructive">{errors.role.message}</p>}
      </div>
      <Button type="submit" className="touch-target" disabled={isSubmitting}>
        {isSubmitting ? "Enviando convite..." : "Convidar usuário"}
      </Button>
    </form>
  );
}
