# Before & After: Code Generation Examples

## Example 1: Form Component Generation

### Before (Generic Scaffolding)

**Input**:
```typescript
Entity: Product
Fields: [
  { name: "name", type: "string" },
  { name: "price", type: "float" },
  { name: "status", type: "string" },
  { name: "description", type: "string" }
]
```

**Generated Code** ❌:
```jsx
export function ProductForm({ defaultValues, onSubmit }: ProductFormProps) {
  const form = useForm({ defaultValues });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* name field */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>name</FormLabel>
              <FormControl>
                <Input type="text" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* price field */}
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>price</FormLabel>
              <FormControl>
                <Input type="text" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* status field - GENERIC! */}
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="option-1">Option 1</SelectItem>
                  <SelectItem value="option-2">Option 2</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* description field */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>description</FormLabel>
              <FormControl>
                <Input type="text" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <button type="submit" className="bg-black text-white px-4 py-2 rounded-md">
          Save Product
        </button>
      </form>
    </Form>
  );
}
```

**Issues**:
- ❌ Field labels are lowercase: "name", "price"
- ❌ "price" field rendered as text input (should be number with step)
- ❌ "description" rendered as text input (should be textarea)
- ❌ "status" shows "Option 1", "Option 2" (not semantic!)
- ❌ No placeholders or help text
- ❌ No semantic input types

### After (Schema-Aware Synthesis)

**Input** (same, but with semantic metadata):
```typescript
Entity: Product
Fields: [
  { 
    name: "name", 
    type: "string",
    label: "Product Name",
    placeholder: "Enter product name...",
    helperText: "The display name for this product"
  },
  { 
    name: "price", 
    type: "float",
    semanticType: "currency",
    label: "Price",
    placeholder: "0.00",
    helperText: "Price in USD"
  },
  { 
    name: "status", 
    type: "string",
    enumValues: ["draft", "active", "archived"],
    semanticType: "status",
    label: "Status"
  },
  { 
    name: "description", 
    type: "string",
    semanticType: "description",
    label: "Description",
    placeholder: "Describe your product...",
    helperText: "Provide details about this product"
  }
]
```

**Generated Code** ✅:
```jsx
export function ProductForm({ defaultValues, onSubmit, isLoading = false }: ProductFormProps) {
  const form = useForm({ defaultValues });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Product Name - Semantic text input */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Name</FormLabel>
              <FormControl>
                <Input 
                  type="text" 
                  placeholder="Enter product name..."
                  {...field} 
                />
              </FormControl>
              <FormDescription>The display name for this product</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Price - Semantic currency input */}
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  step="0.01"
                  placeholder="0.00"
                  {...field} 
                />
              </FormControl>
              <FormDescription>Price in USD</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Status - Semantic enum select */}
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description - Semantic textarea */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe your product..."
                  rows={4} 
                  {...field} 
                />
              </FormControl>
              <FormDescription>Provide details about this product</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={isLoading || form.formState.isSubmitting}
          className="w-full"
        >
          {isLoading ? 'Saving...' : 'Save Product'}
        </Button>
      </form>
    </Form>
  );
}
```

**Improvements**:
- ✅ Proper Title Case labels: "Product Name", "Price", "Status"
- ✅ Semantic input types: number for currency, textarea for description
- ✅ Smart enum options: "Draft", "Active", "Archived" (not "Option 1")
- ✅ Intelligent placeholders: "Enter product name...", "0.00"
- ✅ Contextual help text explaining each field
- ✅ Better accessibility and user guidance

---

## Example 2: List Page Generation

### Before (Generic)

```jsx
const columns = [
  {
    accessorKey: 'name',
    header: 'name',
  },
  {
    accessorKey: 'price',
    header: 'price',
  },
  {
    accessorKey: 'status',
    header: 'status',
  },
];

export default function ProductsPage() {
  const { data = [] } = useQuery({ ... });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Products</h1>
        <Link href="./product/new" className="bg-black text-white px-4 py-2 rounded-md">
          New Product
        </Link>
      </div>

      {data.length === 0 ? (
        <div className="rounded-md border p-8 text-center">
          <p className="font-medium">No products yet</p>
          <p className="text-sm text-muted-foreground">
            Create the first record to start using this workflow.
          </p>
        </div>
      ) : (
        <DataTable columns={columns} data={data} />
      )}
    </div>
  );
}
```

### After (Schema-Aware)

```jsx
const columns = [
  {
    accessorKey: 'name',
    header: 'Product Name',      // ← Semantic label
  },
  {
    accessorKey: 'price',
    header: 'Price',             // ← Semantic label
  },
  {
    accessorKey: 'status',
    header: 'Status',            // ← Semantic label
  },
];

export default function ProductsPage() {
  const { data = [], isLoading, isError } = useQuery({ ... });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your product inventory
          </p>
        </div>
        <Button asChild>
          <Link href="./product/new" className="gap-2">
            <Plus className="h-4 w-4" />
            Create Product
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="rounded-md border p-8 text-sm text-muted-foreground">
          Loading products...
        </div>
      ) : isError ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-8 text-sm text-red-700">
          Unable to load products. Please try again.
        </div>
      ) : data.length === 0 ? (
        <div className="rounded-md border border-dashed p-8 text-center">
          <p className="font-medium">No products yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Create the first product to get started.
          </p>
          <Button asChild className="mt-4">
            <Link href="./product/new">
              Create Your First Product
            </Link>
          </Button>
        </div>
      ) : (
        <DataTable columns={columns} data={data} />
      )}
    </div>
  );
}
```

**Improvements**:
- ✅ Semantic column headers (Title Case)
- ✅ Page description for context
- ✅ Better loading and error states
- ✅ Improved empty state UX
- ✅ Semantic button text: "Create Product"

