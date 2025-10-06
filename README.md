# LeadBoost 

Welcome to **LeadBoost**!

## Design & style notes

- Consistent spacing: form fields and cards use a 16px vertical rhythm and 12–16px internal padding for compact, readable layout.
- Iconography: simple line icons (from Lucide) provide quick affordances for actions (upload, score, generate). Color accents use a purple gradient to highlight primary actions.
- Responsive behavior: layout stacks on small screens, and primary buttons expand to full width for easier tap targets on mobile.
- Accessibility: buttons include aria labels and descriptions; onboarding dialog traps focus and can be dismissed with Escape.

Design rationale: we prioritize clarity and quick action — users should be able to add several leads, run scoring, and act on high-priority leads in under a minute. The UI exposes both deterministic base scores and AI insights to make scoring auditable and explainable for reviewers.

## 🌟 What is LeadBoost?

LeadBoost is a web application that helps you collect, organize, and contact potential business customers (called **leads**). It uses advanced AI (Google Gemini) to help you decide which leads are most valuable and to write personalized messages for you.

---

## 🤔 What is a Lead?

A **lead** is a person or company that might be interested in your product or service. For example:
- A manager at a company you want to sell to
- Someone who filled out a form on your website
- A business contact you found on LinkedIn

Each lead usually has information like:
- Name
- Email
- Company
- Industry
- LinkedIn profile

---

## 🏗️ What Does LeadBoost Do?

1. **Collects leads** – You can add leads one by one or upload a list from a CSV file (like a spreadsheet).
2. **Scores leads with AI** – The app uses Gemini AI to give each lead a score (0–100) showing how valuable they are, and explains why.
3. **Shows all your leads in a table** – You can search, filter, and export your leads.
4. **Writes messages for you** – For any lead, you can ask the AI to write a personalized email or LinkedIn message.
5. **Lets you manage your profile** – You can update your name/email and see your usage stats.

---

## 🖥️ Main Parts of the App (Step by Step)

### 1. **Landing Page**
- The first page you see. It explains what LeadBoost does and has buttons to get started.

### 2. **Dashboard**
- The main area after you log in. It has a sidebar (menu on the left) and a top bar.

#### **Sidebar Sections:**
- **Generate Leads**: Add new leads one at a time or upload a CSV file.
- **Score Leads**: See a summary of your leads and their scores.
- **Enriched Leads Table**: View all your leads in a big table. You can search, filter, export, and use AI features here.
- **Draft Email / LinkedIn Message**: Compose or generate outreach messages.
- **Profile**: Manage your user info and see stats.

#### **Top Bar:**
- Shows the current section name.
- Has a profile icon (click it to go to your profile page).

---

## 🤖 How Does the AI Help?

- **Lead Scoring**: When you add a lead, Gemini AI looks at their info (company, industry, recent news) and gives a score (0–100) showing how likely they are to be a good customer. It also writes a short explanation (e.g., “High-value prospect because their company just raised funding in a fast-growing industry.”)
- **Personalized Messages**: For any lead, you can click a button to have Gemini write a custom email or LinkedIn message. The message will mention their company, role, and any recent news, making it more likely to get a reply.

---

## 📝 How to Use Each Feature

### **A. Add Leads**
- Go to **Generate Leads**.
- Fill out the form for each lead (name, email, etc.) and click “Add Lead.”
- Or, click “Upload CSV” to add many leads at once from a spreadsheet file.

### **B. Score Leads**
- After adding leads, go to **Score Leads**.
- Click “Finish & Score” to let the AI score all your leads.
- You’ll see a list of leads with their scores and explanations.

### **C. View and Manage Leads**
- Go to **Enriched Leads Table**.
- Here you can:
  - **Search** for leads by name or company
  - **Filter** by priority (High, Medium, Low)
  - **Export** all leads as a CSV file
  - **See AI Insight**: Hover or look at the “AI Insight” column for the AI’s explanation
  - **Generate Email/LinkedIn**: Click the buttons in the “Actions” column to have the AI write a message for you. The message will pop up in a window—just copy and use it!

### **D. Profile Page**
- Click the profile icon in the top right or choose “Profile” in the sidebar.
- Here you can:
  - Change your name and email (saved in your browser)
  - Download your profile and stats as a JSON file
  - See stats like “Leads Processed” and “Emails Generated”
  - Click “Upgrade Plan” or “Account Settings” (these show a message for now)
  - Sign out

