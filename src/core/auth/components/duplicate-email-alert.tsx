import { Link } from "react-router-dom";
import { ROUTES } from "@/config/routes";
import { Button } from "@/shared/ui/button";

interface DuplicateEmailAlertProps {
  loginRoute?: string;
  forgotPasswordRoute?: string;
}

/**
 * Mensagem única de cadastro público — não confirma se o e-mail já existe.
 */
export function DuplicateEmailAlert({
  loginRoute = ROUTES.consultaLogin,
  forgotPasswordRoute = ROUTES.consultaForgotPassword,
}: DuplicateEmailAlertProps) {
  return (
    <div className="rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm">
      <p className="font-medium text-foreground">
        Se este e-mail puder ser cadastrado, enviaremos um link de confirmação.
      </p>
      <p className="mt-1 text-muted-foreground">
        Verifique sua caixa de entrada. Se você já tem conta, entre ou recupere a senha.
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
  return /já existe uma conta associada|já existe um usuário cadastrado|se este e-mail puder ser cadastrado|already been registered|already registered|user already exists|email address is already/i.test(
    message,
  );
}
