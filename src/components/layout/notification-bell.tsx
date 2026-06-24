import { useState } from "react";
import { Bell } from "lucide-react";
import { Link } from "react-router-dom";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from "@/hooks/use-notifications";
import { notificationService } from "@/services/notification-service";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/formatters";

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { data: notifications = [] } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const unread = notificationService.unreadCount(notifications);

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        aria-label="Notificações"
        onClick={() => setOpen((v) => !v)}
        className="relative"
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </Button>

      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40"
            aria-label="Fechar notificações"
            onClick={() => setOpen(false)}
          />
          <div className="surface-elevated absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden">
            <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
              <p className="font-display text-sm font-normal tracking-tight">Notificações</p>
              {unread > 0 && (
                <button
                  type="button"
                  className="text-xs font-medium text-accent hover:underline"
                  onClick={() => void markAllRead.mutateAsync()}
                >
                  Marcar todas como lidas
                </button>
              )}
            </div>
            <ul className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <li className="px-4 py-6 text-center text-sm text-muted-foreground">
                  Nenhuma notificação
                </li>
              ) : (
                notifications.map((n) => {
                  const inspectionId =
                    n.metadata && typeof n.metadata.inspection_id === "string"
                      ? n.metadata.inspection_id
                      : null;

                  return (
                    <li
                      key={n.id}
                      className={cn(
                        "border-b border-border px-4 py-3 text-sm last:border-0",
                        !n.read_at && "bg-muted/40",
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium">{n.title}</p>
                          <p className="text-muted-foreground">{n.body}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {formatDate(n.created_at)}
                          </p>
                          {inspectionId && (
                            <Link
                              to={`/vistorias/${inspectionId}`}
                              className="mt-1 inline-block text-xs font-medium text-accent hover:underline"
                              onClick={() => {
                                if (!n.read_at) void markRead.mutateAsync(n.id);
                                setOpen(false);
                              }}
                            >
                              Ver vistoria
                            </Link>
                          )}
                        </div>
                        {!n.read_at && (
                          <button
                            type="button"
                            className="shrink-0 text-xs font-medium text-accent hover:underline"
                            onClick={() => void markRead.mutateAsync(n.id)}
                          >
                            Lida
                          </button>
                        )}
                      </div>
                    </li>
                  );
                })
              )}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
