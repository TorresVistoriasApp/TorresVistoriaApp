import {
  Children,
  cloneElement,
  isValidElement,
  useId,
  type ReactElement,
  type ReactNode,
} from "react";
import { Label } from "@/shared/ui/label";
import { OptionalLabel } from "@/shared/components/forms/optional-label";
import { cn } from "@/shared/lib/utils";

interface FormFieldProps {
  label: string;
  error?: string;
  hint?: string;
  className?: string;
  labelClassName?: string;
  optional?: boolean;
  labelAction?: ReactNode;
  /** Associa o rótulo ao controle. Se omitido, usa `id` ou gera um id estável. */
  htmlFor?: string;
  /** Alias de `htmlFor` — também usado para injetar `id` no controle filho quando ausente. */
  id?: string;
  children: ReactNode;
}

const NATIVE_CONTROL_TAGS = new Set(["input", "select", "textarea"]);

function isFormControlElement(element: ReactElement<Record<string, unknown>>): boolean {
  if (typeof element.type === "string") {
    return NATIVE_CONTROL_TAGS.has(element.type);
  }

  const component = element.type as { displayName?: string; name?: string };
  const name = component.displayName ?? component.name ?? "";
  return name === "Input" || name === "MaskedInput";
}

function walkFormControls(node: ReactNode, visit: (element: ReactElement<Record<string, unknown>>) => void): void {
  Children.forEach(node, (child) => {
    if (!isValidElement(child)) return;

    const element = child as ReactElement<Record<string, unknown>>;

    if (isFormControlElement(element)) {
      visit(element);
      return;
    }

    const nested = element.props.children as ReactNode | undefined;
    if (nested) {
      walkFormControls(nested, visit);
    }
  });
}

function extractControlId(children: ReactNode): string | undefined {
  let found: string | undefined;
  walkFormControls(children, (element) => {
    const elementId = element.props.id;
    if (!found && typeof elementId === "string" && elementId.length > 0) {
      found = elementId;
    }
  });
  return found;
}

function injectControlId(children: ReactNode, controlId: string): ReactNode {
  return Children.map(children, (child) => {
    if (!isValidElement(child)) return child;

    const element = child as ReactElement<Record<string, unknown>>;

    if (isFormControlElement(element)) {
      const elementId = element.props.id;
      if (typeof elementId === "string" && elementId.length > 0) {
        return element;
      }
      return cloneElement(element, { id: controlId });
    }

    const nested = element.props.children as ReactNode | undefined;
    if (nested) {
      return cloneElement(element, {}, injectControlId(nested, controlId));
    }

    return element;
  });
}

export function FormField({
  label,
  error,
  hint,
  className,
  labelClassName,
  optional,
  labelAction,
  htmlFor,
  id,
  children,
}: FormFieldProps) {
  const autoId = useId();
  const explicitControlId = htmlFor ?? id ?? extractControlId(children);
  const controlId = explicitControlId ?? autoId;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-baseline justify-between gap-2">
        <Label
          htmlFor={controlId}
          className={cn(
            "text-sm font-medium leading-snug text-foreground",
            labelClassName,
          )}
        >
          {label}
        </Label>
        {labelAction}
        {optional && !labelAction ? <OptionalLabel /> : null}
      </div>
      <div
        className={cn(
          error &&
            "[&_input]:border-destructive/70 [&_select]:border-destructive/70 [&_textarea]:border-destructive/70",
        )}
      >
        {injectControlId(children, controlId)}
      </div>
      {hint && !error && (
        <p className="text-xs leading-relaxed text-muted-foreground">{hint}</p>
      )}
      {error && (
        <p className="text-xs font-medium text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
