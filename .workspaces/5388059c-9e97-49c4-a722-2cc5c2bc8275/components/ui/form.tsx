import * as React from "react";
import { Controller, FormProvider, type UseFormReturn } from "react-hook-form";

export function Form({ children, ...props }: { children: React.ReactNode } & UseFormReturn<any>) {
  return <FormProvider {...props}>{children}</FormProvider>;
}

export function FormControl({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function FormField({
  name,
  control,
  render,
}: {
  control: unknown;
  name: string;
  render: (props: { field: any; fieldState: any }) => React.ReactNode;
}) {
  return <Controller name={name} control={control as any} render={({ field, fieldState }) => render({ field, fieldState })} />;
}

export function FormItem({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={className ?? "space-y-2"}>{children}</div>;
}

export function FormLabel({ children }: { children: React.ReactNode }) {
  return <label className="text-sm font-medium">{children}</label>;
}

export function FormDescription({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-muted-foreground">{children}</p>;
}

export function FormMessage() {
  return null;
}
