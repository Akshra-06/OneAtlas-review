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

export default function CreateUserPage() {
  const router = useRouter();
  const { register, handleSubmit } = useForm();
  const [isSaving, setIsSaving] = useState(false);

  const onSubmit = async (values: unknown) => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        toast.error('Could not create User');
        return;
      }

      toast.success('User created successfully');
      router.push('/users');
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <Button variant="ghost" asChild className="gap-2">
        <Link href="/users">
          <ChevronLeft className="h-4 w-4" />
          Back to Users
        </Link>
      </Button>

      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Create User</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Add a new user to your system
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6"
      >
        <Card className="shadow-sm">
          <div className="p-6 space-y-6">
            
<div className="grid gap-2">
  <label className="text-sm font-medium">Email</label>
  <Input
    type="email"
    {...register('email')}
    placeholder="Enter your email address"
  />
</div>

<div className="grid gap-2">
  <label className="text-sm font-medium">Name</label>
  <Input
    type="text"
    {...register('fullName')}
    placeholder="Enter name"
  />
</div>

<div className="grid gap-2">
  <label className="text-sm font-medium">Password</label>
  <Input
    type="password"
    {...register('passwordHash')}
    placeholder="Create a secure password"
  />
</div>

<div className="grid gap-2">
  <label className="text-sm font-medium">Role</label>
  <Input
    type="text"
    {...register('role')}
    placeholder="Enter role..."
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
            <Link href="/users">Cancel</Link>
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'Creating...' : 'Create User'}
          </Button>
        </div>
      </form>
    </div>
  );
}
