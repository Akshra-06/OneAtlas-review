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

export default function CreateOrganizationPage() {
  const router = useRouter();
  const { register, handleSubmit } = useForm();
  const [isSaving, setIsSaving] = useState(false);

  const onSubmit = async (values: unknown) => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/organizations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        toast.error('Could not create Organization');
        return;
      }

      toast.success('Organization created successfully');
      router.push('/organizations');
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <Button variant="ghost" asChild className="gap-2">
        <Link href="/organizations">
          <ChevronLeft className="h-4 w-4" />
          Back to Organizations
        </Link>
      </Button>

      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Create Organization</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Add a new organization to your system
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
    {...register('name')}
    placeholder="Enter name"
  />
</div>

<div className="grid gap-2">
  <label className="text-sm font-medium">Address</label>
  <Input
    type="text"
    {...register('address')}
    placeholder="Street address"
  />
</div>

<div className="grid gap-2">
  <label className="text-sm font-medium">Phone Number</label>
  <Input
    type="tel"
    {...register('phone')}
    placeholder="+1 (555) 000-0000"
  />
</div>

<div className="grid gap-2">
  <label className="text-sm font-medium">Website</label>
  <Input
    type="url"
    {...register('website')}
    placeholder="https://example.com"
  />
</div>
          </div>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" asChild>
            <Link href="/organizations">Cancel</Link>
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'Creating...' : 'Create Organization'}
          </Button>
        </div>
      </form>
    </div>
  );
}
