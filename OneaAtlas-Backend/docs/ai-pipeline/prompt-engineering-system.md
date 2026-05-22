# Prompt Engineering System

> **Core Prompting Architecture for OneAtlas AI Generation System**

This document defines the prompt architecture, layering system, and engineering principles that control how AI generates product-quality applications. It is NOT a generic prompt guide—it is the instruction brain for the entire OneAtlas generation system.

**Goal:** Teach AI to generate apps that feel like real modern products designed by experienced SaaS teams, not CRUD dashboards.

---

## 1. Prompt Architecture

### Prompt Processing Flow

```
User Prompt
    ↓
Domain Extraction
    ↓
Archetype Classification
    ↓
Workflow Inference
    ↓
User Intent Extraction
    ↓
Layout Reasoning
    ↓
UI Composition
    ↓
Component Selection
    ↓
Visual Hierarchy
    ↓
UX Polish
    ↓
Generated Application
```

### Stage 1: Domain Extraction

**Objective:** Identify the business domain from the user prompt.

**Prompt Strategy:**
```
Analyze the user prompt and identify the primary business domain.

Consider these domains:
- Healthcare
- CRM (Customer Relationship Management)
- Ecommerce
- ATS (Applicant Tracking System)
- Analytics
- Finance
- Logistics
- Support Systems
- Project Management
- Education

Output: Primary domain with confidence score (0-1)
```

**Extraction Rules:**
- Look for domain-specific keywords
- Analyze entity relationships
- Identify operational workflows
- Consider user goals
- Evaluate business context

**Example Outputs:**
- "Build a patient management system" → Healthcare (0.95)
- "Create a sales pipeline dashboard" → CRM (0.92)
- "Build an online store" → Ecommerce (0.90)
- "Create a hiring system" → ATS (0.88)

### Stage 2: Archetype Classification

**Objective:** Classify the UI archetype based on domain and user intent.

**Prompt Strategy:**
```
Given the domain {domain} and user prompt, classify the UI archetype.

Archetypes:
- Healthcare Console: Patient-centric, scheduling-focused
- CRM Console: Pipeline-focused, activity-driven
- Analytics Console: Data-heavy, insight-first
- Ecommerce Console: Operational, fulfillment-oriented
- Finance Console: Data-heavy, compliance-focused
- Operations Console: Task-focused, efficiency-driven
- Support Console: Ticket-centric, resolution-oriented
- Project Console: Task-focused, timeline-oriented
- Education Console: Course-centric, progress-driven

Output: Primary archetype with confidence score (0-1)
```

**Classification Rules:**
- Match archetype to domain
- Match archetype to workflow
- Match archetype to user role
- Match archetype to business goals
- Consider user expertise level

**Example Outputs:**
- Healthcare + patient management → Healthcare Console (0.94)
- CRM + sales pipeline → CRM Console (0.96)
- Analytics + data visualization → Analytics Console (0.93)

### Stage 3: Workflow Inference

**Objective:** Infer the primary workflow from the user prompt and domain.

**Prompt Strategy:**
```
Given the domain {domain}, archetype {archetype}, and user prompt, infer the primary workflow.

Workflows:
- Monitoring: Status tracking, alert management
- Analysis: Data exploration, insight generation
- Collaboration: Team coordination, communication
- Operation: Task execution, process management
- Scheduling: Time management, appointment booking
- Selling: Pipeline movement, conversion optimization
- Support: Issue resolution, customer service
- Project Management: Task coordination, timeline management

Output: Primary workflow with confidence score (0-1)
```

**Inference Rules:**
- Analyze action verbs in prompt
- Identify primary user goals
- Consider domain-specific workflows
- Evaluate task frequency
- Assess workflow complexity

**Example Outputs:**
- "Track patient appointments" → Scheduling (0.91)
- "Monitor sales pipeline" → Monitoring (0.89)
- "Analyze user data" → Analysis (0.92)

### Stage 4: User Intent Extraction

**Objective:** Extract the user's primary intent and secondary intents.

**Prompt Strategy:**
```
Given the user prompt, extract the user's primary intent and secondary intents.

Intent Types:
- Create: Build something new
- View: Display information
- Edit: Modify existing data
- Delete: Remove data
- Analyze: Explore data patterns
- Report: Generate reports
- Monitor: Track status
- Manage: Organize and control

Output: Primary intent, secondary intents with confidence scores
```

**Extraction Rules:**
- Identify primary action verb
- Identify secondary action verbs
- Consider user goals
- Evaluate task priorities
- Assess workflow context

**Example Outputs:**
- "Build a patient management system" → Create (0.95), Manage (0.80), View (0.70)
- "Create a sales dashboard" → View (0.90), Analyze (0.85), Monitor (0.75)

### Stage 5: Layout Reasoning

**Objective:** Reason about the optimal layout based on domain, archetype, and workflow.

**Prompt Strategy:**
```
Given the domain {domain}, archetype {archetype}, and workflow {workflow}, reason about the optimal layout.

Layout Options:
- Grid: Standard dashboard layout
- Masonry: Card-based layout with varying heights
- Sidebar-Content: Sidebar navigation with main content area
- Topbar-Content: Top navigation bar with main content area
- Custom: Domain-specific layout

Reasoning Factors:
- Workflow sequence
- Information density
- User expertise
- Screen real estate
- Interaction patterns

Output: Recommended layout with reasoning
```

**Reasoning Rules:**
- Match layout to workflow
- Match layout to information density
- Match layout to user expertise
- Match layout to screen size
- Consider navigation patterns

**Example Outputs:**
- Healthcare + Scheduling → Sidebar-Content (patient navigation always accessible)
- Analytics + Analysis → Grid (maximize chart space)
- CRM + Selling → Sidebar-Content (pipeline always visible)

### Stage 6: UI Composition

**Objective:** Compose the UI based on layout, workflow, and user intent.

**Prompt Strategy:**
```
Given the layout {layout}, workflow {workflow}, and user intent {intent}, compose the UI.

Composition Rules:
- Primary workflow actions get prominent placement
- Secondary actions get contextual placement
- Information hierarchy follows workflow sequence
- Section ordering matches user goals
- Visual weight indicates operational importance

Output: UI composition plan with section ordering and visual hierarchy
```

**Composition Rules:**
- Prioritize workflow-critical sections
- Order sections by workflow sequence
- Group related elements
- Establish visual hierarchy
- Ensure contextual relevance

**Example Outputs:**
- Healthcare + Scheduling → Calendar (primary), Patient List (secondary), Appointments (tertiary)
- CRM + Selling → Pipeline (primary), Lead Details (secondary), Activity (tertiary)

### Stage 7: Component Selection

**Objective:** Select appropriate components based on domain, workflow, and data types.

**Prompt Strategy:**
```
Given the domain {domain}, workflow {workflow}, and data types, select appropriate components.

Component Categories:
- Data Display: Tables, charts, lists, cards
- Input: Forms, inputs, selectors, pickers
- Navigation: Menus, tabs, breadcrumbs, pagination
- Feedback: Alerts, toasts, modals, dialogs
- Layout: Grids, containers, panels, sections

Selection Rules:
- Match component to data type
- Match component to workflow
- Match component to user expertise
- Match component to screen size
- Ensure accessibility

Output: Component selection plan with reasoning
```

**Selection Rules:**
- Use tables for dense data
- Use charts for trends and patterns
- Use cards for summary information
- Use forms for data entry
- Use lists for item collections

**Example Outputs:**
- Patient data → Patient cards (summary), Patient table (list), Patient form (edit)
- Sales data → Pipeline cards (kanban), Sales chart (trends), Lead table (details)

### Stage 8: Visual Hierarchy

**Objective:** Establish visual hierarchy based on operational importance.

**Prompt Strategy:**
```
Given the workflow {workflow} and section importance, establish visual hierarchy.

Hierarchy Factors:
- Operational importance
- Workflow frequency
- User goals
- Business value
- Criticality

Hierarchy Levels:
- Critical (10): Primary actions, status indicators, alerts
- High (8-9): Dashboard KPIs, primary navigation, main content
- Medium (6-7): Secondary actions, supporting information
- Low (4-5): Settings, help, documentation
- Minimal (0-3): Footer, legal, version info

Output: Visual hierarchy plan with sizing, spacing, and color
```

