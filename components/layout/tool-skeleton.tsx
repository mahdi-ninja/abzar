export function ToolSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Input side */}
        <div className="space-y-3">
          <div className="h-4 w-24 rounded bg-muted" />
          <div className="h-40 rounded-lg bg-muted" />
        </div>
        {/* Output side */}
        <div className="space-y-3">
          <div className="h-4 w-20 rounded bg-muted" />
          <div className="h-40 rounded-lg bg-muted" />
        </div>
      </div>
    </div>
  );
}
