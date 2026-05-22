'use client';

import Link from 'next/link';
import {
  Activity,
  ArrowRight,
  BarChart3,
  Clock,
  Sparkles,
  TrendingUp,
} from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const metrics = [
  {
    "label": "Active Leads",
    "description": "New opportunities in pipeline"
  },
  {
    "label": "Pipeline Value",
    "description": "Total weighted revenue"
  },
  {
    "label": "Conversion Rate",
    "description": "Leads to deals ratio"
  },
  {
    "label": "Activities This Week",
    "description": "Team engagement metric"
  }
] as const;
const actions = [
  "Create lead",
  "Create deal",
  "Schedule activity",
  "View pipeline"
] as const;
const entityCards = [
  {
    "label": "Users",
    "href": "/users",
    "fields": [
      "Email",
      "Name",
      "Password",
      "Role"
    ]
  },
  {
    "label": "Organizations",
    "href": "/organizations",
    "fields": [
      "Name",
      "Address",
      "Phone Number",
      "Website"
    ]
  },
  {
    "label": "Patients",
    "href": "/patients",
    "fields": [
      "Name",
      "Name",
      "Date",
      "Gender"
    ]
  },
  {
    "label": "Providers",
    "href": "/providers",
    "fields": [
      "Name",
      "Name",
      "Specialty",
      "Email"
    ]
  },
  {
    "label": "Appointments",
    "href": "/appointments",
    "fields": [
      "Scheduled At",
      "Status",
      "Reason",
      "Description"
    ]
  },
  {
    "label": "Leads",
    "href": "/leads",
    "fields": [
      "name",
      "company",
      "email",
      "stage",
      "value"
    ]
  },
  {
    "label": "Interactions",
    "href": "/interactions",
    "fields": [
      "Type",
      "Date",
      "Description",
      "Outcome"
    ]
  },
  {
    "label": "Tasks",
    "href": "/tasks",
    "fields": [
      "Title",
      "Description",
      "Date",
      "Status"
    ]
  }
] as const;

const activitySeed = [
  { icon: Activity, label: 'System sync completed', time: 'Just now' },
  { icon: TrendingUp, label: 'KPI snapshot updated', time: '2h ago' },
  { icon: Clock, label: 'Workflow queued', time: 'Today' },
] as const;

export default function DashboardHomePage() {
  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5" />
            crm overview
          </div>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Dashboard
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
            Key metrics, activity, and shortcuts for crm operations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline">Export</Button>
          <Button>New workflow</Button>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        {metrics.slice(0, 6).map((metric, index) => (
          <Card key={metric.label} className="shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {metric.label}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {metric.description}
                  </CardDescription>
                </div>
                <div className="rounded-lg border bg-muted/40 p-2">
                  {index % 2 === 0 ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <BarChart3 className="h-4 w-4" />
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold tracking-tight">—</div>
              <p className="mt-2 text-xs text-muted-foreground">
                Updates in real time when connected.
              </p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle>Analytics</CardTitle>
                <CardDescription>Performance snapshot</CardDescription>
              </div>
              <Badge variant="secondary">Last 30 days</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative h-56 overflow-hidden rounded-xl border bg-muted/20">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
              <div className="absolute inset-0 flex items-end gap-2 p-4">
                {Array.from({ length: 14 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-full rounded-md bg-primary/20"
                    style={{ height: 20 + ((i * 13) % 70) }}
                  />
                ))}
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Replace this placeholder with your charting library when ready.
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle>Recent activity</CardTitle>
            <CardDescription>Latest events</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {activitySeed.map((item) => (
              <div key={item.label} className="flex items-start gap-3">
                <div className="mt-0.5 rounded-lg border bg-muted/40 p-2">
                  <item.icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <Separator />

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold tracking-tight">
              Operational records
            </h2>
            <p className="text-sm text-muted-foreground">
              Your core data models for crm.
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href={entityCards[0]?.href ?? '/'}>View all</Link>
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {entityCards.map((entity, index) => (
            <Link key={entity.href} href={entity.href}>
              <Card className="group h-full cursor-pointer shadow-sm transition-colors hover:bg-muted/40">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle className="text-base">{entity.label}</CardTitle>
                      <CardDescription className="mt-1">
                        View and manage records
                      </CardDescription>
                    </div>
                    <Badge variant={index % 3 === 0 ? 'success' : 'secondary'}>
                      Active
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {entity.fields && entity.fields.length > 0 ? (
                    <div className="space-y-1">
                      {entity.fields.slice(0, 3).map((field, idx) => (
                        <p
                          key={idx}
                          className="text-xs text-muted-foreground truncate"
                        >
                          • {field}
                        </p>
                      ))}
                    </div>
                  ) : null}

                  <div className="flex items-center justify-between rounded-lg border bg-background px-3 py-2">
                    <span className="text-sm font-medium">Open</span>
                    <ArrowRight className="h-4 w-4 opacity-70 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold tracking-tight">Quick actions</h2>
          <p className="text-sm text-muted-foreground">
            Shortcuts to common workflows.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {actions.map((action) => (
            <Button
              key={action}
              variant="outline"
              className="h-auto justify-start whitespace-normal rounded-xl p-4 text-left"
            >
              <span className="flex w-full flex-col gap-1">
                <span className="font-medium">{action}</span>
                <span className="text-xs text-muted-foreground">
                  Execute workflow
                </span>
              </span>
              <ArrowRight className="ml-auto h-4 w-4 opacity-60" />
            </Button>
          ))}
        </div>
      </section>

      
      <section className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold tracking-tight">Workflows</h2>
          <p className="text-sm text-muted-foreground">
            Domain-specific business processes.
          </p>
        </div>

        <div className="grid gap-4">
          
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Lead Nurturing</CardTitle>
              <CardDescription>Convert leads into customers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                
                <Badge variant="secondary">
                  Create lead
                </Badge>
                
                <Badge variant="secondary">
                  Advance stage
                </Badge>
                
                <Badge variant="secondary">
                  Schedule follow-up
                </Badge>
                
                <Badge variant="secondary">
                  Create deal
                </Badge>
                
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Deal Management</CardTitle>
              <CardDescription>Track and manage sales opportunities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                
                <Badge variant="secondary">
                  Create deal
                </Badge>
                
                <Badge variant="secondary">
                  Update stage
                </Badge>
                
                <Badge variant="secondary">
                  Add activity
                </Badge>
                
                <Badge variant="secondary">
                  Close deal
                </Badge>
                
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Activity Tracking</CardTitle>
              <CardDescription>Log and track customer interactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                
                <Badge variant="secondary">
                  Log call
                </Badge>
                
                <Badge variant="secondary">
                  Send email
                </Badge>
                
                <Badge variant="secondary">
                  Schedule meeting
                </Badge>
                
                <Badge variant="secondary">
                  Add note
                </Badge>
                
              </div>
            </CardContent>
          </Card>
          
        </div>
      </section>
      
    </div>
  );
}
