interface FormErrorProps {
  message: string;
}

export function FormError({ message }: FormErrorProps) {
  return (
    <p
      className="rounded-lg border border-destructive-border bg-destructive-subtle px-3 py-2 text-sm text-destructive"
      role="alert"
    >
      {message}
    </p>
  );
}
