export function Toast({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div className="fixed bottom-5 right-5 z-50 rounded-lg border border-emerald-200 bg-white px-4 py-3 text-sm font-semibold text-emerald-700 shadow-glow dark:border-emerald-400/30 dark:bg-slate-900 dark:text-emerald-200">
      {message}
    </div>
  );
}
