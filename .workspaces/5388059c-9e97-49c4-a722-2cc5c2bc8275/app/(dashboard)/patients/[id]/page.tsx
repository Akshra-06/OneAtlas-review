'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { ChevronLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function PatientDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const { register, handleSubmit, reset } = useForm();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadRecord = async () => {
      try {
        if (!id) return;
        const response = await fetch('/api/patients/' + id);
        const result = await response.json();
        reset(result.data);
      } catch (error) {
        toast.error('Failed to load record');
      } finally {
        setIsLoading(false);
      }
    };

    void loadRecord();
  }, [id, reset]);

  const onSubmit = async (values: unknown) => {
    setIsSaving(true);
    try {
      if (!id) return;
      const response = await fetch('/api/patients/' + id, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        toast.error('Failed to update record');
        return;
      }

      toast.success('Patient updated successfully');
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="rounded-md border p-8 text-center text-muted-foreground">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <Button variant="ghost" asChild className="gap-2">
        <Link href="/patients">
          <ChevronLeft className="h-4 w-4" />
          Back to Patients
        </Link>
      </Button>

      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Edit Patient</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Update patient details
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
  <label className="text-sm font-medium">Date</label>
  <Input
    type="date"
    {...register('dateOfBirth')}
    placeholder="Select a date"
  />
</div>

<div className="grid gap-2">
  <label className="text-sm font-medium">Gender</label>
  <Input
    type="text"
    {...register('gender')}
    placeholder="Enter gender..."
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
  <label className="text-sm font-medium">Phone Number</label>
  <Input
    type="tel"
    {...register('phone')}
    placeholder="+1 (555) 000-0000"
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
  <label className="text-sm font-medium">Insurance Number</label>
  <Input
    type="text"
    {...register('insuranceNumber')}
    placeholder="Enter insurance number..."
  />
</div>

<div className="flex items-center justify-between gap-4 rounded-xl border bg-background px-4 py-3 shadow-sm">
  <div className="min-w-0">
    <label className="block text-sm font-medium">Is Active</label>
    <p className="mt-1 text-sm text-muted-foreground">Toggle as needed</p>
  </div>
  <input
    type="checkbox"
    {...register('isActive')}
    className="h-4 w-4"
  />
</div>
          </div>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" asChild>
            <Link href="/patients">Cancel</Link>
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Update Patient'}
          </Button>
        </div>
      </form>
    </div>
  );
}
