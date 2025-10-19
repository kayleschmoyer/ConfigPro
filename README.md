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

Use these routes in your browser to jump directly to the different demo pages included in the project:

- http://localhost:5173/ — ConfigPro Login
- http://localhost:5173/daycare — Daycare Dashboard
- http://localhost:5173/pos — Point of Sale (POS)
- http://localhost:5173/theme-lab — Theme Playground
- http://localhost:5173/dashboard — Feature Construction Dashboard
- http://localhost:5173/shared/features — Shared Features Showcase
- http://localhost:5173/shared/time-intelligence-hub — Time Intelligence Hub
- http://localhost:5173/scheduling — Scheduling Manager Console (with nested routes for /manager and /employee)
- http://localhost:5173/forecasting — Forecasting Demand Studio (with nested routes for /studio and /workbench)

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

src/components/ui/PaymentStatus.tsx


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
