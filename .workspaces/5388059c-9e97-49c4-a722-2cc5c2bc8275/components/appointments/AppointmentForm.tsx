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

export interface AppointmentFormProps {
  defaultValues?: Partial<Record<string, unknown>>;
  onSubmit: (data: unknown) => Promise<void>;
  isLoading?: boolean;
}

export function AppointmentForm({
  defaultValues,
  onSubmit,
  isLoading = false,
}: AppointmentFormProps) {
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
  name="scheduledAt"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Scheduled At</FormLabel>
      <FormControl>
        <Input 
          type="date" 
          placeholder="Enter scheduled at..."
          {...field} 
        />
      </FormControl>
      
      <FormMessage />
    </FormItem>
  )}
/>

<FormField
  control={form.control}
  name="status"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Status</FormLabel>
      <Select
        onValueChange={field.onChange}
        defaultValue={field.value}
      >
        <FormControl>
          <SelectTrigger>
            <SelectValue placeholder="Select a status" />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          <SelectItem value="">Select an option</SelectItem>
        </SelectContent>
      </Select>
      <FormDescription>Current state of this item</FormDescription>
      <FormMessage />
    </FormItem>
  )}
/>

<FormField
  control={form.control}
  name="reason"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Reason</FormLabel>
      <FormControl>
        <Input 
          type="text" 
          placeholder="Enter reason..."
          {...field} 
        />
      </FormControl>
      
      <FormMessage />
    </FormItem>
  )}
/>

<FormField
  control={form.control}
  name="notes"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Description</FormLabel>
      <FormControl>
        <Textarea 
          placeholder="Enter a description..."
          rows={4} 
          {...field} 
        />
      </FormControl>
      <FormDescription>Provide details</FormDescription>
      <FormMessage />
    </FormItem>
  )}
/>

        <Button
          type="submit"
          disabled={isLoading || form.formState.isSubmitting}
          className="w-full"
        >
          {isLoading ? 'Saving...' : 'Save Appointment'}
        </Button>
      </form>
    </Form>
  );
}

export default AppointmentForm;
