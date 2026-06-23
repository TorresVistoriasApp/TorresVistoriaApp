import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function Page() {
  const { profile, user } = useAuth();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Meu perfil</h1>
      <Card>
        <CardHeader><CardTitle>{profile?.full_name}</CardTitle></CardHeader>
        <CardContent className="space-y-1 text-sm">
          <p>E-mail: {user?.email}</p>
          <p>Função: {profile?.role}</p>
        </CardContent>
      </Card>
    </div>
  );
}
