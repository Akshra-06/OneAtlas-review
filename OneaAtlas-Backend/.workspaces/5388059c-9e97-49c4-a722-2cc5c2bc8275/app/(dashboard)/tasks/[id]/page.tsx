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

export default function TaskDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const { register, handleSubmit, reset } = useForm();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadRecord = async () => {
      try {
        if (!id) return;
        const response = await fetch('/api/tasks/' + id);
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
      const response = await fetch('/api/tasks/' + id, {
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

      toast.success('Task updated successfully');
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
        <Link href="/tasks">
          <ChevronLeft className="h-4 w-4" />
          Back to Tasks
        </Link>
      </Button>

      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Edit Task</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Update task details
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
            {isSaving ? 'Saving...' : 'Update Task'}
          </Button>
        </div>
      </form>
    </div>
  );
}
