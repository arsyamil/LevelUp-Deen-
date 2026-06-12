export default function AppSectionLoading() {
  return (
    <div className="space-y-4">
      <div className="h-28 animate-pulse rounded-2xl border border-line bg-bg-soft" />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="h-36 animate-pulse rounded-2xl border border-line bg-bg-soft" />
        <div className="h-36 animate-pulse rounded-2xl border border-line bg-bg-soft" />
      </div>
      <div className="h-64 animate-pulse rounded-2xl border border-line bg-bg-soft" />
    </div>
  );
}
