'use client';

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

export interface OrganizationFormProps {
  defaultValues?: Partial<Record<string, unknown>>;
  onSubmit: (data: unknown) => Promise<void>;
  isLoading?: boolean;
}

export function OrganizationForm({
  defaultValues,
  onSubmit,
  isLoading = false,
}: OrganizationFormProps) {
  const form = useForm({
    defaultValues,
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6"
      >
        
<FormField
  control={form.control}
  name="name"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Name</FormLabel>
      <FormControl>
        <Input 
          type="text" 
          placeholder="Enter name"
          {...field} 
        />
      </FormControl>
      
      <FormMessage />
    </FormItem>
  )}
/>

<FormField
  control={form.control}
  name="address"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Address</FormLabel>
      <FormControl>
        <Input 
          type="text" 
          placeholder="Street address"
          {...field} 
        />
      </FormControl>
      
      <FormMessage />
    </FormItem>
  )}
/>

<FormField
  control={form.control}
  name="phone"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Phone Number</FormLabel>
      <FormControl>
        <Input 
          type="tel" 
          placeholder="+1 (555) 000-0000"
          {...field} 
        />
      </FormControl>
      <FormDescription>Used for account recovery</FormDescription>
      <FormMessage />
    </FormItem>
  )}
/>

<FormField
  control={form.control}
  name="website"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Website</FormLabel>
      <FormControl>
        <Input 
          type="url" 
          placeholder="https://example.com"
          {...field} 
        />
      </FormControl>
      <FormDescription>Including http:// or https://</FormDescription>
      <FormMessage />
    </FormItem>
  )}
/>

        <Button
          type="submit"
          disabled={isLoading || form.formState.isSubmitting}
          className="w-full"
        >
          {isLoading ? 'Saving...' : 'Save Organization'}
        </Button>
      </form>
    </Form>
  );
}

export default OrganizationForm;
