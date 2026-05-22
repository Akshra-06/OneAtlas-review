export type ShellNavItem = { label: string; href: string; icon: string };

export function getShellConfig(): { appName: string; sidebarNav: ShellNavItem[] } {
  return {
    appName: "Health Care Crm",
    sidebarNav: [
  {
    "label": "Dashboard",
    "href": "/",
    "icon": "Layout"
  },
  {
    "label": "Workflows",
    "href": "/workflows",
    "icon": "CheckSquare"
  },
  {
    "label": "Users",
    "href": "/users",
    "icon": "Users"
  },
  {
    "label": "Organizations",
    "href": "/organizations",
    "icon": "Circle"
  },
  {
    "label": "Patients",
    "href": "/patients",
    "icon": "Circle"
  },
  {
    "label": "Providers",
    "href": "/providers",
    "icon": "Circle"
  },
  {
    "label": "Appointments",
    "href": "/appointments",
    "icon": "Circle"
  },
  {
    "label": "Leads",
    "href": "/leads",
    "icon": "Circle"
  },
  {
    "label": "Interactions",
    "href": "/interactions",
    "icon": "Circle"
  },
  {
    "label": "Tasks",
    "href": "/tasks",
    "icon": "CheckSquare"
  }
]
  };
}
