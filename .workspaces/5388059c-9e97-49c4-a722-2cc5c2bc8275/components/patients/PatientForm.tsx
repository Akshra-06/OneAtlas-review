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

export interface PatientFormProps {
  defaultValues?: Partial<Record<string, unknown>>;
  onSubmit: (data: unknown) => Promise<void>;
  isLoading?: boolean;
}

export function PatientForm({
  defaultValues,
  onSubmit,
  isLoading = false,
}: PatientFormProps) {
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
  name="dateOfBirth"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Date</FormLabel>
      <FormControl>
        <Input 
          type="date" 
          placeholder="Select a date"
          {...field} 
        />
      </FormControl>
      <FormDescription>Use YYYY-MM-DD format</FormDescription>
      <FormMessage />
    </FormItem>
  )}
/>

<FormField
  control={form.control}
  name="gender"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Gender</FormLabel>
      <FormControl>
        <Input 
          type="text" 
          placeholder="Enter gender..."
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
  name="insuranceNumber"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Insurance Number</FormLabel>
      <FormControl>
        <Input 
          type="text" 
          placeholder="Enter insurance number..."
          {...field} 
        />
      </FormControl>
      
      <FormMessage />
    </FormItem>
  )}
/>

<FormField
  control={form.control}
  name="isActive"
  render={({ field }) => (
    <FormItem className="flex items-center justify-between border rounded-lg p-4">
      <div className="space-y-0.5">
        <FormLabel>Is Active</FormLabel>
        
      </div>
      <FormControl>
        <Switch
          checked={field.value}
          onCheckedChange={field.onChange}
        />
      </FormControl>
    </FormItem>
  )}
/>

        <Button
          type="submit"
          disabled={isLoading || form.formState.isSubmitting}
          className="w-full"
        >
          {isLoading ? 'Saving...' : 'Save Patient'}
        </Button>
      </form>
    </Form>
  );
}

export default PatientForm;