**Hierarchy Rules:**
- Critical elements get largest visual weight
- High elements get strong visual weight
- Medium elements get moderate visual weight
- Low elements get subtle visual weight
- Minimal elements get lightest visual weight

**Example Outputs:**
- Patient status → Critical (10), large font, primary color
- Patient appointments → High (8), medium font, secondary color
- Patient history → Medium (6), standard font, tertiary color

### Stage 9: UX Polish

**Objective:** Apply UX polish for a premium, modern feel.

**Prompt Strategy:**
```
Given the domain {domain} and archetype {archetype}, apply UX polish.

Polish Elements:
- Microinteractions: Hover, click, focus states
- Transitions: Fade, slide, scale effects
- Animation: Purposeful motion, not decorative
- Loading: Skeleton screens, progress indicators
- Feedback: Clear response to user actions

Polish Rules:
- Subtle, not distracting
- Fast, responsive
- Clear feedback
- Consistent behavior
- Accessible design

Output: UX polish plan with interaction details
```

**Polish Rules:**
- Use subtle hover effects
- Use smooth transitions
- Use purposeful animations
- Use skeleton loading
- Provide clear feedback

**Example Outputs:**
- Healthcare → Soft animations, gentle transitions, calming colors
- Analytics → Fast transitions, minimal animations, data-focused
- CRM → Quick interactions, snappy transitions, action-focused

---

## 2. Prompt Layering System

### System Prompts

**Purpose:** Establish the core behavior and personality of the AI generation system.

**System Prompt Structure:**
```
You are OneAtlas, an AI-powered application generation system.

Your goal is to generate modern, product-quality applications that feel like they were designed by experienced SaaS teams.

Core Principles:
1. Intelligence-First: Every design decision has a reason based on domain, workflow, or user intent
2. Workflow-Native: UI flows around user tasks, not data structures
3. Adaptive Density: Information density matches domain expectations
4. Contextual Hierarchy: Visual hierarchy emerges from operational importance
5. Domain-Aware: Design feels native to the business domain

Anti-Patterns to Avoid:
- Generic admin templates
- Repeated dashboards
- Flat layouts
- Equal visual weight everywhere
- Random charts
- Fake KPIs
- Placeholder metrics
- CRUD-only UX
- Repetitive card grids

Generated apps should feel:
- Operational
- Contextual
- Workflow-native
- Adaptive
- Modern SaaS quality
- Intentionally designed
- Domain-aware
```

### Domain Prompts

**Purpose:** Provide domain-specific context and rules.

**Domain Prompt Structure:**
```
DOMAIN: {domain}

Domain Context:
{domain-specific context, business goals, user personas, operational workflows}

Domain-Specific Rules:
{domain-specific design rules, UX patterns, component preferences}

Domain-Specific KPIs:
{domain-specific metrics, business indicators, operational metrics}

Domain-Specific Workflows:
{domain-specific workflows, task sequences, operational patterns}

Domain-Specific Components:
{domain-specific widgets, UI patterns, interaction styles}
```

**Example: Healthcare Domain Prompt**
```
DOMAIN: Healthcare

Domain Context:
Healthcare applications focus on patient care, clinical workflows, and operational efficiency. Users include doctors, nurses, administrators, and patients. Primary goals are patient safety, care quality, and operational efficiency.

Domain-Specific Rules:
- Scheduling-first UI with calendar views as primary
- Patient-centric workflows with patient profiles as primary entity
- Urgency indicators with color-coded priority levels
- Softer clinical visual language with calming colors
- Higher information density for clinical data
- Accessibility is critical for patient-facing features

Domain-Specific KPIs:
- Patient wait times
- Appointment utilization
- Patient satisfaction
- Treatment outcomes
- Readmission rates
- Staff utilization

Domain-Specific Workflows:
- Patient intake and registration
- Appointment scheduling
- Treatment planning
- Medication management
- Lab result tracking
- Discharge planning

Domain-Specific Components:
- Patient cards with status indicators
- Appointment calendars with availability
- Medication lists with dosage tracking
- Lab result displays with trend indicators
- Treatment plan timelines
- Alert systems for critical patient events
```

### Archetype Prompts

**Purpose:** Provide archetype-specific design patterns and behaviors.

**Archetype Prompt Structure:**
```
ARCHETYPE: {archetype}

Archetype Context:
{archetype description, typical use cases, user expectations}

Archetype-Specific Rules:
{archetype-specific layout, navigation, density, interaction patterns}

Archetype-Specific Components:
{archetype-specific widgets, UI patterns, visual style}

Archetype-Specific Workflows:
{archetype-specific workflows, task sequences, operational patterns}
```

**Example: Healthcare Console Archetype Prompt**
```
ARCHETYPE: Healthcare Console

Archetype Context:
Healthcare Console is designed for clinical workflows with patient-centric navigation, scheduling focus, and urgency indicators. Typical users are healthcare professionals who need quick access to patient information and clinical tools.

Archetype-Specific Rules:
- Sidebar-Content layout with patient navigation always accessible
- Comfortable information density with breathing room
- Sidebar navigation with patient list, appointments, medical records
- Soft, calming color palette (blues, greens, neutrals)
- Rounded corners for friendly, approachable feel
- Clear, readable typography with larger base scale (1.1x)

Archetype-Specific Components:
- Patient cards with status indicators and urgency badges
- Appointment calendars with availability indicators
- Medication lists with dosage and timing
- Lab result displays with trend indicators
- Treatment plan timelines with milestones
- Alert systems for critical patient events

Archetype-Specific Workflows:
- Patient intake and registration
- Appointment scheduling and management
- Treatment planning and tracking
- Medication management
- Lab result review
- Discharge planning
```

### Workflow Prompts

**Purpose:** Provide workflow-specific UI patterns and behaviors.

**Workflow Prompt Structure:**
```
WORKFLOW: {workflow}

Workflow Context:
{workflow description, typical tasks, user goals}

Workflow-Specific Rules:
{workflow-specific layout, component selection, interaction patterns}

Workflow-Specific Components:
{workflow-specific widgets, UI patterns, action areas}

Workflow-Specific Metrics:
{workflow-specific KPIs, operational indicators, success metrics}
```

**Example: Scheduling Workflow Prompt**
```
WORKFLOW: Scheduling

Workflow Context:
Scheduling workflow focuses on time management, appointment booking, and calendar coordination. Typical tasks include creating appointments, managing availability, and coordinating schedules.

Workflow-Specific Rules:
- Calendar views as primary layout
- Time-based navigation and filtering
- Availability indicators prominently displayed
- Conflict warnings and resolution
- Quick appointment creation
- Drag-and-drop scheduling

Workflow-Specific Components:
- Calendar views (day, week, month)
- Appointment cards with time slots
- Availability indicators
- Conflict resolution dialogs
- Quick appointment forms
- Scheduling wizards

Workflow-Specific Metrics:
- Appointment utilization
- Booking rate
- Cancellation rate
- No-show rate
- Scheduling efficiency
```

### Visual Prompts

**Purpose:** Provide visual design guidelines and patterns.

**Visual Prompt Structure:**
```
VISUAL SYSTEM: {visual system}

Visual Context:
{visual system description, design philosophy, aesthetic goals}

Visual Rules:
{typography, spacing, color, hierarchy, rhythm rules}

Visual Components:
{component-specific visual patterns, styling guidelines}

Visual Anti-Patterns:
{visual patterns to avoid, anti-patterns}
```

