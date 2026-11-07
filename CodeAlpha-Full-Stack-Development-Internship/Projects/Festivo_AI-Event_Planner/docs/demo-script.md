# Festivo AI: Walkthrough Demonstration Video Script

**Target Duration**: 3 minutes 30 seconds (Strictly under 4:00 limit)  
**Presenter**: Lead Product Architect / Full-Stack Engineer  
**Tone**: Confident, articulate, professional, and celebratory.

---

### Phase 1: Problem Statement & Value Proposition (0:00 – 0:20)
- **Screen**: Landing page (`/`). Slow scroll across the hero title *"Every Celebration, Beautifully Planned"*, the 13-point AI badge, and the live plan preview.
- **Narrator**:
  > *"Organizing major celebrations—from royal weddings and milestone birthdays to community galas—is notoriously stressful. Planners juggle fragmented spreadsheets, unpredictable vendor quotes, and disorganized task checklists.*  
  > *Meet **Festivo AI**: an intelligent celebration planner built for the Prompt Wars competition that unites Gemini generative AI with real-world budget, timeline, and vendor execution."*

---

### Phase 2: Portfolio Dashboard & Event Creation (0:20 – 0:45)
- **Screen**: Navigate from Landing Page to `/dashboard`. Highlight portfolio metrics (Total Celebrations, Portfolio Budget, Utilization). Then click **"+ Plan My Event"** to enter `/events/new`.
- **Action**: Fill in a celebration:
  - Name: `Ananya & Kabir's Sunset Sangeet`
  - Type: `Wedding & Sangeet`
  - Date: Select an upcoming date
  - Location: `Goa Beach Resort`
  - Guests: `200`
  - Budget: `₹ 12,00,000`
  - Theme: `Boho Tropical Elegance & Fairy Lights`
  - Keep *"Generate 13-Point AI Master Plan Immediately"* checked. Click **"Launch Celebration Planner"**.
- **Narrator**:
  > *"Our portfolio dashboard gives hosts live visibility across all their events. Let's create a beachside Sangeet in Goa for 200 guests with a 12 lakh rupee budget. With one click, Festivo's guided wizard provisions the event and calls our backend Gemini planning engine."*

---

### Phase 3: Inspecting the 13-Point AI Master Plan (0:45 – 1:25)
- **Screen**: Transition directly to the Event Studio (`/events/:id/ai-planner`). Confetti bursts across the screen.
- **Action**: Scroll through the 13 structured sections:
  1. *Section A*: Read the executive summary.
  2. *Section B*: Show the recommended themes with color hex swatches.
  3. *Section C*: Point out the decor allocations for beachfront canopies.
  4. *Section E*: Highlight the coastal fusion menu (welcome coolers, appetizers, mains).
  5. *Section G*: Show how budget percentages add up to 100% of the ₹12L budget.
  6. *Section J*: Show the minute-by-minute day-of schedule.
- **Narrator**:
  > *"Here is the generated 13-point master plan! Notice that this isn't generic text—it's a validated JSON schema. Gemini has tailored the color palette to our tropical theme, specified coastal catering, allocated our 12 lakh budget with mathematical accuracy across every category, and structured a minute-by-minute run-of-show schedule for the event day."*

---

### Phase 4: Interactive Budget Planner & Recharts Analytics (1:25 – 2:00)
- **Screen**: Click the **"Budget"** tab (`/events/:id/budget`).
- **Action**:
  1. Point out the KPI cards: Planned Budget, Actual Spent, Remaining Buffer, and Budget Utilization.
  2. Show the responsive Recharts Bar Chart (Estimated vs. Actual by category) and Pie Chart.
  3. Click **"Add Expense"**:
     - Category: `Photography`
     - Description: `Drone Videographer Deposit`
     - Estimated: `₹ 80,000`
     - Actual Paid: `₹ 75,000`
     - Save expense. Show the total spent update and variance recalculation immediately.
- **Narrator**:
  > *"Under the Budget studio, all expenses are tracked in real-time. The Recharts bar chart directly compares estimated quotes against actual payments. When we record an 75,000 rupee drone photography deposit, our remaining budget and utilization percentages update instantly with zero page reloads."*

---

### Phase 5: Smart Timeline & Task Completion (2:00 – 2:30)
- **Screen**: Click the **"Timeline & Tasks"** tab (`/events/:id/timeline`).
- **Action**:
  1. Show the preparation progress bar (e.g. 33% complete).
  2. Filter by status: click **"Pending"** and **"Urgent"**.
  3. Click the circle next to `Finalize Tasting Menu with Beach Chef` to mark it complete. Confetti triggers and the completion percentage increases.
- **Narrator**:
  > *"In the Timeline tab, tasks are ordered chronologically based on our event date. Overdue indicators alert planners to urgent bottlenecks. Checking off a completed task triggers our celebratory confetti and updates the overall readiness metric."*

---

### Phase 6: Vendor Pipeline & Ideas Gallery (2:30 – 2:55)
- **Screen**: Quick tour of **"Vendors"** (`/events/:id/vendors`) and **"Ideas Gallery"** (`/events/:id/ideas`).
- **Action**:
  1. In Vendors, show the pipeline summary (Booked, Negotiating, To Research).
  2. In Ideas Gallery, show the curated cards. Click the star icon to favorite an idea (e.g., `Sunset Boat Arrival`).
  3. Click **"Generate AI Ideas"** to demonstrate real-time concept brainstorming.
- **Narrator**:
  > *"Our vendor pipeline tracks partners through every procurement milestone from shortlisting to signed contracts. Meanwhile, the Ideas Gallery suggests creative experiences—like floating lantern releases or botanical seed favors. Users can favorite concepts or generate fresh ideas on demand."*

---

### Phase 7: Context-Aware Conversational AI Assistant (2:55 – 3:20)
- **Screen**: Switch to **"AI Planner"** -> **"Interactive AI Chat"**.
- **Action**:
  1. Click suggested prompt: `"Explain where I can reduce costs by 10%."`
  2. The assistant returns a 3-point reduction strategy with exact rupee calculations referencing the Goa event context.
  3. Show the interactive action button rendered inside the chat response.
- **Narrator**:
  > *"Festivo includes a context-aware conversational assistant. Because it retains our current budget, guest count, and spent funds, when we ask how to reduce costs, it provides specific, calculated suggestions—such as floral repurposing between the ceremony and dinner—and offers one-click action updates."*

---

### Phase 8: Printable Executive Brief & Conclusion (3:20 – 3:30)
- **Screen**: Click **"Export / Print"** on the event header. Display the Executive Dossier preview modal with formatted tables and print layout.
- **Narrator**:
  > *"Finally, planners can export a clean, printable executive dossier or share read-only links with vendors. Festivo AI runs smoothly in both persistent MongoDB Atlas production mode and zero-friction demo mode.*  
  > *Festivo AI: Every Celebration, Beautifully Planned. Thank you!"*
