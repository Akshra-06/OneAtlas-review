import type {
  EntitySchema,
  FieldSchema,
  GeneratedFile,
} from '@oneatlas/shared';
import { uxCopy } from '../shared/ux-copy.helper';
import { enumRenderer } from '../shared/enum-renderer';

const EXCLUDED_FIELDS = [
  'id',
  'createdAt',
  'updatedAt',
  'tenantId',
];

/**
 * Generate semantic form field JSX with intelligent enum rendering
 */
const renderField = (field: FieldSchema): string => {
  const label = field.label || uxCopy.toTitleCase(field.name);
  const placeholder = field.placeholder || `Enter ${label.toLowerCase()}...`;
  const helperText = field.helperText ? `<FormDescription>${field.helperText}</FormDescription>` : '';

  switch (field.uiComponent) {
    case 'Textarea':
      return `
<FormField
  control={form.control}
  name="${field.name}"
  render={({ field }) => (
    <FormItem>
      <FormLabel>${label}</FormLabel>
      <FormControl>
        <Textarea 
          placeholder="${placeholder}"
          rows={4} 
          {...field} 
        />
      </FormControl>
      ${helperText}
      <FormMessage />
    </FormItem>
  )}
/>`;

    case 'Switch':
      return `
<FormField
  control={form.control}
  name="${field.name}"
  render={({ field }) => (
    <FormItem className="flex items-center justify-between border rounded-lg p-4">
      <div className="space-y-0.5">
        <FormLabel>${label}</FormLabel>
        ${helperText}
      </div>
      <FormControl>
        <Switch
          checked={field.value}
          onCheckedChange={field.onChange}
        />
      </FormControl>
    </FormItem>
  )}
/>`;

    case 'DatePicker':
      return `
<FormField
  control={form.control}
  name="${field.name}"
  render={({ field }) => (
    <FormItem>
      <FormLabel>${label}</FormLabel>
      <FormControl>
        <Input 
          type="date" 
          placeholder="${placeholder}"
          {...field} 
        />
      </FormControl>
      ${helperText}
      <FormMessage />
    </FormItem>
  )}
/>`;

    case 'NumberInput':
      return `
<FormField
  control={form.control}
  name="${field.name}"
  render={({ field }) => (
    <FormItem>
      <FormLabel>${label}</FormLabel>
      <FormControl>
        <Input 
          type="number" 
          placeholder="${placeholder}"
          ${field.semanticType === 'currency' ? 'step="0.01"' : ''}
          {...field} 
        />
      </FormControl>
      ${helperText}
      <FormMessage />
    </FormItem>
  )}
/>`;

    case 'Select':
      // Generate semantic enum options
      const options = field.enumValues
        ? enumRenderer.generateSelectOptions(field.enumValues, field.name)
        : '<SelectItem value="">Select an option</SelectItem>';

      return `
<FormField
  control={form.control}
  name="${field.name}"
  render={({ field }) => (
    <FormItem>
      <FormLabel>${label}</FormLabel>
      <Select
        onValueChange={field.onChange}
        defaultValue={field.value}
      >
        <FormControl>
          <SelectTrigger>
            <SelectValue placeholder="${placeholder}" />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          ${options}
        </SelectContent>
      </Select>
      ${helperText}
      <FormMessage />
    </FormItem>
  )}
/>`;

    case 'Combobox':
      return `
<FormField
  control={form.control}
  name="${field.name}"
  render={({ field }) => (
    <FormItem>
      <FormLabel>${label}</FormLabel>
      <Popover>
        <PopoverTrigger asChild>
          <FormControl>
            <Button
              variant="outline"
              role="combobox"
              className="w-full justify-between"
            >
              {field.value ? field.value : '${placeholder}'}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </FormControl>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Search..." />
            <CommandEmpty>No options found.</CommandEmpty>
            <CommandGroup>
              {/* Populate with dynamic options */}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
      ${helperText}
      <FormMessage />
    </FormItem>
  )}
/>`;

    default:
      // Intelligent input type based on semantic type
      let inputType = 'text';
      if (field.semanticType === 'email') inputType = 'email';
      if (field.semanticType === 'password') inputType = 'password';
      if (field.semanticType === 'url') inputType = 'url';
      if (field.semanticType === 'phone') inputType = 'tel';

      return `
<FormField
  control={form.control}
  name="${field.name}"
  render={({ field }) => (
    <FormItem>
      <FormLabel>${label}</FormLabel>
      <FormControl>
        <Input 
          type="${inputType}" 
          placeholder="${placeholder}"
          {...field} 
        />
      </FormControl>
      ${helperText}
      <FormMessage />
    </FormItem>
  )}
/>`;
  }
};

export const generateComponent = (
  entity: EntitySchema,
): GeneratedFile => {
  const editableFields = entity.fields.filter(
    (field) => !EXCLUDED_FIELDS.includes(field.name),
  );

  const buttonText = uxCopy.generateButtonText('save', entity.name);

  return {
    filePath: `components/${entity.nameSlug}/${entity.name}Form.tsx`,
    fileType: 'component',
    entityName: entity.name,
    content: `'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
} from '@/components/ui/command';
import { ChevronsUpDown } from 'lucide-react';

export interface ${entity.name}FormProps {
  defaultValues?: Partial<Record<string, unknown>>;
  onSubmit: (data: unknown) => Promise<void>;
  isLoading?: boolean;
}

export function ${entity.name}Form({
  defaultValues,
  onSubmit,
  isLoading = false,
}: ${entity.name}FormProps) {
  const form = useForm({
    defaultValues,
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6"
      >
        ${editableFields.map(renderField).join('\n')}

        <Button
          type="submit"
          disabled={isLoading || form.formState.isSubmitting}
          className="w-full"
        >
          {isLoading ? 'Saving...' : '${buttonText}'}
        </Button>
      </form>
    </Form>
  );
}

export default ${entity.name}Form;
`,
  };
};

export const componentGenerator = {
  generate: generateComponent,
};

export default componentGenerator;