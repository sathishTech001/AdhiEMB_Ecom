export function PageLoader() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-slate-50 dark:bg-dark-bg">
      <div className="flex flex-col items-center space-y-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600"></div>
        <div className="animate-pulse text-lg font-semibold text-primary-600 dark:text-primary-400">
          AdhiEMB...
        </div>
      </div>
    </div>
  );
}