---

## Example 3: Validation Generation

### Before (Generic)

```typescript
import { z } from 'zod';

export const ProductCreateSchema = z.object({
  name: z.string(),
  price: z.string(),  // ❌ Wrong type!
  status: z.string(),
  description: z.string(),
});
```

### After (Semantic)

```typescript
import { z } from 'zod';

/**
 * Validation schema for Product
 * Auto-generated with semantic intelligence
 */

export const ProductCreateSchema = z.object({
  name: z.string().min(1, "Must be at least 1 character"),
  price: z.coerce.number(),                    // ✅ Correct type
  status: z.enum(['draft', 'active', 'archived']),  // ✅ Semantic enum
  description: z.string().max(2000, "Must be no more than 2000 characters"),
});

export const ProductUpdateSchema = ProductCreateSchema.partial();

export type ProductCreateInput = z.infer<typeof ProductCreateSchema>;
export type ProductUpdateInput = z.infer<typeof ProductUpdateSchema>;

/**
 * Helper to validate Product data
 */
export async function validateProduct(data: unknown) {
  try {
    return await ProductCreateSchema.parseAsync(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.flatten().fieldErrors,
      };
    }
    throw error;
  }
}
```

**Improvements**:
- ✅ Correct Prisma types (number, not string for price)
- ✅ Semantic enum validation
- ✅ Min/max validation from metadata
- ✅ Semantic error messages
- ✅ Helper validation function

---

## Example 4: Dashboard Generation

### Before (Operations Domain)

```jsx
const metrics = [
  { label: 'Active records', description: 'Operational records currently in use' },
  { label: 'Pending actions', description: 'Workflow items waiting for review' },
  { label: 'Recent updates', description: 'Changes made across the app' },
];
const actions = ['Create record', 'Review queue', 'Export report'];
```

### After (CRM Domain Detected)

```jsx
/**
 * CRM Domain Dashboard
 * Auto-generated with semantic intelligence
 */

const metrics = [
  { label: 'New leads', description: 'Recently captured opportunities' },
  { label: 'Pipeline value', description: 'Total weighted revenue' },
  { label: 'Conversion rate', description: 'Leads to deals ratio' },
  { label: 'Activities this week', description: 'Team engagement metric' },
];

const actions = [
  'Create lead',
  'Create deal',
  'Schedule activity',
  'View pipeline',
];

const workflows = [
  {
    name: 'Lead Nurturing',
    description: 'Convert leads into customers',
    steps: ['Create lead', 'Advance stage', 'Schedule follow-up', 'Create deal'],
  },
  {
    name: 'Deal Management',
    description: 'Track and manage sales opportunities',
    steps: ['Create deal', 'Update stage', 'Add activity', 'Close deal'],
  },
];
```

**Dashboard Rendering**:
```jsx
<div className="space-y-8">
  {/* CRM-Specific Metrics */}
  <section className="grid gap-4 md:grid-cols-3">
    {metrics.map((metric) => (
      <Card key={metric.label}>
        <CardHeader>
          <CardTitle>{metric.label}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">—</div>
          <p className="text-xs text-muted-foreground">{metric.description}</p>
        </CardContent>
      </Card>
    ))}
  </section>

  {/* CRM Entity Cards */}
  <section>
    <div className="grid gap-4 md:grid-cols-3">
      {/* Lead Card */}
      <Card>
        <CardHeader>
          <CardTitle>Leads</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <p>• name</p>
            <p>• company</p>
            <p>• email</p>
          </div>
        </CardContent>
      </Card>

      {/* Deal Card */}
      <Card>
        <CardHeader>
          <CardTitle>Deals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <p>• name</p>
            <p>• value</p>
            <p>• stage</p>
          </div>
        </CardContent>
      </Card>
      {/* ... more cards ... */}
    </div>
  </section>

  {/* CRM-Specific Workflows */}
  <section>
    {workflows.map((wf) => (
      <Card key={wf.name}>
        <CardHeader>
          <CardTitle>{wf.name}</CardTitle>
          <CardDescription>{wf.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {wf.steps.map((step) => (
              <div key={step} className="rounded-full bg-muted px-3 py-1 text-xs">
                {step}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    ))}
  </section>
</div>
```

**Improvements**:
- ✅ CRM domain detected automatically
- ✅ Domain-specific metrics instead of generic
- ✅ Domain-specific entity fields selected
- ✅ Domain-specific workflows rendered
- ✅ Handcrafted feel for CRM apps

---

## Summary of Improvements

| Aspect | Before | After |
|--------|--------|-------|
| **Field Labels** | lowercase, raw names | Title Case, semantic |
| **Input Types** | All `<Input type="text">` | Semantic (email, number, tel, date) |
| **Enum Options** | "Option 1", "Option 2" | Semantic labels: "Draft", "Active" |
| **TextAreas** | Treated as text input | Properly identified |
| **Placeholders** | Generic or missing | Contextual and helpful |
| **Help Text** | None | Field-specific descriptions |
| **Validation** | Type-only | Semantic + error messages |
| **Dashboards** | Generic operations | Domain-specific (CRM, Inventory, etc) |
| **UX Copy** | "New record" | Domain-aware: "Create Lead", "Transfer Stock" |
| **Pages** | Basic structure | Semantic loading/error/empty states |
| **Overall Feel** | Scaffolded | Handcrafted & professional |

---

## Impact

Generated applications now feel **production-ready** and **domain-intelligent** instead of **generic scaffolds**. Users experience:
- Clear, descriptive labels
- Proper input types and validation
- Contextual help and guidance
- Domain-specific workflows
- Professional UX copy

Without sacrificing the power of automated code generation! 🚀
