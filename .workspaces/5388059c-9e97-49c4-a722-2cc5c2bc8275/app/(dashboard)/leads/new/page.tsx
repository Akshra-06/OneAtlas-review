'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function CreateLeadPage() {
  const router = useRouter();
  const { register, handleSubmit } = useForm();
  const [isSaving, setIsSaving] = useState(false);

  const onSubmit = async (values: unknown) => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        toast.error('Could not create Lead');
        return;
      }

      toast.success('Lead created successfully');
      router.push('/leads');
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <Button variant="ghost" asChild className="gap-2">
        <Link href="/leads">
          <ChevronLeft className="h-4 w-4" />
          Back to Leads
        </Link>
      </Button>

      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Create Lead</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Add a new lead to your system
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6"
      >
        <Card className="shadow-sm">
          <div className="p-6 space-y-6">
            
<div className="grid gap-2">
  <label className="text-sm font-medium">Name</label>
  <Input
    type="text"
    {...register('firstName')}
    placeholder="Enter name"
  />
</div>

<div className="grid gap-2">
  <label className="text-sm font-medium">Name</label>
  <Input
    type="text"
    {...register('lastName')}
    placeholder="Enter name"
  />
</div>

<div className="grid gap-2">
  <label className="text-sm font-medium">Contact Info</label>
  <Input
    type="text"
    {...register('contactInfo')}
    placeholder="Enter contact info..."
  />
</div>

<div className="grid gap-2">
  <label className="text-sm font-medium">Source</label>
  <Input
    type="text"
    {...register('source')}
    placeholder="Enter source..."
  />
</div>

<div className="grid gap-2">
  <label className="text-sm font-medium">Status</label>
  <select
    {...register('status')}
    className="h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/30"
  >
    <option value="">Select status...</option>
    <option value="Lead">Lead</option>
<option value="Qualified">Qualified</option>
<option value="Proposal">Proposal</option>
<option value="Negotiation">Negotiation</option>
<option value="Won">Won</option>
<option value="Lost">Lost</option>
  </select>
</div>

<div className="grid gap-2">
  <label className="text-sm font-medium">Name</label>
  <Input
    type="text"
    {...register('name')}
    placeholder="Enter name"
  />
</div>

<div className="grid gap-2">
  <label className="text-sm font-medium">Email</label>
  <Input
    type="email"
    {...register('email')}
    placeholder="Enter your email address"
  />
</div>

<div className="grid gap-2">
  <label className="text-sm font-medium">Company</label>
  <Input
    type="text"
    {...register('company')}
    placeholder="Enter company name"
  />
</div>

<div className="grid gap-2">
  <label className="text-sm font-medium">Status</label>
  <select
    {...register('stage')}
    className="h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/30"
  >
    <option value="">Select status...</option>
    <option value="Lead">Lead</option>
<option value="Qualified">Qualified</option>
<option value="Proposal">Proposal</option>
<option value="Negotiation">Negotiation</option>
<option value="Won">Won</option>
<option value="Lost">Lost</option>
  </select>
</div>

<div className="grid gap-2">
  <label className="text-sm font-medium">Value</label>
  <Input
    type="text"
    {...register('value')}
    placeholder="Enter value..."
  />
</div>
          </div>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" asChild>
            <Link href="/leads">Cancel</Link>
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'Creating...' : 'Create Lead'}
          </Button>
        </div>
      </form>
    </div>
  );
}
