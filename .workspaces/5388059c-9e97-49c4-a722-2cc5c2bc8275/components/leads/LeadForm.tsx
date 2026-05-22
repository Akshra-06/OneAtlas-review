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

export interface LeadFormProps {
  defaultValues?: Partial<Record<string, unknown>>;
  onSubmit: (data: unknown) => Promise<void>;
  isLoading?: boolean;
}

export function LeadForm({
  defaultValues,
  onSubmit,
  isLoading = false,
}: LeadFormProps) {
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
  name="firstName"
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
  name="lastName"
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
  name="contactInfo"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Contact Info</FormLabel>
      <FormControl>
        <Input 
          type="text" 
          placeholder="Enter contact info..."
          {...field} 
        />
      </FormControl>
      
      <FormMessage />
    </FormItem>
  )}
/>

<FormField
  control={form.control}
  name="source"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Source</FormLabel>
      <FormControl>
        <Input 
          type="text" 
          placeholder="Enter source..."
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
  name="email"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Email</FormLabel>
      <FormControl>
        <Input 
          type="email" 
          placeholder="Enter your email address"
          {...field} 
        />
      </FormControl>
      <FormDescription>We'll use this to contact you</FormDescription>
      <FormMessage />
    </FormItem>
  )}
/>

<FormField
  control={form.control}
  name="company"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Company</FormLabel>
      <FormControl>
        <Input 
          type="text" 
          placeholder="Enter company name"
          {...field} 
        />
      </FormControl>
      
      <FormMessage />
    </FormItem>
  )}
/>

<FormField
  control={form.control}
  name="stage"
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
  name="value"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Value</FormLabel>
      <FormControl>
        <Input 
          type="text" 
          placeholder="Enter value..."
          {...field} 
        />
      </FormControl>
      
      <FormMessage />
    </FormItem>
  )}
/>

        <Button
          type="submit"
          disabled={isLoading || form.formState.isSubmitting}
          className="w-full"
        >
          {isLoading ? 'Saving...' : 'Save Lead'}
        </Button>
      </form>
    </Form>
  );
}

export default LeadForm;