**Example: Healthcare Visual Prompt**
```
VISUAL SYSTEM: Healthcare Visual System

Visual Context:
Healthcare visual system uses calming colors, clear typography, and soft interactions to create a clinical but approachable feel. The goal is to reduce anxiety and increase trust.

Visual Rules:
- Color palette: Blues (#3B82F6), Greens (#10B981), Neutrals (#6B7280, #9CA3AF)
- Typography: Clear, readable, larger base scale (1.1x)
- Spacing: Comfortable spacing (1.2x base unit)
- Rounded corners: 8px radius for friendly feel
- Soft shadows: Subtle depth without harshness
- Gentle animations: 200-300ms, easing functions

Visual Components:
- Patient cards: White background, soft shadow, rounded corners
- Status indicators: Color-coded badges with clear labels
- Alerts: Soft background, clear icon, dismissible
- Buttons: Primary (blue), Secondary (gray), Tertiary (outline)

Visual Anti-Patterns:
- Avoid harsh reds (use softer oranges for warnings)
- Avoid sharp corners (use rounded corners)
- Avoid jarring animations (use gentle transitions)
- Avoid clutter (use whitespace effectively)
```

### UX Prompts

**Purpose:** Provide UX interaction guidelines and patterns.

**UX Prompt Structure:**
```
UX SYSTEM: {ux system}

UX Context:
{ux system description, interaction philosophy, user experience goals}

UX Rules:
{interaction patterns, feedback systems, accessibility guidelines}

UX Components:
{component-specific UX patterns, interaction guidelines}

UX Anti-Patterns:
{ux patterns to avoid, anti-patterns}
```

**Example: Healthcare UX Prompt**
```
UX SYSTEM: Healthcare UX System

UX Context:
Healthcare UX system prioritizes clarity, accessibility, and efficiency. Interactions should be clear, predictable, and forgiving. The goal is to reduce cognitive load and increase patient safety.

UX Rules:
- Clear visual feedback for all interactions
- Accessible design (WCAG 2.1 AA)
- Keyboard navigation support
- Screen reader compatibility
- Error prevention over error correction
- Clear error messages with recovery actions

UX Components:
- Forms: Clear labels, helpful hints, validation feedback
- Tables: Sortable, filterable, with clear headers
- Modals: Clear purpose, easy dismissal, keyboard accessible
- Alerts: Clear type, dismissible, with recovery actions
- Loading: Skeleton screens, progress indicators, clear status

UX Anti-Patterns:
- Avoid modal overload (use sparingly)
- Avoid hidden actions (make actions visible)
- Avoid complex interactions (keep it simple)
- Avoid ambiguous labels (be specific)
- Avoid error-prone workflows (prevent errors)
```

### Refinement Prompts

**Purpose:** Iteratively improve the generated UI through refinement prompts.

**Refinement Prompt Structure:**
```
REFINEMENT: {refinement type}

Current State:
{current UI state, issues, opportunities}

Refinement Goals:
{specific refinement goals, improvement targets}

Refinement Rules:
{refinement-specific rules, constraints, guidelines}

Output:
Refined UI with improvements
```

**Example: Hierarchy Refinement Prompt**
```
REFINEMENT: Visual Hierarchy

Current State:
Current UI has flat visual hierarchy with equal visual weight across all sections. Important actions are not emphasized, and critical information is not prominent.

Refinement Goals:
- Establish clear visual hierarchy
- Emphasize critical workflow actions
- Make important information prominent
- Reduce visual weight of secondary information

Refinement Rules:
- Use size to indicate importance (larger = more important)
- Use color to indicate importance (primary color = critical)
- Use spacing to indicate importance (more space = more important)
- Use position to indicate importance (top-left = most important)

Output:
Refined UI with clear visual hierarchy
```

---

## 3. Product Intelligence Prompting

### Teach AI to Infer: Operational Workflows

**Prompt Strategy:**
```
Given the user prompt and domain, infer the primary operational workflows.

Operational Workflow Definition:
A sequence of tasks that users perform to achieve a business goal. Workflows are domain-specific and reflect how users actually work, not how data is structured.

Inference Rules:
1. Identify the primary business goal from the prompt
2. Break down the goal into sequential tasks
3. Identify decision points in the workflow
4. Identify parallel tasks in the workflow
5. Identify feedback loops in the workflow
6. Identify exception handling in the workflow

Output:
Primary workflow with task sequence, decision points, and parallel tasks
```

**Example:**
```
User Prompt: "Build a patient management system"

Inferred Workflow:
1. Patient Intake
   - Collect patient information
   - Verify insurance
   - Assign to provider
2. Appointment Scheduling
   - Check availability
   - Book appointment
   - Send confirmation
3. Treatment Planning
   - Review patient history
   - Create treatment plan
   - Schedule follow-up
4. Ongoing Care
   - Track progress
   - Adjust treatment
   - Monitor outcomes
```

### Teach AI to Infer: Business Goals

**Prompt Strategy:**
```
Given the user prompt and domain, infer the primary business goals.

Business Goal Definition:
The high-level objectives that the application is designed to achieve. Business goals are strategic, not tactical.

Inference Rules:
1. Identify the primary business problem being solved
2. Identify the desired business outcome
3. Identify the success metrics
4. Identify the stakeholders
5. Identify the constraints

Output:
Primary business goals with success metrics and stakeholders
```

**Example:**
```
User Prompt: "Build a patient management system"

Inferred Business Goals:
1. Improve Patient Care
   - Success: Reduced wait times, improved outcomes
   - Stakeholders: Patients, Providers, Administrators
2. Increase Operational Efficiency
   - Success: Reduced administrative overhead, improved scheduling
   - Stakeholders: Administrators, Providers
3. Ensure Patient Safety
   - Success: Reduced errors, improved compliance
   - Stakeholders: Patients, Providers, Regulators
```

### Teach AI to Infer: User Behavior

**Prompt Strategy:**
```
Given the user prompt, domain, and workflow, infer user behavior patterns.

User Behavior Definition:
How users interact with the application, including their goals, habits, and preferences.

Inference Rules:
1. Identify the primary user personas
2. Identify user goals for each persona
3. Identify user habits and patterns
4. Identify user preferences and expectations
5. Identify user pain points and frustrations

Output:
User personas with goals, habits, preferences, and pain points
```

**Example:**
```
User Prompt: "Build a patient management system"

Inferred User Behavior:
Persona 1: Doctor
- Goals: Quickly access patient information, make treatment decisions
- Habits: Checks patient history before appointments, reviews lab results
- Preferences: Clean interface, fast access to critical information
- Pain Points: Slow systems, missing information, complex navigation

Persona 2: Nurse
- Goals: Manage patient care, track treatments, communicate with providers
- Habits: Updates patient records, checks schedules, communicates with patients
- Preferences: Clear task lists, easy communication tools
- Pain Points: Complex workflows, unclear priorities, communication gaps

Persona 3: Administrator
- Goals: Manage operations, track metrics, ensure compliance
- Habits: Reviews reports, manages schedules, monitors performance
- Preferences: Dashboard views, clear metrics, easy reporting
- Pain Points: Data silos, manual processes, lack of visibility
```

### Teach AI to Infer: Primary Tasks

**Prompt Strategy:**
```
Given the user prompt, domain, and workflow, infer the primary tasks users perform.

Primary Task Definition:
The most frequent and important tasks users perform in the application.

Inference Rules:
1. Identify tasks from the workflow
2. Rank tasks by frequency
3. Rank tasks by importance
4. Rank tasks by complexity
5. Identify task dependencies

Output:
Primary tasks ranked by frequency, importance, and complexity
```

**Example:**
```
User Prompt: "Build a patient management system"

Inferred Primary Tasks:
1. View Patient Information (Frequency: High, Importance: Critical, Complexity: Low)
2. Schedule Appointments (Frequency: High, Importance: High, Complexity: Medium)
3. Update Patient Records (Frequency: Medium, Importance: High, Complexity: Medium)
4. Review Lab Results (Frequency: Medium, Importance: High, Complexity: Low)
5. Manage Medications (Frequency: Low, Importance: High, Complexity: High)
```

### Teach AI to Infer: Information Hierarchy

**Prompt Strategy:**
```
Given the user prompt, domain, and workflow, infer the information hierarchy.

Information Hierarchy Definition:
The relative importance of different pieces of information based on operational needs.

Inference Rules:
1. Identify all information types
2. Rank information by operational importance
3. Rank information by workflow frequency
4. Rank information by user goals
5. Rank information by business value

Output:
Information hierarchy with importance scores and placement recommendations
```

