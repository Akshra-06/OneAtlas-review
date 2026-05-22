export default function NotFound() {
  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-6">
      <div className="max-w-md w-full rounded-xl border bg-background p-6 shadow-sm">
        <h1 className="text-xl font-semibold">Not Found</h1>
        <p className="mt-2 text-sm text-muted-foreground">This page does not exist.</p>
      </div>
    </div>
  );
}
