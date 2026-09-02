/**
 * Rotas ficam fora: o roteador importa `@/modules/admin/routes` para não
 * puxar o chunk de páginas neste barrel.
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