**Example:**
```
User Prompt: "Build a patient management system"

Inferred Information Hierarchy:
1. Patient Status (Importance: 10, Placement: Zone 1, Always Visible)
2. Upcoming Appointments (Importance: 9, Placement: Zone 1, Always Visible)
3. Critical Alerts (Importance: 10, Placement: Zone 1, Always Visible)
4. Patient History (Importance: 7, Placement: Zone 2, Contextual)
5. Lab Results (Importance: 7, Placement: Zone 2, Contextual)
6. Medications (Importance: 6, Placement: Zone 3, On Demand)
7. Settings (Importance: 3, Placement: Zone 3, On Demand)
```

### Teach AI to Infer: KPI Relevance

**Prompt Strategy:**
```
Given the user prompt, domain, and workflow, infer the relevant KPIs.

KPI Relevance Definition:
The metrics that are most relevant to the business goals and user tasks.

Inference Rules:
1. Identify potential KPIs from the domain
2. Match KPIs to business goals
3. Match KPIs to user tasks
4. Rank KPIs by relevance
5. Identify KPI data sources

Output:
Relevant KPIs ranked by relevance with data sources and display recommendations
```

**Example:**
```
User Prompt: "Build a patient management system"

Inferred KPI Relevance:
1. Patient Wait Times (Relevance: 10, Source: Appointment Data, Display: Dashboard)
2. Appointment Utilization (Relevance: 9, Source: Schedule Data, Display: Dashboard)
3. Patient Satisfaction (Relevance: 8, Source: Survey Data, Display: Dashboard)
4. Treatment Outcomes (Relevance: 8, Source: Clinical Data, Display: Dashboard)
5. Readmission Rates (Relevance: 7, Source: Claims Data, Display: Reports)
```

### Teach AI to Infer: Interaction Patterns

**Prompt Strategy:**
```
Given the user prompt, domain, and workflow, infer the interaction patterns.

Interaction Pattern Definition:
The typical ways users interact with the application to complete tasks.

Inference Rules:
1. Identify task sequences
2. Identify interaction points
3. Identify decision points
4. Identify feedback points
5. Identify error points

Output:
Interaction patterns with task sequences, interaction points, and feedback mechanisms
```

**Example:**
```
User Prompt: "Build a patient management system"

Inferred Interaction Patterns:
Pattern 1: View Patient
- Interaction: Click patient in list
- Feedback: Patient details panel slides in
- Next Action: View appointments, view history, update records

Pattern 2: Schedule Appointment
- Interaction: Click "Schedule" button
- Feedback: Calendar modal opens
- Next Action: Select time slot, confirm appointment

Pattern 3: Update Patient Records
- Interaction: Click "Edit" button
- Feedback: Edit form opens
- Next Action: Update fields, save changes
```

---

## 4. UI Reasoning Prompts

### How AI Should Reason About: Layouts

**Prompt Strategy:**
```
Given the domain, archetype, and workflow, reason about the optimal layout.

Layout Reasoning Process:
1. Analyze the workflow sequence
2. Identify the primary actions
3. Identify the information density requirements
4. Identify the navigation patterns
5. Identify the screen real estate constraints
6. Select the layout that best supports the workflow

Layout Selection Criteria:
- Workflow support: Does the layout support the workflow sequence?
- Information density: Does the layout handle the information density?
- Navigation: Does the layout support the navigation patterns?
- Screen real estate: Does the layout use screen real estate effectively?
- User expertise: Does the layout match user expertise?

Output:
Recommended layout with reasoning
```

**Example:**
```
Domain: Healthcare
Archetype: Healthcare Console
Workflow: Scheduling

Layout Reasoning:
- Workflow sequence: Check availability → Book appointment → Confirm
- Primary actions: View calendar, select time slot, confirm appointment
- Information density: Medium (patient info, appointment details, availability)
- Navigation: Patient list, calendar, appointments
- Screen real estate: Need calendar visibility + patient info
- User expertise: Clinical users need quick access to patient info

Recommended Layout: Sidebar-Content
Reasoning: Sidebar provides constant access to patient list and navigation, content area provides calendar and appointment details. This supports the scheduling workflow while keeping patient information accessible.
```

### How AI Should Reason About: Spacing

**Prompt Strategy:**
```
Given the domain, archetype, and information hierarchy, reason about spacing.

Spacing Reasoning Process:
1. Analyze the information hierarchy
2. Identify the information density
3. Identify the visual rhythm requirements
4. Identify the breathing room needs
5. Select the spacing scale

Spacing Selection Criteria:
- Hierarchy: Does spacing reinforce visual hierarchy?
- Density: Does spacing match information density?
- Rhythm: Does spacing create visual rhythm?
- Breathing room: Does spacing provide adequate breathing room?
- Archetype: Does spacing match archetype expectations?

Output:
Recommended spacing scale with reasoning
```

**Example:**
```
Domain: Healthcare
Archetype: Healthcare Console
Information Hierarchy: Patient status (critical), appointments (high), history (medium)

Spacing Reasoning:
- Hierarchy: Critical elements need more space to stand out
- Density: Medium density requires comfortable spacing
- Rhythm: Consistent spacing creates visual rhythm
- Breathing room: Healthcare needs more breathing room for clarity
- Archetype: Healthcare archetype uses comfortable spacing (1.2x)

Recommended Spacing: 1.2x base scale
Reasoning: Comfortable spacing provides breathing room for clinical information, reinforces hierarchy through spacing differences, and matches healthcare archetype expectations.
```

### How AI Should Reason About: Hierarchy

**Prompt Strategy:**
```
Given the workflow, information hierarchy, and user goals, reason about visual hierarchy.

Hierarchy Reasoning Process:
1. Analyze the workflow sequence
2. Identify the critical elements
3. Identify the important elements
4. Identify the supporting elements
5. Identify the tertiary elements
6. Assign visual weight based on importance

Hierarchy Assignment Criteria:
- Workflow criticality: Is the element critical to the workflow?
- User goals: Does the element support primary user goals?
- Business value: Does the element have high business value?
- Frequency: Is the element frequently used?
- Complexity: Is the element complex to use?

Output:
Visual hierarchy plan with sizing, spacing, and color
```

**Example:**
```
Workflow: Scheduling
Information Hierarchy: Patient status (critical), appointments (high), history (medium)
User Goals: Schedule appointments quickly, view patient information

Hierarchy Reasoning:
- Patient status: Critical to workflow, supports user goals → Level 10
- Appointments: Critical to workflow, primary user goal → Level 9
- Calendar: Critical to workflow, primary user goal → Level 9
- Patient history: Supporting information, secondary user goal → Level 7
- Settings: Tertiary information, not workflow-critical → Level 3

Visual Hierarchy:
- Patient status: 2.0x size, bold weight, primary color, Zone 1
- Appointments: 1.5x size, semi-bold weight, primary color, Zone 1
- Calendar: 1.5x size, semi-bold weight, primary color, Zone 1
- Patient history: 1.0x size, regular weight, secondary color, Zone 2
- Settings: 0.875x size, light weight, tertiary color, Zone 3
```

### How AI Should Reason About: Density

**Prompt Strategy:**
```
Given the domain, archetype, and user expertise, reason about information density.

Density Reasoning Process:
1. Analyze the domain expectations
2. Analyze the user expertise level
3. Analyze the information volume
4. Analyze the screen real estate
5. Select the appropriate density level

Density Selection Criteria:
- Domain: Does the domain expect high or low density?
- Expertise: Do expert users prefer higher density?
- Information volume: Is there a lot of information to display?
- Screen real estate: Is there enough screen space?
- Workflow: Does the workflow require dense information?

Output:
Recommended density level with reasoning
```

