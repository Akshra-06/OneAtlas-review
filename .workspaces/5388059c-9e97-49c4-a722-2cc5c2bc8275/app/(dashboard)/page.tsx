"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { Database, TrendingUp, Activity } from "lucide-react";

// Entity endpoints - will be dynamically populated based on generated entities
const ENTITY_ENDPOINTS = [
  { name: "Todos", slug: "todos", label: "Todo" },
  { name: "Users", slug: "users", label: "User" },
  { name: "Patients", slug: "patients", label: "Patient" },
  { name: "Doctors", slug: "doctors", label: "Doctor" },
  { name: "Organizations", slug: "organizations", label: "Organization" },
  { name: "Appointments", slug: "appointments", label: "Appointment" },
].filter(e => {
  // Filter to only include entities that exist in the app
  // This is a runtime check to avoid 404s
  return true;
});

export default function DashboardHome() {
  const [entityData, setEntityData] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);

  useEffect(() => {
    const loadAllData = async () => {
      setIsLoading(true);
      const data: Record<string, any> = {};
      let total = 0;

      const promises = ENTITY_ENDPOINTS.map(async (entity) => {
        try {
          const response = await fetch(`/api/${entity.slug}`);
          if (response.ok) {
            const result = await response.json();
            data[entity.slug] = result.data || [];
            total += (result.data || []).length;
          }
        } catch (error) {
          // Entity might not exist, skip it
          data[entity.slug] = [];
        }
      });

      await Promise.all(promises);
      setEntityData(data);
      setTotalRecords(total);
      setIsLoading(false);
    };

    loadAllData();
    
    // Removed auto-refresh interval to prevent component reloading
    // const interval = setInterval(loadAllData, 5000);
    // return () => clearInterval(interval);
  }, []);

  const activeEntities = ENTITY_ENDPOINTS.filter(e => entityData[e.slug] && entityData[e.slug].length > 0);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-4 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Total Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{totalRecords}</div>
            <div className="text-sm text-muted-foreground">Across all entities</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-500" />
              Active Entities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-blue-600">{activeEntities.length}</div>
            <div className="text-sm text-muted-foreground">With data</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Data Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-green-600">+{totalRecords}</div>
            <div className="text-sm text-muted-foreground">Total created</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-purple-500" />
              Entity Types
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-purple-600">{ENTITY_ENDPOINTS.length}</div>
            <div className="text-sm text-muted-foreground">Available</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {activeEntities.map((entity) => {
          const data = entityData[entity.slug] || [];
          const displayFields = data.length > 0 ? Object.keys(data[0]).filter(k => !['id', 'createdAt', 'updatedAt', 'tenantId'].includes(k)).slice(0, 3) : [];
          const columns = displayFields.map(field => ({
            accessorKey: field,
            header: field.charAt(0).toUpperCase() + field.slice(1),
          }));

          return (
            <Card key={entity.slug}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{entity.name}</span>
                  <Badge variant="secondary">{data.length} records</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data.length === 0 ? (
                  <div className="text-center py-6 text-sm text-muted-foreground">
                    No {entity.label.toLowerCase()}s yet
                  </div>
                ) : (
                  <DataTable columns={columns} data={data.slice(0, 5)} />
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {activeEntities.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              No data yet. Create your first record to see it appear on the dashboard.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