---

## 📂 CSV Import/Export Example

- **Import**: Your CSV should have columns like Name, Email, Company, Industry, LinkedIn. Example:

  | Name      | Email              | Company   | Industry   | LinkedIn                |
  |-----------|--------------------|-----------|------------|-------------------------|
  | Jane Doe  | jane@acme.com      | Acme Inc  | Technology | linkedin.com/in/janedoe |

- **Export**: Click “Export CSV” in the Enriched Leads Table to download all your leads.

---

## 🛠️ Tech Stack (What’s Under the Hood)

- **Frontend**: React (for the user interface)
- **Backend**: Python Flask (handles API requests and talks to Gemini)
- **AI**: Google Gemini API (does the smart stuff)

---

## 📖 Glossary

- **Lead**: A potential customer or business contact.
- **CSV**: A simple spreadsheet file format (Comma-Separated Values).
- **AI Insight**: The explanation from Gemini about why a lead got its score.
- **Gemini**: Google’s advanced AI model used for scoring and writing.
- **Profile**: Your user info and stats page.
- **Export**: Download your data to use elsewhere.
- **Enriched**: Means the lead has extra info and AI analysis.

---

If you’re ever unsure what a button does, just hover over it or try it out—LeadBoost is designed to be simple and helpful!


  ## Running the code
  
  ## Lead qualification criteria

  LeadBoost uses a simple, auditable rubric to convert lead attributes into a priority score (0-100). The app currently uses AI enrichment to suggest a priority, but we also recommend a deterministic base score for repeatable results. The rubric below is used to explain scores and guide follow-up actions.

  Scoring rubric (example):
  - Role seniority (0-30): C-level/Founder = 30, VP/Director = 20, Manager = 10, Individual contributor = 0
  - Company fit / size (0-25): Enterprise / ideal ICP = 25, Mid-market = 15, Small / partial fit = 5
  - Intent signals (0-25): Recent funding, hiring, product launch = 25 for strong signals, 10 for moderate, 0 for none
  - Contact quality (0-10): Public email + LinkedIn present = 10, partial = 5
  - Recency / contextual fit (0-10): Recent news or explicit signals matching your product = 0–10

  Total = 100. Map to categories:
  - 80–100: High (immediate outreach)
  - 50–79: Medium (nurture sequence / further qualification)
  - 0–49: Low (deprioritize or add to long-term nurture)

  Implementation notes:
  - The app currently asks Gemini for a `priorityScore` and `aiInsight`. If Gemini fails or returns an invalid score, the backend will fall back to a deterministic base score using the rubric above (recommended change to implement for reproducibility).
  - Store both `base_score` and `ai_score` where possible so reviewers can see the deterministic calculation and the AI rationale side-by-side.

  ## Business scenarios & ICP examples

  Example 1 — Enterprise ICP (High priority):
  - ICP: VP/Head of IT or Product at 500+ employee SaaS companies in finance or healthcare
  - Signals: Series B/C funding in last 12 months, open hiring for engineering or product, recent product launch
  - Action: Immediate outbound outreach from SDR with tailored pitch — use AI-generated email referencing funding / product event

  Example 2 — Mid-market ICP (Medium priority):
  - ICP: Director-level marketing or operations at 50–500 employee companies in e-commerce
  - Signals: Quarterly growth signals, some public hiring, company blog announcing a new initiative
  - Action: Nurture sequence (2–3 touchpoints), send educational content first, then tailored product pitch

  Example 3 — Low-fit (Low priority):
  - ICP: Individual contributors or companies outside target industries
  - Signals: No clear intent, missing contact info
  - Action: Add to long-term nurture list; prioritize data enrichment before outreach


  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

  ## Local development with Flask + Vite

  1. Create Python venv and install backend deps:
  ```
  python -m venv .venv
  .\.venv\Scripts\activate
  pip install -r backend/requirements.txt
  ```

  2. Configure environment variables (create `.env` next to `backend/app.py`):
  ```
  GEMINI_API_KEY=your_google_generative_ai_key_here
  PORT=5000
  ```

  3. Start both servers:
  ```
  npm run dev:all
  ```

  Vite runs on http://localhost:3000 and proxies `/api/*` to Flask on http://localhost:5000.

  ### API
  - POST `/api/generate` with JSON `{ prompt, model?, system?, temperature? }`
    - Returns `{ text }` or `{ error }`.
  