**Example:**
```
Domain: Healthcare
Archetype: Healthcare Console
User Expertise: Clinical (expert)
Information Volume: Medium (patient info, appointments, history)

Density Reasoning:
- Domain: Healthcare expects comfortable density (not too dense)
- Expertise: Expert users can handle higher density, but healthcare needs clarity
- Information volume: Medium volume requires comfortable density
- Screen real estate: Adequate screen space for comfortable density
- Workflow: Scheduling workflow requires clarity over density

Recommended Density: Comfortable
Reasoning: Healthcare domain requires clarity for patient safety, even though users are experts. Comfortable density provides the right balance of information and breathing room.
```

### How AI Should Reason About: Dashboard Composition

**Prompt Strategy:**
```
Given the domain, workflow, and KPIs, reason about dashboard composition.

Dashboard Composition Reasoning Process:
1. Analyze the primary KPIs
2. Analyze the workflow requirements
3. Analyze the user goals
4. Select the dashboard layout
5. Arrange the dashboard sections

Dashboard Composition Criteria:
- KPI relevance: Are the KPIs relevant to the workflow?
- Workflow support: Does the dashboard support the workflow?
- User goals: Does the dashboard support user goals?
- Visual hierarchy: Does the dashboard have clear hierarchy?
- Adaptability: Does the dashboard adapt to context?

Output:
Dashboard composition plan with section arrangement and visual hierarchy
```

**Example:**
```
Domain: Healthcare
Workflow: Scheduling
KPIs: Patient wait times, appointment utilization, patient satisfaction

Dashboard Composition Reasoning:
- Primary KPIs: Patient wait times (critical), appointment utilization (high)
- Workflow requirements: Need to see availability, upcoming appointments, patient status
- User goals: Schedule appointments quickly, view patient information
- Visual hierarchy: Critical KPIs at top, workflow actions next, supporting info below
- Adaptability: Dashboard should adapt to provider role and schedule

Recommended Dashboard Composition:
- Top: Critical KPIs (patient wait times, appointment utilization)
- Middle: Calendar view with availability indicators
- Bottom: Patient list with status indicators
- Sidebar: Patient navigation and quick actions
```

### How AI Should Reason About: Navigation

**Prompt Strategy:**
```
Given the domain, archetype, and workflow, reason about navigation structure.

Navigation Reasoning Process:
1. Analyze the workflow sequence
2. Identify the primary navigation items
3. Identify the secondary navigation items
4. Identify the tertiary navigation items
5. Select the navigation pattern

Navigation Selection Criteria:
- Workflow support: Does navigation support the workflow?
- Information architecture: Does navigation reflect information architecture?
- User expectations: Does navigation match user expectations?
- Archetype: Does navigation match archetype patterns?
- Screen real estate: Does navigation fit screen real estate?

Output:
Navigation structure with hierarchy and placement
```

**Example:**
```
Domain: Healthcare
Archetype: Healthcare Console
Workflow: Scheduling

Navigation Reasoning:
- Workflow sequence: Patient list → Patient details → Appointments → Scheduling
- Primary navigation: Patients, Appointments, Calendar, Medical Records
- Secondary navigation: Patient history, Lab results, Medications
- Tertiary navigation: Settings, Help, Documentation
- Navigation pattern: Sidebar navigation (constant access to patient info)

Recommended Navigation Structure:
- Sidebar: Primary navigation (Patients, Appointments, Calendar, Medical Records)
- Sidebar bottom: Secondary navigation (Patient history, Lab results, Medications)
- Sidebar very bottom: Tertiary navigation (Settings, Help, Documentation)
```

### How AI Should Reason About: Responsiveness

**Prompt Strategy:**
```
Given the domain, archetype, and layout, reason about responsive design.

Responsive Reasoning Process:
1. Analyze the layout structure
2. Identify the breakpoints
3. Identify the content priorities
4. Identify the interaction patterns
5. Design the responsive behavior

Responsive Design Criteria:
- Content priority: Is critical content always visible?
- Interaction: Are interactions still usable on small screens?
- Navigation: Is navigation accessible on small screens?
- Performance: Is performance acceptable on all devices?
- Accessibility: Is the design accessible on all devices?

Output:
Responsive design plan with breakpoints and behavior
```

**Example:**
```
Domain: Healthcare
Archetype: Healthcare Console
Layout: Sidebar-Content

Responsive Reasoning:
- Layout structure: Sidebar navigation + content area
- Breakpoints: Mobile (<640px), Tablet (640-1024px), Desktop (>1024px)
- Content priorities: Patient status (critical), appointments (high), history (medium)
- Interaction patterns: Click to view details, swipe to navigate
- Navigation: Sidebar collapses on mobile, becomes hamburger menu

Recommended Responsive Design:
- Mobile: Single column, stacked, hamburger menu, hide less critical info
- Tablet: 2 columns, sidebar collapses to icons, hide tertiary info
- Desktop: Full layout, sidebar visible, all content visible
```

---

## 5. Domain Prompt Packs

### Healthcare Prompt Pack

**Domain Context:**
Healthcare applications focus on patient care, clinical workflows, and operational efficiency. Users include doctors, nurses, administrators, and patients. Primary goals are patient safety, care quality, and operational efficiency.

**Design Rules:**
- Scheduling-first UI with calendar views as primary
- Patient-centric workflows with patient profiles as primary entity
- Urgency indicators with color-coded priority levels
- Softer clinical visual language with calming colors
- Higher information density for clinical data
- Accessibility is critical for patient-facing features

**KPIs:**
- Patient wait times
- Appointment utilization
- Patient satisfaction
- Treatment outcomes
- Readmission rates
- Staff utilization

**Workflows:**
- Patient intake and registration
- Appointment scheduling
- Treatment planning
- Medication management
- Lab result tracking
- Discharge planning

**Components:**
- Patient cards with status indicators
- Appointment calendars with availability
- Medication lists with dosage tracking
- Lab result displays with trend indicators
- Treatment plan timelines
- Alert systems for critical patient events

### CRM Prompt Pack

**Domain Context:**
CRM applications focus on customer relationship management, sales pipelines, and customer engagement. Users include sales reps, account managers, and executives. Primary goals are revenue growth, customer satisfaction, and sales efficiency.

**Design Rules:**
- Pipeline-focused interactions with kanban/pipeline views
- Activity-first layouts with activity timelines
- Lead movement emphasis with quick actions
- Action-oriented design with prominent CTAs
- Compact information density for sales efficiency
- Mobile-friendly for field sales

**KPIs:**
- Pipeline value
- Conversion rates
- Deal velocity
- Lead response time
- Customer acquisition cost
- Customer lifetime value

**Workflows:**
- Lead generation and qualification
- Pipeline movement and conversion
- Customer engagement
- Opportunity management
- Forecasting and reporting
- Account management

**Components:**
- Pipeline cards with stage indicators
- Activity feeds with interaction history
- Lead lists with scoring
- Opportunity cards with value tracking
- Communication tools
- Forecasting charts

### Ecommerce Prompt Pack

**Domain Context:**
Ecommerce applications focus on online sales, order management, and customer experience. Users include store managers, fulfillment teams, and customers. Primary goals are revenue growth, operational efficiency, and customer satisfaction.

**Design Rules:**
- Operational dashboards with order status prominently displayed
- Fulfillment workflows with shipping tracking
- Inventory prioritization with low stock alerts
- Customer-focused UX with order history
- Compact information density for operational efficiency
- Mobile-friendly for on-the-go management

**KPIs:**
- Order volume
- Revenue trends
- Conversion rates
- Average order value
- Customer lifetime value
- Inventory turnover

**Workflows:**
- Order processing and fulfillment
- Inventory management
- Customer management
- Shipping and logistics
- Returns and exchanges
- Reporting and analytics

**Components:**
- Order cards with status indicators
- Inventory widgets with stock levels
- Customer profiles with order history
- Shipping tracking displays
- Revenue charts
- Return management tools

### ATS Prompt Pack

**Domain Context:**
ATS applications focus on applicant tracking, hiring pipelines, and recruitment management. Users include recruiters, hiring managers, and candidates. Primary goals are hiring efficiency, candidate quality, and time-to-hire reduction.

**Design Rules:**
- Candidate pipelines with kanban/pipeline views
- Hiring funnel visualization with conversion metrics
- Recruiter productivity UX with quick actions
- Candidate-centric design with detailed profiles
- Timeline visualization for hiring process
- Communication tools integrated

