import { Component } from "react";

export default class AppErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("PM Career OS crashed:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-cloud px-4">
          <div className="glass-panel max-w-xl rounded-[32px] p-8 text-center">
            <div className="inline-flex rounded-full bg-rose-100 px-4 py-2 text-sm font-semibold text-rose-600">
              App error
            </div>
            <h1 className="mt-5 font-display text-3xl font-semibold text-ink dark:text-white">
              Something prevented the dashboard from rendering.
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Refresh the page once. If it still fails, the error details are available in the browser console for debugging.
            </p>
            {this.state.error?.message ? (
              <pre className="mt-6 overflow-auto rounded-3xl bg-slate-950 p-4 text-left text-xs text-slate-100">
                {this.state.error.message}
              </pre>
            ) : null}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
