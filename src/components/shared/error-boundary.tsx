import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { logger } from "@/lib/logger";

type Props = {
  children: ReactNode;
  fallback?: ReactNode;
};

type State = {
  hasError: boolean;
  message: string;
};

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: "" };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    logger.error("ErrorBoundary", { message: error.message, stack: info.componentStack });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6 text-center">
          <h1 className="text-xl font-semibold">Algo deu errado</h1>
          <p className="max-w-md text-sm text-muted-foreground">{this.state.message}</p>
          <Button type="button" onClick={() => window.location.assign("/")}>
            Voltar ao início
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