**KPIs:**
- Time-to-hire
- Pipeline conversion rates
- Candidate quality scores
- Recruiter productivity
- Source attribution
- Cost per hire

**Workflows:**
- Candidate sourcing and screening
- Interview scheduling
- Pipeline movement and conversion
- Offer management
- Onboarding coordination
- Reporting and analytics

**Components:**
- Candidate cards with stage indicators
- Pipeline kanban with drag-and-drop
- Hiring funnel charts
- Interview scheduling tools
- Communication panels
- Assessment displays

### Analytics Prompt Pack

**Domain Context:**
Analytics applications focus on data exploration, insight generation, and business intelligence. Users include analysts, executives, and business users. Primary goals are data-driven decision making, insight discovery, and trend identification.

**Design Rules:**
- Chart-heavy layouts with multiple visualization types
- Data density optimization for information richness
- Insight-first hierarchy with key insights at top
- Data-driven color coding with consistent palettes
- Compact information density for data richness
- Export options prominently available

**KPIs:**
- User engagement
- Feature adoption
- Retention rates
- Churn prediction
- Revenue attribution
- Conversion funnels

**Workflows:**
- Data exploration and analysis
- Dashboard creation and customization
- Report generation and sharing
- Alert configuration
- Data drilling and filtering
- Export and integration

**Components:**
- Chart widgets with multiple types
- Data tables with sorting and filtering
- Insight cards with recommendations
- Filter panels with controls
- Export tools
- Alert configuration dialogs

### Logistics Prompt Pack

**Domain Context:**
Logistics applications focus on shipment tracking, fleet management, and warehouse operations. Users include dispatchers, drivers, and warehouse managers. Primary goals are on-time delivery, cost optimization, and operational efficiency.

**Design Rules:**
- Shipment tracking with real-time maps
- Fleet management with vehicle locations
- Warehouse operations with picking routes
- Operational dashboards with status prominently displayed
- Compact information density for operational efficiency
- Mobile-friendly for field operations

**KPIs:**
- On-time delivery rate
- Cost per shipment
- Fleet utilization
- Inventory turnover
- Customer satisfaction
- Route efficiency

**Workflows:**
- Shipment tracking and management
- Route optimization and planning
- Fleet management and maintenance
- Warehouse operations and picking
- Returns processing
- Reporting and analytics

**Components:**
- Tracking maps with real-time updates
- Vehicle location displays
- Route optimization tools
- Inventory widgets with stock levels
- Shipment cards with status indicators
- Performance charts

### Finance Prompt Pack

**Domain Context:**
Finance applications focus on financial reporting, budgeting, and compliance. Users include finance teams, executives, and auditors. Primary goals are financial accuracy, compliance, and strategic planning.

**Design Rules:**
- Financial reporting with statements prominently displayed
- Data-heavy layouts with dense information display
- Compliance-focused UX with audit trails visible
- Security emphasis with access controls visible
- High information density for financial data
- Export options prominently available

**KPIs:**
- Revenue growth
- Profit margins
- Cash flow
- Expense ratios
- Budget variance
- Compliance metrics

**Workflows:**
- Financial reporting and analysis
- Budget planning and tracking
- Expense management
- Compliance monitoring
- Audit preparation
- Strategic planning

**Components:**
- Financial statement displays
- Budget tracking widgets
- Expense tables with categorization
- Compliance indicators
- Audit trail displays
- Export tools

### Support Systems Prompt Pack

**Domain Context:**
Support applications focus on ticket management, customer service, and issue resolution. Users include support agents, managers, and customers. Primary goals are issue resolution, customer satisfaction, and agent productivity.

**Design Rules:**
- Ticket-centric design with queues prominently displayed
- Customer information linked to tickets
- Resolution-focused UX with quick actions
- Agent productivity tools with performance metrics
- Comfortable information density for clarity
- Communication tools integrated

**KPIs:**
- First response time
- Resolution time
- Customer satisfaction
- Ticket volume
- Agent productivity
- SLA compliance

**Workflows:**
- Ticket intake and triage
- Issue resolution and escalation
- Customer communication
- Knowledge base management
- Reporting and analytics
- Agent management

**Components:**
- Ticket queues with priority indicators
- Customer profile panels
- Communication tools
- Knowledge base integration
- Performance dashboards
- Resolution workflow tools

### Project Management Prompt Pack

**Domain Context:**
Project management applications focus on task coordination, timeline management, and team collaboration. Users include project managers, team members, and executives. Primary goals are project delivery, team productivity, and timeline adherence.

**Design Rules:**
- Task-centric design with boards prominently displayed
- Timeline visualization with Gantt charts
- Team collaboration with activity feeds
- Progress tracking with completion percentages
- Compact information density for task density
- Mobile-friendly for field teams

**KPIs:**
- Task completion rate
- Sprint velocity
- On-time delivery
- Resource utilization
- Team productivity
- Project health scores

**Workflows:**
- Task creation and assignment
- Sprint planning and execution
- Timeline management
- Team coordination
- Progress tracking
- Reporting and analytics

**Components:**
- Task boards with drag-and-drop
- Gantt charts with dependencies
- Team member avatars
- Activity feeds
- Progress bars
- Milestone tracking

---

## 6. Adaptive Generation Rules

### Prompts Should: Avoid Repeated Layouts

**Rule:**
Never generate the same layout for different domains or workflows.

**Implementation:**
```
Given the domain and workflow, select a layout that is unique to the combination.

Layout Uniqueness Criteria:
- Different domains should have different layouts
- Different workflows should have different layouts
- Different user roles should have different layouts
- Different screen sizes should have different layouts

Output:
Unique layout for the specific domain-workflow-role-size combination
```

**Example:**
- Healthcare + Scheduling → Sidebar-Content
- Healthcare + Monitoring → Grid
- CRM + Selling → Sidebar-Content
- CRM + Analysis → Grid
- Analytics + Analysis → Grid
- Analytics + Reporting → Masonry

### Prompts Should: Avoid Generic Cards

**Rule:**
Never generate generic, repeated card grids.

**Implementation:**
```
Given the domain and workflow, generate cards that are domain-specific and workflow-relevant.

Card Uniqueness Criteria:
- Cards should reflect domain-specific information
- Cards should support workflow-specific tasks
- Cards should have domain-specific visual design
- Cards should have workflow-specific interactions

Output:
Domain-specific, workflow-relevant cards
```

**Example:**
- Healthcare: Patient cards with status indicators, appointment cards with availability
- CRM: Pipeline cards with stage indicators, activity cards with interaction history
- Analytics: Insight cards with recommendations, metric cards with trends
- Ecommerce: Order cards with status, inventory cards with stock levels

### Prompts Should: Avoid Placeholder Metrics

**Rule:**
Never generate generic metrics like "Conversion", "Health", "Growth" without domain context.

**Implementation:**
```
Given the domain and workflow, generate domain-specific metrics.

Metric Specificity Criteria:
- Metrics should be domain-specific
- Metrics should be workflow-relevant
- Metrics should have clear definitions
- Metrics should have business value

Output:
Domain-specific, workflow-relevant metrics
```

**Example:**
- Healthcare: Patient wait times, appointment utilization, treatment outcomes
- CRM: Pipeline value, conversion rates, deal velocity
- Analytics: User engagement, feature adoption, retention rates
- Ecommerce: Order volume, revenue trends, conversion rates

### Prompts Should: Avoid Static Dashboards

**Rule:**
Never generate static, non-interactive dashboards.

**Implementation:**
```
Given the domain and workflow, generate interactive, adaptive dashboards.

Dashboard Interactivity Criteria:
- Dashboards should be filterable
- Dashboards should be sortable
- Dashboards should be drill-downable
- Dashboards should be customizable
- Dashboards should be real-time where applicable

Output:
Interactive, adaptive dashboards
```

**Example:**
- Healthcare: Filter by patient type, drill down to patient details, customize dashboard
- CRM: Filter by pipeline stage, drill down to lead details, customize dashboard
- Analytics: Filter by date range, drill down to user details, customize dashboard

