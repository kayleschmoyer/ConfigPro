Testing Jira

🏁 STEP 1: Create Your Dev Folder

Open File Explorer

Go to C:\

Right-click → New > Folder → Name it:

ConfigPro

🧭 STEP 2: Open Command Prompt as Administrator

Press Windows + S → search for:

cmd


Right-click Command Prompt → choose Run as Administrator

Navigate into your folder:

cd C:\ConfigPro

🔽 STEP 3: Clone the GitHub Repository

Paste this into the same command window:

git clone https://github.com/kayleschmoyer/ConfigPro.git .


📌 Note the . at the end — that clones into the current folder (C:\ConfigPro) without nesting it in another subfolder.

After the clone finishes, make sure you have the latest updates from the main branch:

git pull origin main

🧰 STEP 4: Install Node.js and PNPM
✅ A. Install Node.js

Go to: https://nodejs.org

Download and install the LTS version (v20+)

✅ B. Install PNPM (next-gen package manager)

In your Command Prompt:

npm install -g pnpm


Verify:

pnpm -v

📦 STEP 5: Install Project Dependencies

In C:\ConfigPro, install the Node dependencies with your preferred package manager:

pnpm install

or, if you prefer npm:

npm install


These commands read package.json and install all frontend libraries like React, Tailwind, Radix, etc.

🚀 STEP 6: Launch the Dev Server

Run:

pnpm dev


You’ll see something like:

VITE v5.0  ready in 750ms
➜  Local: http://localhost:5173/

🌐 STEP 7: View the Login Page in Your Browser

Open Chrome (or Edge)

Visit:

http://localhost:5173


✅ You should see the animated ConfigPro Login Screen, styled using your theme config.

🧭 Explore All Available Pages

Use these routes in your browser to jump directly to the different demo pages included in the project.

### Core Product Templates & Utilities

| Route | Description |
| --- | --- |
| `http://localhost:5173/` | ConfigPro Login |
| `http://localhost:5173/daycare` | Daycare Dashboard |
| `http://localhost:5173/pos` | Point of Sale (POS) demo |
| `http://localhost:5173/theme-lab` | Theme Playground for live branding tweaks |
| `http://localhost:5173/dashboard` | Feature Construction Dashboard |
| `http://localhost:5173/dev/features` | Developer Feature Playground |
| `http://localhost:5173/shared/features` | Shared Features Showcase landing page |
| `http://localhost:5173/shared/installer` | Shared Installer experience |
| `http://localhost:5173/shared/error-boundary` | Shared Feature Error Boundary demo |
| `http://localhost:5173/admin/features` | Admin Feature Management (guarded by AdminGuard) |
| `http://localhost:5173/industries/retail` | Retail Industry Base Experience |
| `http://localhost:5173/industries/daycare` | Daycare Industry Base Experience |
| `http://localhost:5173/industries/construction` | Construction Industry Base Experience |
| `http://localhost:5173/industries/automotive` | Automotive Industry Base Experience |

### Scheduling & Workforce

| Route | Description |
| --- | --- |
| `http://localhost:5173/scheduler` | Scheduler suite (defaults to Schedule view) |
| `http://localhost:5173/scheduler/availability` | Scheduler Availability planning |
| `http://localhost:5173/scheduler/rules` | Scheduler Rules configuration |
| `http://localhost:5173/scheduler/auto` | Auto-Scheduler automation |
| `http://localhost:5173/scheduler/swaps` | Shift swap management |
| `http://localhost:5173/scheduler/publishing` | Publishing center |
| `http://localhost:5173/scheduler/reports` | Scheduler reporting |
| `http://localhost:5173/scheduler/settings` | Scheduler settings |
| `http://localhost:5173/scheduling` | Scheduling layout shell (defaults to Manager Console) |
| `http://localhost:5173/scheduling/manager` | Scheduling Manager Console |
| `http://localhost:5173/scheduling/employee` | Scheduling Employee Portal |
| `http://localhost:5173/time-clock` | Time Clock hub (defaults to Overview) |
| `http://localhost:5173/time-clock/clock` | Time Clock punch view |
| `http://localhost:5173/time-clock/breaks` | Time Clock breaks review |
| `http://localhost:5173/time-clock/timesheets` | Time Clock timesheets |
| `http://localhost:5173/time-clock/scheduling` | Time Clock scheduling snapshot |
| `http://localhost:5173/time-clock/approvals` | Time Clock approvals |
| `http://localhost:5173/time-clock/exceptions` | Time Clock exceptions |
| `http://localhost:5173/time-clock/policies` | Time Clock policy management |
| `http://localhost:5173/time-clock/devices` | Time Clock device management |
| `http://localhost:5173/time-clock/reports` | Time Clock reporting |
| `http://localhost:5173/time-clock/settings` | Time Clock configuration |

