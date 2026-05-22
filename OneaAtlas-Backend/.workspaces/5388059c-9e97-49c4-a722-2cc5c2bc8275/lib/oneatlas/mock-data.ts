export function getMockDashboard() {
  return {
    kpis: [
      { label: "Active", value: "128", subtext: "Last 7 days" },
      { label: "New", value: "24", subtext: "Today" },
      { label: "Conversion", value: "4.2%", subtext: "This week" },
      { label: "Health", value: "Good", subtext: "No incidents" }
    ],
    activity: [
      { id: "a1", title: "Imported data", time: "2m ago", status: "Success", variant: "success" },
      { id: "a2", title: "Workflow executed", time: "15m ago", status: "Running", variant: "secondary" },
      { id: "a3", title: "User invited", time: "1h ago", status: "Success", variant: "success" }
    ],
    table: {
      columns: [
        { accessorKey: "name", header: "Name" },
        { accessorKey: "status", header: "Status" },
        { accessorKey: "updated", header: "Updated" }
      ],
      data: [
        { id: "r1", name: "Record A", status: "Active", updated: "Today" },
        { id: "r2", name: "Record B", status: "Pending", updated: "Yesterday" },
        { id: "r3", name: "Record C", status: "Archived", updated: "2 days ago" }
      ]
    }
  };
}
