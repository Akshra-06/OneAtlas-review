export interface DataTableColumn<TData> {
  accessorKey: keyof TData | string;
  header: string;
}

export function DataTable<TData extends Record<string, unknown>>({
  columns,
  data,
}: {
  columns: DataTableColumn<TData>[];
  data: TData[];
}) {
  return (
    <div className="overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm">
      <table className="w-full text-sm">
        <thead className="bg-muted/40 text-left">
          <tr>
            {columns.map((column) => (
              <th
                key={String(column.accessorKey)}
                className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground"
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={String((row as any).id ?? index)} className="border-t transition-colors hover:bg-muted/40">
              {columns.map((column) => (
                <td key={String(column.accessorKey)} className="px-4 py-3">
                  {String((row as any)[column.accessorKey] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
