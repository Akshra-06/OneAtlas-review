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

export default function CreateTaskPage() {
  const router = useRouter();
  const { register, handleSubmit } = useForm();
  const [isSaving, setIsSaving] = useState(false);

  const onSubmit = async (values: unknown) => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        toast.error('Could not create Task');
        return;
      }

      toast.success('Task created successfully');
      router.push('/tasks');
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <Button variant="ghost" asChild className="gap-2">
        <Link href="/tasks">
          <ChevronLeft className="h-4 w-4" />
          Back to Tasks
        </Link>
      </Button>

      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Create Task</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Add a new task to your system
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6"
      >
        <Card className="shadow-sm">
          <div className="p-6 space-y-6">
            
<div className="grid gap-2">
  <label className="text-sm font-medium">Title</label>
  <Input
    type="text"
    {...register('title')}
    placeholder="Enter title"
  />
</div>

<div className="grid gap-2">
  <label className="text-sm font-medium">Description</label>
  <Textarea
    {...register('description')}
    placeholder="Enter a description..."
    className="min-h-[120px]"
  />
</div>

<div className="grid gap-2">
  <label className="text-sm font-medium">Date</label>
  <Input
    type="date"
    {...register('dueDate')}
    placeholder="Select a date"
  />
</div>

<div className="grid gap-2">
  <label className="text-sm font-medium">Status</label>
  <select
    {...register('status')}
    className="h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/30"
  >
    <option value="">Select status...</option>
    <option value="Todo">Todo</option>
<option value="In Progress">In Progress</option>
<option value="In Review">In Review</option>
<option value="Done">Done</option>
<option value="Blocked">Blocked</option>
  </select>
</div>

<div className="grid gap-2">
  <label className="text-sm font-medium">Priority</label>
  <select
    {...register('priority')}
    className="h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/30"
  >
    <option value="">Select priority...</option>
    <option value="Low">Low</option>
<option value="Medium">Medium</option>
<option value="High">High</option>
<option value="Critical">Critical</option>
  </select>
</div>
          </div>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" asChild>
            <Link href="/tasks">Cancel</Link>
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'Creating...' : 'Create Task'}
          </Button>
        </div>
      </form>
    </div>
  );
}
