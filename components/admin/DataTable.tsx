"use client";

import { Checkbox } from "@/components/ui/checkbox";

interface DataTableProps<T> {
  data: T[];
  columns: {
    key: string;
    label: string;
    render?: (item: T) => React.ReactNode;
  }[];
  onRowClick?: (item: T) => void;
  selectedRows?: Set<string>;
  onRowSelect?: (id: string) => void;
  onSelectAll?: (selected: boolean) => void;
  loading?: boolean;
  emptyMessage?: string;
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  onRowClick,
  selectedRows,
  onRowSelect,
  onSelectAll,
  loading = false,
  emptyMessage = "No data available",
}: DataTableProps<T>) {
  const allSelected =
    selectedRows && data.length > 0 && selectedRows.size === data.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-border bg-accent/50">
            {onRowSelect && (
              <th className="p-3 text-left w-12">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={(checked) =>
                    onSelectAll?.(checked as boolean)
                  }
                />
              </th>
            )}
            {columns.map((column) => (
              <th
                key={column.key}
                className="p-3 text-left text-sm font-semibold text-foreground"
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr
              key={item.id}
              onClick={() => onRowClick?.(item)}
              className={`border-b border-border hover:bg-accent/50 transition-colors ${
                onRowClick ? "cursor-pointer" : ""
              }`}
            >
              {onRowSelect && (
                <td className="p-3">
                  <Checkbox
                    checked={selectedRows?.has(item.id)}
                    onCheckedChange={() => onRowSelect(item.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </td>
              )}
              {columns.map((column) => (
                <td key={column.key} className="p-3 text-sm text-foreground">
                  {column.render
                    ? column.render(item)
                    : (item as any)[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
