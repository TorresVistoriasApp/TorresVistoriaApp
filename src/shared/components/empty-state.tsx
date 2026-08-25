import { Inbox } from "lucide-react";

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted px-8 py-14 text-center">
      <span className="ui-icon-box mb-4 h-12 w-12">
        <Inbox className="h-5 w-5" strokeWidth={1.75} aria-hidden />
      </span>
      <p className="text-[17px] font-bold text-foreground">{title}</p>
      {description && (
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
