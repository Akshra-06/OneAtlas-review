export const domainConfig = {
  name: 'crm',
  displayName: 'Crm',
} as const;

export const workflowActions = [
  "Create lead",
  "Create deal",
  "Schedule activity",
  "View pipeline"
] as const;

export const workflowMetrics = [
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

export const workflowDefinitions = [
  {
    "name": "Lead Nurturing",
    "description": "Convert leads into customers",
    "steps": [
      "Create lead",
      "Advance stage",
      "Schedule follow-up",
      "Create deal"
    ]
  },
  {
    "name": "Deal Management",
    "description": "Track and manage sales opportunities",
    "steps": [
      "Create deal",
      "Update stage",
      "Add activity",
      "Close deal"
    ]
  },
  {
    "name": "Activity Tracking",
    "description": "Log and track customer interactions",
    "steps": [
      "Log call",
      "Send email",
      "Schedule meeting",
      "Add note"
    ]
  }
];

export function getActionContext(action: string) {
  return {
    name: action,
    domain: 'crm',
    timestamp: new Date().toISOString(),
  };
}

export function isValidAction(action: string): action is typeof workflowActions[number] {
  return workflowActions.includes(action as typeof workflowActions[number]);
}
