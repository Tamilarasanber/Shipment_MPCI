const LoadingComponent = ({ label = "Loading..." }) => (
  <div className="fixed inset-0 z-40 flex items-center justify-center bg-white/70">
    <div className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-sky-200 border-t-sky-600" />
      <span className="text-sm text-slate-700">{label}</span>
    </div>
  </div>
);

export default LoadingComponent;