### Forecasting

| Route | Description |
| --- | --- |
| `http://localhost:5173/forecasting` | Forecasting layout (defaults to Demand Studio) |
| `http://localhost:5173/forecasting/studio` | Forecasting Demand Studio |
| `http://localhost:5173/forecasting/workbench` | Forecasting Scenario Workbench |

### Accounts Receivable (AR)

| Route | Description |
| --- | --- |
| `http://localhost:5173/ar` | AR Home (dashboards and KPIs) |
| `http://localhost:5173/ar/invoices` | AR Invoices workspace |
| `http://localhost:5173/ar/payments` | AR Payments center |
| `http://localhost:5173/ar/customers` | AR Customer management |
| `http://localhost:5173/ar/aging` | AR Aging analysis |
| `http://localhost:5173/ar/disputes` | AR Dispute resolution |
| `http://localhost:5173/ar/automation` | AR Automation designer |
| `http://localhost:5173/ar/reports` | AR reporting dashboards |
| `http://localhost:5173/ar/settings` | AR configuration settings |

### Inventory Intelligence

| Route | Description |
| --- | --- |
| `http://localhost:5173/inventory` | Inventory Intelligence home |
| `http://localhost:5173/inventory/forecasts` | Inventory demand forecasts |
| `http://localhost:5173/inventory/replenishment` | Replenishment planning |
| `http://localhost:5173/inventory/suppliers` | Supplier collaboration |
| `http://localhost:5173/inventory/balancer` | Inventory balancer tooling |
| `http://localhost:5173/inventory/kits` | Kit and bundle management |
| `http://localhost:5173/inventory/exceptions` | Exception monitoring |
| `http://localhost:5173/inventory/automation` | Automation rules |
| `http://localhost:5173/inventory/reports` | Inventory reporting |
| `http://localhost:5173/inventory/settings` | Inventory configuration |

### Shared Feature Microsites

These routes are generated from the shared feature registry and surface individual configuration workspaces:

| Route | Description |
| --- | --- |
| `http://localhost:5173/shared/users-and-roles` | Users & Roles |
| `http://localhost:5173/shared/org-and-locations` | Organizations & Locations |
| `http://localhost:5173/shared/catalog` | Catalog & Attributes |
| `http://localhost:5173/shared/pricing-rules` | Pricing Rules |
| `http://localhost:5173/shared/tax-rules` | Tax Rules |
| `http://localhost:5173/shared/payment-providers` | Payment Providers |
| `http://localhost:5173/shared/documents-and-branding` | Documents & Branding |
| `http://localhost:5173/shared/order-workflows` | Order Workflow |
| `http://localhost:5173/shared/inventory-settings` | Inventory Settings |
| `http://localhost:5173/shared/customer-fields` | Customer Fields |
| `http://localhost:5173/shared/notifications` | Notifications |
| `http://localhost:5173/shared/reporting` | Reporting |
| `http://localhost:5173/shared/data-import-export` | Data Import / Export |
| `http://localhost:5173/shared/feature-flags` | Feature Flags |
| `http://localhost:5173/shared/audit-log` | Audit Log |
| `http://localhost:5173/shared/localization` | Localization |
| `http://localhost:5173/shared/branding` | Branding |
| `http://localhost:5173/shared/time-intelligence-hub` | Time Intelligence Hub |

🎨 Customize the Theme (Brand Colors, Logo, Fonts)

Open this file in VS Code:

src/app/config/theme.ts


You’ll find:

primaryColor

fontFamily

logoPath

themePresets

✅ To apply changes:

Modify values in theme.ts

Save the file

Refresh browser → changes apply instantly

⚙️ Example: Add a New Component

You can scaffold a new UI component using:

pnpm create:component PaymentStatus ui


This will create a new file:

src/shared/ui/PaymentStatus.tsx


…with typed props, export, and a base layout.

🧪 Troubleshooting Tips
Issue	Fix
pnpm: command not found	Run npm install -g pnpm
Port already in use	Run pnpm dev --port 5174
Blank screen	Check browser dev tools (F12) for JS errors
Git clone failed	Make sure Git is installed and repo is public/private access is set

📂 Your Final Folder Structure
After setup, your local structure looks like:

C:\
└── ConfigPro\
    ├── package.json
    ├── src\
    │   ├── app\
    │   ├── components\
    │   ├── features\
    │   ├── pages\
    │   └── ...

✅ You’re Done!

You now have ConfigPro running locally with:

Live theming

Login screen visible at localhost:5173

Git-based version control

Modern, professional DX
