export function isDuplicateUserError(message: string): boolean {
  return /already been registered|already registered|user already exists|email address is already/i.test(
    message,
  );
}
