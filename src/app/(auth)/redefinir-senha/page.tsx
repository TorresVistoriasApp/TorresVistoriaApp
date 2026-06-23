import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { ROUTES } from "@/lib/constants";

export function Page() {
  return (
    <div className="flex min-h-dvh items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Redefinir senha</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>Use o link enviado por e-mail para definir uma nova senha no Supabase Auth.</p>
          <Link to={ROUTES.login} className="text-primary hover:underline">Voltar ao login</Link>
        </CardContent>
      </Card>
    </div>
  );
}