### Prompts Should: Avoid CRUD-First Thinking

**Rule:**
Never generate CRUD-only applications without workflow context.

**Implementation:**
```
Given the domain and workflow, generate workflow-first applications.

Workflow-First Criteria:
- Applications should be organized around workflows
- Applications should prioritize user tasks
- Applications should support operational goals
- Applications should provide contextual actions

Output:
Workflow-first applications
```

**Example:**
- Healthcare: Patient intake workflow, appointment scheduling workflow, treatment planning workflow
- CRM: Lead qualification workflow, pipeline movement workflow, customer engagement workflow
- Analytics: Data exploration workflow, insight discovery workflow, report generation workflow

---

## 7. Refinement Prompting

### How Iterative Prompting Should Improve: UI Polish

**Refinement Strategy:**
```
Given the current UI state, refine the UI polish.

Refinement Goals:
- Add microinteractions (hover, click, focus states)
- Add transitions (fade, slide, scale effects)
- Add animations (purposeful motion)
- Add loading states (skeleton screens, progress indicators)
- Add feedback (clear response to user actions)

Refinement Rules:
- Subtle, not distracting
- Fast, responsive
- Clear feedback
- Consistent behavior
- Accessible design

Output:
Polished UI with microinteractions, transitions, and feedback
```

**Example:**
```
Current State: Basic UI with no polish

Refinement:
- Add hover effects to buttons (color change, shadow increase)
- Add focus states to inputs (border color change, shadow)
- Add transitions to modals (fade in, slide up)
- Add skeleton loading to data displays
- Add toast notifications for user actions

Output: Polished UI with microinteractions and feedback
```

### How Iterative Prompting Should Improve: Hierarchy

**Refinement Strategy:**
```
Given the current UI state, refine the visual hierarchy.

Refinement Goals:
- Establish clear visual hierarchy
- Emphasize critical elements
- De-emphasize secondary elements
- Create visual rhythm
- Guide user attention

Refinement Rules:
- Use size to indicate importance
- Use color to indicate importance
- Use spacing to indicate importance
- Use position to indicate importance
- Use weight to indicate importance

Output:
Refined UI with clear visual hierarchy
```

**Example:**
```
Current State: Flat UI with equal visual weight

Refinement:
- Increase size of critical elements (2.0x for primary actions)
- Use primary color for critical elements
- Add more spacing around critical elements
- Place critical elements in Zone 1
- Use bold weight for critical elements

Output: Refined UI with clear visual hierarchy
```

### How Iterative Prompting Should Improve: Workflow Clarity

**Refinement Strategy:**
```
Given the current UI state, refine the workflow clarity.

Refinement Goals:
- Make workflow steps clear
- Make workflow progress visible
- Make workflow actions accessible
- Make workflow feedback clear
- Make workflow errors preventable

Refinement Rules:
- Use visual indicators for workflow steps
- Use progress indicators for workflow progress
- Use contextual actions for workflow tasks
- Use clear feedback for workflow actions
- Use validation to prevent workflow errors

Output:
Refined UI with clear workflow clarity
```

**Example:**
```
Current State: Basic workflow with no clarity

Refinement:
- Add step indicators for workflow sequence
- Add progress bar for workflow progress
- Add contextual actions for each step
- Add success/error feedback for each action
- Add validation to prevent errors

Output: Refined UI with clear workflow clarity
```

### How Iterative Prompting Should Improve: Visual Sophistication

**Refinement Strategy:**
```
Given the current UI state, refine the visual sophistication.

Refinement Goals:
- Add visual depth (shadows, gradients)
- Add visual interest (patterns, textures)
- Add visual polish (rounded corners, subtle animations)
- Add visual consistency (consistent styling)
- Add visual accessibility (contrast, colorblind-friendly)

Refinement Rules:
- Subtle depth, not overwhelming
- Subtle interest, not distracting
- Subtle polish, not flashy
- Consistent styling, not random
- Accessible design, not exclusionary

Output:
Refined UI with visual sophistication
```

**Example:**
```
Current State: Basic UI with no sophistication

Refinement:
- Add subtle shadows to cards
- Add subtle gradients to buttons
- Add rounded corners to elements
- Add subtle animations to interactions
- Ensure color contrast meets accessibility standards

Output: Refined UI with visual sophistication
```

### How Iterative Prompting Should Improve: Contextual Relevance

**Refinement Strategy:**
```
Given the current UI state, refine the contextual relevance.

Refinement Goals:
- Make content contextually relevant
- Make actions contextually available
- Make information contextually displayed
- Make recommendations contextually suggested
- Make feedback contextually provided

Refinement Rules:
- Match content to user context
- Match actions to user context
- Match information to user context
- Match recommendations to user context
- Match feedback to user context

Output:
Refined UI with contextual relevance
```

**Example:**
```
Current State: Generic UI with no context

Refinement:
- Show patient-specific information in patient context
- Show appointment-specific actions in appointment context
- Show workflow-specific recommendations in workflow context
- Show context-specific feedback for user actions
- Hide irrelevant information in current context

Output: Refined UI with contextual relevance
```

---

## 8. Prompt Examples

### Weak Prompt Examples

**Example 1:**
```
"Build a dashboard"
```
**Issues:**
- No domain specified
- No workflow specified
- No user intent specified
- Too generic
- Will generate generic CRUD dashboard

**Example 2:**
```
"Create a CRM"
```
**Issues:**
- Domain specified but no workflow
- No user intent specified
- No specific features
- Will generate generic CRM template

**Example 3:**
```
"Make an app for managing patients"
```
**Issues:**
- Domain specified (healthcare) but vague
- No specific workflow
- No specific features
- Will generate generic healthcare app

### Strong Prompt Examples

**Example 1:**
```
"Build a patient management system for a hospital with appointment scheduling, patient records, and treatment planning. Doctors should be able to quickly view patient information, schedule appointments, and track treatment progress. The system should prioritize patient safety and operational efficiency."
```
**Strengths:**
- Domain specified (healthcare)
- Specific features (appointment scheduling, patient records, treatment planning)
- User persona specified (doctors)
- User goals specified (quick view, schedule, track)
- Business goals specified (patient safety, operational efficiency)

**Example 2:**
```
"Create a sales pipeline dashboard for a CRM that helps sales reps manage leads, track pipeline conversion, and move deals through stages. The dashboard should show pipeline value, conversion rates, and deal velocity. Reps should be able to quickly move deals between stages and view activity history."
```
**Strengths:**
- Domain specified (CRM)
- Specific workflow (sales pipeline)
- Specific features (lead management, pipeline tracking, deal movement)
- User persona specified (sales reps)
- Specific KPIs specified (pipeline value, conversion rates, deal velocity)

**Example 3:**
```
"Build an analytics dashboard for a SaaS product that shows user engagement, feature adoption, and retention rates. The dashboard should be data-heavy with multiple chart types and allow analysts to drill down into specific metrics. Users should be able to filter by date range, user segment, and feature."
```
**Strengths:**
- Domain specified (analytics)
- Specific workflow (data analysis)
- Specific features (engagement tracking, adoption monitoring, retention analysis)
- User persona specified (analysts)
- Specific capabilities specified (drill-down, filtering)

### Enterprise-Grade Prompt Examples

**Example 1:**
```
"Build an enterprise healthcare management system for a hospital network with multi-location support, role-based access control, and HIPAA compliance. The system should support patient intake, appointment scheduling, treatment planning, medication management, and discharge planning. Different user roles (doctors, nurses, administrators) should have role-specific dashboards and workflows. The system must integrate with existing EHR systems and support audit logging for compliance."
```
**Strengths:**
- Enterprise scope (hospital network, multi-location)
- Security requirements (role-based access, HIPAA compliance)
- Comprehensive feature set (intake, scheduling, planning, medication, discharge)
- Role-specific design (doctors, nurses, administrators)
- Integration requirements (EHR integration, audit logging)

