import { Link } from "react-router-dom";
import { ROUTES } from "@/config/routes";
import { Button } from "@/shared/ui/button";

interface DuplicateEmailAlertProps {
  loginRoute?: string;
  forgotPasswordRoute?: string;
}

/**
 * Mensagem amigável quando o e-mail já está cadastrado no Supabase Auth.
 */
export function DuplicateEmailAlert({
  loginRoute = ROUTES.consultaLogin,
  forgotPasswordRoute = ROUTES.consultaForgotPassword,
}: DuplicateEmailAlertProps) {
  return (
    <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm">
      <p className="font-medium text-foreground">Já existe uma conta associada a este e-mail.</p>
      <p className="mt-1 text-muted-foreground">
        Você pode entrar com suas credenciais ou recuperar sua senha.
      </p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <Button asChild size="sm" variant="default">
          <Link to={loginRoute}>Entrar</Link>
        </Button>
        <Button asChild size="sm" variant="outline">
          <Link to={forgotPasswordRoute}>Esqueci minha senha</Link>
        </Button>
      </div>
    </div>
  );
}

export function isDuplicateEmailError(message: string): boolean {
  return /já existe uma conta associada|já existe um usuário cadastrado|already been registered|already registered|user already exists|duplicate key|unique constraint/i.test(
    message,
  );
}
