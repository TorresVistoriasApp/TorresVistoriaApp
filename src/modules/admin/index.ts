/**
 * API pública do módulo Admin.
 *
 * Outros módulos consomem apenas o que está exportado aqui. As rotas ficam de
 * fora de propósito: o roteador importa `@/modules/admin/routes` para não
 * puxar o chunk de páginas no barrel.
 */

export { CompanyAddressFields } from "@/modules/admin/settings";
export {
  CreateUserDialog,
  EditUserDialog,
  UserCard,
  useCreateUser,
  useInviteUser,
  useSetUserActive,
  useUpdateUser,
  createUserSchema,
  updateUserSchema,
  type CreateUserInput,
  type UpdateUserInput,
  adminUsersService,
} from "@/modules/admin/users";
