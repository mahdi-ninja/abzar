"use client";

import React from "react";
import { Button } from "@/components/ui/button";

interface Props {
  toolSlug: string;
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ToolErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`Tool "${this.props.toolSlug}" crashed:`, error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  handleResetAndRetry = () => {
    try {
      const prefix = `abzar:${this.props.toolSlug}:`;
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(prefix)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((key) => localStorage.removeItem(key));
    } catch { /* ignore */ }
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-6 text-center">
          <p className="text-sm font-medium text-destructive mb-1">
            Something went wrong with this tool.
          </p>
          <p className="text-xs text-muted-foreground mb-4">
            The error has been logged. You can try again or reset the tool.
          </p>

          <div className="flex items-center justify-center gap-2 mb-4">
            <Button size="sm" onClick={this.handleRetry}>
              Try Again
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={this.handleResetAndRetry}
            >
              Reset &amp; Try Again
            </Button>
          </div>

          {this.state.error && (
            <details className="text-start text-xs">
              <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                Error details
              </summary>
              <pre className="mt-2 overflow-auto rounded bg-muted p-2 text-[11px]">
                {this.state.error.message}
                {this.state.error.stack && `\n\n${this.state.error.stack}`}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
