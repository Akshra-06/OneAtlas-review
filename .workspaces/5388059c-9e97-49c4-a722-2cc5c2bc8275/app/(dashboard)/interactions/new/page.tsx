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

export default function CreateInteractionPage() {
  const router = useRouter();
  const { register, handleSubmit } = useForm();
  const [isSaving, setIsSaving] = useState(false);

  const onSubmit = async (values: unknown) => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/interactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        toast.error('Could not create Interaction');
        return;
      }

      toast.success('Interaction created successfully');
      router.push('/interactions');
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <Button variant="ghost" asChild className="gap-2">
        <Link href="/interactions">
          <ChevronLeft className="h-4 w-4" />
          Back to Interactions
        </Link>
      </Button>

      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Create Interaction</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Add a new interaction to your system
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6"
      >
        <Card className="shadow-sm">
          <div className="p-6 space-y-6">
            
<div className="grid gap-2">
  <label className="text-sm font-medium">Type</label>
  <Input
    type="text"
    {...register('type')}
    placeholder="Enter type..."
  />
</div>

<div className="grid gap-2">
  <label className="text-sm font-medium">Date</label>
  <Input
    type="date"
    {...register('dateTime')}
    placeholder="Select a date"
  />
</div>

<div className="grid gap-2">
  <label className="text-sm font-medium">Description</label>
  <Textarea
    {...register('notes')}
    placeholder="Enter a description..."
    className="min-h-[120px]"
  />
</div>

<div className="grid gap-2">
  <label className="text-sm font-medium">Outcome</label>
  <Input
    type="text"
    {...register('outcome')}
    placeholder="Enter outcome..."
  />
</div>
          </div>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" asChild>
            <Link href="/interactions">Cancel</Link>
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'Creating...' : 'Create Interaction'}
          </Button>
        </div>
      </form>
    </div>
  );
}
