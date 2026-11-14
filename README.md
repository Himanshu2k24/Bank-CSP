# CSP Daily Balance & Cash Manager
### Multi-Device Financial Tracking System for CSP / Grahak Seva Kendra

Designed specifically for Customer Service Point (CSP) Operators (SBI, PNB, Bank of Baroda, Payworld, Spice Money, DigiPay, etc.).

---

## 🚀 Key Sections & Features

### 1. 📊 Daily Hisab (Reconciliation Engine)
$$\text{Expected Closing} = (\text{Account Morning} + \text{Morning Cash}) + \text{Payment Due} - \text{Udhari} - \text{Home Use}$$

$$\text{Actual Closing} = \text{Account Night} + \text{Cash Night}$$

$$\text{Difference} = \text{Actual Closing} - \text{Expected Closing}$$

* **Morning Capital:** `Account Morning Balance` + `Morning Cash`
* **Payment Due `[+] (ADD)`:** Added into balance.
* **Udhari (Udhar Diya) `[-] (SUBTRACT)`:** Cash given on credit.
* **Home Use `[-] (SUBTRACT)`:** Cash taken home for personal expenses.
* **Night Actual Balance:** `Account Night Balance` + `Cash Night`
* **Status Verdict:**
  * **Difference = ₹0:** 🟢 **Transaction Perfect!** (100% matched)
  * **Difference < 0:** 🔴 **Issue: Cash Shortage** (Missing cash)
  * **Difference > 0:** 🟡 **Issue: Cash Surplus** (Excess cash)

---

### 2. 📥 Deposit Section (Customer Account Deposits)
* Accessible via the top tab: **"Deposit"**.
* **Left Side Form:** Customer Name, Account Number, Amount (₹), Date of Payment, Submit.
* **Right Side Filter & Ledger:** Filter by `[Today]`, `[All Dates]`, or Date Picker; Search; Summary totals.
* **✏️ Modify Amount (Step History Tracking):** Keep permanent audit timeline of every previous amount and timestamp.
* **Receipts & Export:** Print thermal slip and export to CSV.

---

### 3. 💸 Kitna Baki / Diye Section (Cash Given Ledger)
* Accessible via the top tab: **"Kitna Baki / Diye"**.
* **Left Side Form:** Customer Name, Amount Given (₹), Mobile Number.
* **Right Side Filter & Ledger:** Date-wise filtering, search, WhatsApp receipts, and thermal slips.
* **✏️ Modify Amount (Step History Tracking):** Modify amounts while storing every historical change step.

---

### 4. 🗑️ Deleted Records History (डिलीट किया गया रिकॉर्ड / Recycle Bin)
* Accessible via the top tab: **"Deleted History"** (also accessible from quick buttons inside Deposit and Udhari).
* **Automatic Audit Tracking on Deletion:**
  * When any record from **Deposit** or **Udhari** is deleted, it is never lost permanently without a trace.
  * Safely captured with full details:
    * 🟢 **Details of ADD:** Original Transaction Date, System Entry Time, Customer Name, Account Number / Mobile Number, and Original Amount.
    * 🔴 **Details of DELETE:** Exact Deletion Date, Exact Deletion Time, and status.
    * 📜 **Step History:** If the record was modified before deletion, all revision steps are preserved.
* **Filters & Search:** Filter by Type (`All`, `Deposits Only`, `Udhari Only`), filter by Deletion Date, or search by customer name/number/amount.
* **1-Click Restore (वापस लाएं):** Easily restore any deleted record back to its active ledger.
* **Export:** Export deleted records log to CSV.

---

### 5. 🔒 Personal Site Security: Master Password & 7-Day Session
* **First-Time Setup:** Create a Master Password / PIN on your first visit.
* **7-Day Session Expiration:** Check *"Remember for 7 days"* to stay logged in on that device for a full week.
* **Multi-Device Lock:** When opened from any other system or mobile phone, the vault is locked until the Master Password is entered.
* **One-Click Manual Lock:** Click the lock icon in the top header anytime to lock immediately.

---

### 6. 🔄 Multi-Device Synchronization & Data Safety
* **Central Backend Server (`server.js`):**
  * Automatically stores all daily records, customer deposits, payouts, deleted history, and settings in the `data/` directory.
  * Keeps Father's PC and Son's mobile 100% in sync on the same Wi-Fi network.
* **Auto-Save & Morning Balance Persistence:**
  * Morning Cash entered at morning is automatically saved; reopening at night keeps the morning data filled in.
* **Vercel Cloud Support (`api/index.js` & `vercel.json`):**
  * Pre-configured serverless handler for Vercel deployment with optional Vercel KV / Upstash Redis support for global synchronization across systems.
* **1-Click Backup & Restore:**
  * Download all records, deposits, payouts, and deleted history as a single `.json` backup file anytime.
  * Upload the backup on any new computer or phone to restore 100% of your data.
