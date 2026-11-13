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

### 4. 🌐 Vercel Ready
* Includes `vercel.json` for instant zero-configuration deployment on Vercel.
