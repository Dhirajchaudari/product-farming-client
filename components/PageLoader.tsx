interface PageLoaderProps {
  label?: string;
  fullScreen?: boolean;
}

export function PageLoader({ label = "Loading...", fullScreen }: PageLoaderProps) {
  return (
    <div className={fullScreen ? "pageLoader pageLoaderFull" : "pageLoader"} role="status" aria-live="polite">
      <div className="pageLoaderRing" aria-hidden />
      <p>{label}</p>
    </div>
  );
}