**Example 2:**
```
"Create an enterprise CRM for a B2B SaaS company with multi-tenant architecture, territory-based access control, and Salesforce integration. The system should support lead management, opportunity tracking, pipeline forecasting, and customer success management. Different user roles (sales reps, account managers, executives) should have role-specific views and permissions. The system must support custom workflows, advanced reporting, and API integrations."
```
**Strengths:**
- Enterprise scope (multi-tenant, territory-based)
- Integration requirements (Salesforce, API)
- Comprehensive feature set (leads, opportunities, forecasting, customer success)
- Role-specific design (sales reps, account managers, executives)
- Advanced capabilities (custom workflows, advanced reporting)

### Workflow-Heavy Prompt Examples

**Example 1:**
```
"Build a patient scheduling system for a clinic that supports multi-step booking workflows: patient identification → insurance verification → provider selection → appointment booking → confirmation. Each step should have validation and error handling. The system should show booking progress, allow step navigation, and provide clear feedback at each stage. Doctors should be able to view their schedules and manage availability."
```
**Strengths:**
- Clear workflow steps (identification → verification → selection → booking → confirmation)
- Validation and error handling specified
- Progress tracking specified
- Step navigation specified
- Clear feedback specified
- Role-specific features (doctor schedule management)

**Example 2:**
```
"Create a lead qualification workflow for a CRM that supports multi-stage qualification: lead capture → lead scoring → qualification → assignment → follow-up. Each stage should have automated actions and manual overrides. The system should show pipeline progression, allow stage movement, and provide contextual actions at each stage. Sales reps should be able to view lead scores, update qualification criteria, and schedule follow-ups."
```
**Strengths:**
- Clear workflow stages (capture → scoring → qualification → assignment → follow-up)
- Automation and manual overrides specified
- Pipeline progression specified
- Stage movement specified
- Contextual actions specified
- Role-specific features (lead scoring, qualification updates, follow-up scheduling)

### Analytics-Heavy Prompt Examples

**Example 1:**
```
"Build a healthcare analytics dashboard that shows patient outcomes, treatment effectiveness, and operational metrics. The dashboard should support drill-down from high-level metrics to individual patient records. Users should be able to filter by date range, provider, treatment type, and patient demographics. The dashboard should include trend charts, comparison views, and anomaly detection. Data should update in near real-time."
```
**Strengths:**
- Specific metrics (patient outcomes, treatment effectiveness, operational metrics)
- Drill-down capability specified
- Filtering specified (date range, provider, treatment type, demographics)
- Chart types specified (trend charts, comparison views)
- Advanced features (anomaly detection, real-time updates)

**Example 2:**
```
"Create a sales analytics dashboard for a CRM that shows pipeline velocity, conversion rates, and revenue attribution. The dashboard should support cohort analysis, funnel visualization, and predictive modeling. Users should be able to compare performance across time periods, territories, and sales reps. The dashboard should include AI-powered insights and recommendations."
```
**Strengths:**
- Specific metrics (pipeline velocity, conversion rates, revenue attribution)
- Advanced analytics (cohort analysis, funnel visualization, predictive modeling)
- Comparison capabilities (time periods, territories, sales reps)
- AI features (insights, recommendations)

---

## 9. AI Taste System

### Define: What "Premium UI" Means

**Premium UI Characteristics:**
- **Intentional Design:** Every element has a purpose and reason for existence
- **Visual Sophistication:** Subtle depth, refined typography, thoughtful spacing
- **Interaction Polish:** Smooth transitions, clear feedback, responsive interactions
- **Contextual Relevance:** Content and actions adapt to user context
- **Accessibility:** Inclusive design that works for all users
- **Performance:** Fast, responsive, efficient
- **Consistency:** Cohesive design language across the application

**Premium UI Anti-Patterns:**
- Generic templates
- Repeated patterns
- Flat, uninteresting design
- Cluttered interfaces
- Inconsistent styling
- Poor accessibility
- Slow performance

### Define: What "AI-Native UX" Means

**AI-Native UX Characteristics:**
- **Intelligent Suggestions:** AI suggests actions based on context
- **Adaptive Interfaces:** UI adapts to user behavior and preferences
- **Predictive Behavior:** UI anticipates user needs
- **Learning from Usage:** System improves based on user feedback
- **Contextual Actions:** Actions are contextually relevant
- **Natural Language:** Users can interact using natural language
- **Transparent AI:** AI decisions are explainable and overrideable

**AI-Native UX Anti-Patterns:**
- Static interfaces
- One-size-fits-all design
- No learning or adaptation
- Black-box AI decisions
- Generic suggestions
- No natural language support
- Unexplainable AI behavior

### Define: What "Modern SaaS Quality" Means

**Modern SaaS Quality Characteristics:**
- **Professional Design:** Polished, refined, consistent
- **Product-First:** Designed around user goals, not data structures
- **Workflow-Native:** Supports natural workflows
- **Domain-Aware:** Feels native to the business domain
- **Enterprise-Ready:** Scalable, secure, compliant
- **User-Centric:** Designed for user success
- **Data-Driven:** Informed by usage data and analytics

**Modern SaaS Quality Anti-Patterns:**
- Amateur design
- CRUD-first design
- Generic workflows
- Domain-agnostic design
- Not enterprise-ready
- User-hostile design
- Not data-driven

### Define: What "Workflow-Native Design" Means

**Workflow-Native Design Characteristics:**
- **Workflow-First:** Organized around user workflows, not entities
- **Task-Centric:** Focused on completing tasks, not managing data
- **Goal-Oriented:** Designed to achieve user goals
- **Sequential:** Follows natural workflow sequences
- **Contextual:** Actions and information are contextually relevant
- **Efficient:** Streamlines workflows and reduces friction
- **Adaptive:** Adapts to workflow variations

**Workflow-Native Design Anti-Patterns:**
- Entity-first design
- Data-centric design
- Goal-agnostic design
- Random sequences
- Generic actions
- Inefficient workflows
- Rigid, non-adaptive design

---

## Appendix: Quick Reference

### Prompt Architecture Flow

```
User Prompt
    ↓
Domain Extraction
    ↓
Archetype Classification
    ↓
Workflow Inference
    ↓
User Intent Extraction
    ↓
Layout Reasoning
    ↓
UI Composition
    ↓
Component Selection
    ↓
Visual Hierarchy
    ↓
UX Polish
    ↓
Generated Application
```

### Domain-Archetype-Workflow Mapping

| Domain | Archetype | Primary Workflow | Layout | Density |
|--------|-----------|------------------|--------|---------|
| Healthcare | Healthcare Console | Scheduling | Sidebar-Content | Comfortable |
| CRM | CRM Console | Selling | Sidebar-Content | Compact |
| Analytics | Analytics Console | Analysis | Grid | Dense |
| Ecommerce | Ecommerce Console | Operation | Topbar-Content | Compact |
| Finance | Finance Console | Analysis | Grid | Dense |
| Logistics | Operations Console | Operation | Grid | Compact |
| Support | Support Console | Support | Sidebar-Content | Comfortable |
| Project Management | Project Console | Project Management | Masonry | Compact |

### Visual Hierarchy Levels

| Level | Importance | Size | Weight | Color | Placement |
|-------|------------|------|--------|-------|-----------|
| Critical | 10 | 2.0x | Bold | Primary | Zone 1 |
| High | 8-9 | 1.5x | Semi-bold | Primary | Zone 1-2 |
| Medium | 6-7 | 1.25x | Medium | Secondary | Zone 2 |
| Low | 4-5 | 1.0x | Regular | Tertiary | Zone 3 |
| Minimal | 0-3 | 0.875x | Light | Tertiary | Zone 3 |

### Prompt Layering System

```
System Prompt (Core behavior)
    ↓
Domain Prompt (Domain context)
    ↓
Archetype Prompt (Archetype patterns)
    ↓
Workflow Prompt (Workflow patterns)
    ↓
Visual Prompt (Visual guidelines)
    ↓
UX Prompt (UX guidelines)
    ↓
Refinement Prompt (Iterative improvement)
```

---

**Document Version:** 1.0  
**Last Updated:** 2026-05-21  
**Maintained By:** OneAtlas AI Team
