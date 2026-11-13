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
* **Left Side Form:**
  * **Name of Customer**
  * **Account Number**
  * **Amount (₹)**
  * **Date of Payment**
  * **Submit Button**
* **Right Side Filter & Ledger:**
  * **Date-wise Filter:** Filter by specific date, `[Today]`, or `[All Dates]`.
  * **Search:** Search by customer name or account number.
  * **Summary:** Total deposited amount & transaction count.
  * **✏️ Modify Amount (Step History Tracking):**
    * Rather than deleting, click the **Modify** button to update the amount.
    * **All steps are stored:** Keeps a permanent audit timeline of every previous amount, modification timestamp, and reason!
  * **Receipts & Export:** Print deposit receipt and export to CSV.

---

### 3. 💸 Kitna Baki / Diye Section (Cash Given Ledger)
* Accessible via the top tab: **"Kitna Baki / Diye"**.
* **Left Side Form:**
  * **Customer Name**
  * **Amount Given (₹)**
  * **Mobile Number**
* **Right Side Filter & Ledger:**
  * **Date-wise Filter:** Filter by specific date, `[Today]`, or `[All Dates]`.
  * **Search:** Search by customer name or mobile number.
  * **✏️ Modify Amount (Step History Tracking):**
    * Modify amount while storing every historical change step in the audit timeline.
  * **Receipts & WhatsApp:** Instant WhatsApp confirmation receipt and thermal print slip.
  * **Export:** Export to CSV.

---

### 4. 🔒 Personal Site Security: Master Password & 7-Day Session
* **First-Time Setup:** On your first visit, create a Master Password / PIN.
* **7-Day Session Expiration:** Check *"Remember for 7 days"* to stay logged in on that device for a full week.
* **Multi-Device Lock:** When opened from any other system or mobile phone, the vault is locked until the Master Password is entered.
* **One-Click Manual Lock:** Click the lock icon in the top header anytime to lock immediately.

---

### 5. 🔄 Multi-Device Synchronization & Data Safety
* **Central Backend Server (`server.js`):**
  * Automatically stores all daily records, customer deposits, payouts, and settings in the `data/` directory.
  * Keeps Father's PC and Son's mobile 100% in sync on the same Wi-Fi network.
* **Auto-Save & Morning Balance Persistence:**
  * Morning Cash entered at morning is automatically saved; when opening at night, the morning data is preserved and pre-filled.
* **Vercel Cloud Support (`api/index.js` & `vercel.json`):**
  * Pre-configured serverless handler for Vercel deployment with optional Vercel KV / Upstash Redis support for global synchronization across systems.
* **1-Click Backup & Restore:**
  * Download all records, deposits, and payouts as a single `.json` backup file anytime.
  * Upload the backup on any new computer or phone to restore 100% of your data.
