'use client';

import Link from 'next/link';
import { useEffect, useState, useMemo } from 'react';
import { Plus } from 'lucide-react';

import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

const columns = [
{
    accessorKey: 'firstName',
    header: 'Name',
  },
{
    accessorKey: 'lastName',
    header: 'Name',
  },
{
    accessorKey: 'specialty',
    header: 'Specialty',
  },
{
    accessorKey: 'email',
    header: 'Email',
  }
];

const getMockData = () => Array.from({ length: 8 }).map((_, idx) => ({
  id: String(idx + 1),
  firstName: `Name ${idx + 1}`,
  lastName: `Name ${idx + 1}`,
  specialty: `Specialty ${idx + 1}`,
  email: `Email ${idx + 1}`,
}));

export default function ProvidersPage() {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [search, setSearch] = useState('');
  const mockData = useMemo(() => getMockData(), []);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setIsError(false);
      setIsLoading(true);
      try {
        const url = new URL('/api/providers', window.location.origin);
        if (search.trim()) url.searchParams.set('search', search.trim());
        const response = await fetch(url.toString());
        const result = await response.json();
        if (active) setData(result.data ?? []);
      } catch {
        if (active) {
          setIsError(true);
          setData(mockData);
        }
      } finally {
        if (active) setIsLoading(false);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, [search]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Providers</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your providers
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Input
            placeholder="Search providers…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="sm:w-64"
          />

          <Button asChild>
            <Link href="/providers/new" className="gap-2">
              <Plus className="h-4 w-4" />
              Create Provider
            </Link>
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 flex-1" />
              </div>
            ))}
          </div>
        </div>
      ) : isError ? (
        <div className="space-y-3">
          <div className="rounded-xl border bg-background p-4 text-sm text-muted-foreground">
            Showing mock data to keep preview stable.
          </div>
          <DataTable columns={columns} data={data} />
        </div>
      ) : data.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-background p-10 text-center shadow-sm">
          <p className="text-base font-semibold">
            No provider yet. Create your first one 
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            No provider yet. Create your first one to get started.
          </p>
          <Button asChild className="mt-6">
            <Link href="/providers/new">
              Create Your First Provider
            </Link>
          </Button>
        </div>
      ) : (
        <DataTable columns={columns} data={data} />
      )}
    </div>
  );
}
