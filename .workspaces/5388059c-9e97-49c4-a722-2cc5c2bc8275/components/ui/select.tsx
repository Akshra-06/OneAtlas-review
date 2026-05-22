import * as React from "react";

export function Select({
  children,
  onValueChange,
  defaultValue,
}: {
  children: React.ReactNode;
  onValueChange?: (value: string) => void;
  defaultValue?: string;
}) {
  return (
    <select
      defaultValue={defaultValue}
      onChange={(event) => onValueChange?.(event.target.value)}
      className="h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/30"
    >
      {children}
    </select>
  );
}

export function SelectContent({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function SelectItem({ value, children }: { value: string; children: React.ReactNode }) {
  return <option value={value}>{children}</option>;
}

export function SelectTrigger({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function SelectValue({ placeholder }: { placeholder?: string }) {
  return <option value="">{placeholder ?? "Select an option"}</option>;
}
