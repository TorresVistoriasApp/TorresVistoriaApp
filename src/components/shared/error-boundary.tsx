import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { hardReloadApp, isChunkLoadError } from "@/lib/chunk-load-recovery";
import { logger } from "@/lib/logger";

type Props = {
  children: ReactNode;
  fallback?: ReactNode;
};

type State = {
  hasError: boolean;
  message: string;
  isChunkError: boolean;
};

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: "", isChunkError: false };

  static getDerivedStateFromError(error: Error): State {
    const isChunkError = isChunkLoadError(error);
    return {
      hasError: true,
      isChunkError,
      message: isChunkError
        ? "Uma nova versão do aplicativo foi publicada. Atualize a página para continuar."
        : error.message,
    };
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
          <div className="flex flex-col gap-2 sm:flex-row">
            {this.state.isChunkError ? (
              <Button type="button" onClick={hardReloadApp}>
                Atualizar aplicativo
              </Button>
            ) : (
              <Button type="button" onClick={() => window.location.assign("/")}>
                Voltar ao início
              </Button>
            )}
            {!this.state.isChunkError && (
              <Button type="button" variant="outline" onClick={hardReloadApp}>
                Recarregar página
              </Button>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
