/**
 * CSP Daily Balance & Cash Manager
 * Multi-device Synchronized Financial Manager
 * Features:
 *  - Master Password Protection with 7-Day Session Expiration
 *  - Cross-Device Safe Data Sync & Backup/Restore
 *  - Daily Reconciliation, Customer Deposits & Kitna Baki / Diye Ledgers
 *  - Date-wise Filters & Step History Tracking for Modifications
 */

(function () {
  'use strict';

  // --- STATE ---
  let activeTab = 'daily'; // 'daily', 'deposit', or 'payouts'
  let activeDenomTarget = 'morning';
  let centerName = localStorage.getItem('csp_center_name') || 'CSP Balance Manager';
  let masterPassword = localStorage.getItem('csp_master_password') || '';
  let isServerConnected = false;

  // Active items for modals
  let currentActivePayout = null;
  let currentActiveDeposit = null;
  let activeModifyType = null; // 'deposit' or 'payout'
  let activeModifyItem = null;

  // DOM Elements
  const el = {
    // Lock Screen Elements
    lockScreenOverlay: document.getElementById('lockScreenOverlay'),
    lockCard: document.getElementById('lockCard'),
    lockScreenTitle: document.getElementById('lockScreenTitle'),
    lockScreenSubtitle: document.getElementById('lockScreenSubtitle'),
    lockScreenForm: document.getElementById('lockScreenForm'),
    lockInputLabel: document.getElementById('lockInputLabel'),
    lockPasswordInput: document.getElementById('lockPasswordInput'),
    togglePasswordVisibilityBtn: document.getElementById('togglePasswordVisibilityBtn'),
    togglePasswordIcon: document.getElementById('togglePasswordIcon'),
    rememberMeContainer: document.getElementById('rememberMeContainer'),
    rememberMeCheckbox: document.getElementById('rememberMeCheckbox'),
    unlockBtnText: document.getElementById('unlockBtnText'),
    lockErrorMsg: document.getElementById('lockErrorMsg'),
    lockSiteBtn: document.getElementById('lockSiteBtn'),

    // Top Navigation & Tabs
    headerTitle: document.getElementById('headerTitle'),
    editCenterBtn: document.getElementById('editCenterBtn'),
    tabDailyHisab: document.getElementById('tabDailyHisab'),
    tabDeposit: document.getElementById('tabDeposit'),
    tabDepositBadge: document.getElementById('tabDepositBadge'),
    tabKitnaDiye: document.getElementById('tabKitnaDiye'),
    tabKitnaDiyeBadge: document.getElementById('tabKitnaDiyeBadge'),

    // Views
    viewDailyHisab: document.getElementById('viewDailyHisab'),
    viewDeposit: document.getElementById('viewDeposit'),
    viewKitnaDiye: document.getElementById('viewKitnaDiye'),
    selectedDate: document.getElementById('selectedDate'),

    // Top Controls
    openBackupBtn: document.getElementById('openBackupBtn'),
    openHistoryBtn: document.getElementById('openHistoryBtn'),
    printReportBtn: document.getElementById('printReportBtn'),

    // Daily Balance Inputs
    accountMorning: document.getElementById('accountMorning'),
    morningCash: document.getElementById('morningCash'),
    paymentDue: document.getElementById('paymentDue'),
    udhari: document.getElementById('udhari'),
    homeUse: document.getElementById('homeUse'),
    accountNight: document.getElementById('accountNight'),
    cashNight: document.getElementById('cashNight'),

    // Badges & Subtotals
    subtotalMorningBadge: document.getElementById('subtotalMorningBadge'),
    subtotalNightBadge: document.getElementById('subtotalNightBadge'),

    // Breakdown Steps
    stepMorningTotal: document.getElementById('stepMorningTotal'),
    stepDue: document.getElementById('stepDue'),
    stepUdhari: document.getElementById('stepUdhari'),
    stepHome: document.getElementById('stepHome'),
    stepExpected: document.getElementById('stepExpected'),
    stepActual: document.getElementById('stepActual'),

    // Verdict Hero
    verdictCard: document.getElementById('verdictCard'),
    verdictBadge: document.getElementById('verdictBadge'),
    verdictHero: document.getElementById('verdictHero'),
    verdictIconContainer: document.getElementById('verdictIconContainer'),
    verdictIcon: document.getElementById('verdictIcon'),
    verdictTitle: document.getElementById('verdictTitle'),
    verdictSubtitle: document.getElementById('verdictSubtitle'),
    diffAmountBox: document.getElementById('diffAmountBox'),
    diffAmountText: document.getElementById('diffAmountText'),
    diagnosisBox: document.getElementById('diagnosisBox'),

    // Daily Actions
    resetDayBtn: document.getElementById('resetDayBtn'),
    fillDemoBtn: document.getElementById('fillDemoBtn'),
    saveRecordBtn: document.getElementById('saveRecordBtn'),

    // ===================================
    // DEPOSIT SECTION ELEMENTS
    // ===================================
    depositForm: document.getElementById('depositForm'),
    depositCustomerName: document.getElementById('depositCustomerName'),
    depositAccountNumber: document.getElementById('depositAccountNumber'),
    depositAmount: document.getElementById('depositAmount'),
    depositPaymentDate: document.getElementById('depositPaymentDate'),
    depositSummaryTotal: document.getElementById('depositSummaryTotal'),
    depositSummaryCount: document.getElementById('depositSummaryCount'),
    depositFilterDate: document.getElementById('depositFilterDate'),
    depositFilterTodayBtn: document.getElementById('depositFilterTodayBtn'),
    depositFilterAllBtn: document.getElementById('depositFilterAllBtn'),
    exportDepositsCsvBtn: document.getElementById('exportDepositsCsvBtn'),
    depositSearchInput: document.getElementById('depositSearchInput'),
    depositsListContainer: document.getElementById('depositsListContainer'),

    // Deposit Confirmation Modal
    confirmDepositModal: document.getElementById('confirmDepositModal'),
    confirmDepositCustomerName: document.getElementById('confirmDepositCustomerName'),
    confirmDepositAccountNumber: document.getElementById('confirmDepositAccountNumber'),
    confirmDepositAmount: document.getElementById('confirmDepositAmount'),
    confirmDepositPaymentDate: document.getElementById('confirmDepositPaymentDate'),
    confirmPrintDepositReceiptBtn: document.getElementById('confirmPrintDepositReceiptBtn'),
    confirmCloseDepositModalBtn: document.getElementById('confirmCloseDepositModalBtn'),

    // ===================================
    // "KITNA DIYE / BAKI" ELEMENTS
    // ===================================
    payoutForm: document.getElementById('payoutForm'),
    payoutName: document.getElementById('payoutName'),
    payoutAmount: document.getElementById('payoutAmount'),
    payoutMobile: document.getElementById('payoutMobile'),
    payoutSummaryTotal: document.getElementById('payoutSummaryTotal'),
    payoutSummaryCount: document.getElementById('payoutSummaryCount'),
    payoutFilterDate: document.getElementById('payoutFilterDate'),
    payoutFilterTodayBtn: document.getElementById('payoutFilterTodayBtn'),
    payoutFilterAllBtn: document.getElementById('payoutFilterAllBtn'),
    searchPayoutInput: document.getElementById('searchPayoutInput'),
    exportPayoutsCsvBtn: document.getElementById('exportPayoutsCsvBtn'),
    payoutsListContainer: document.getElementById('payoutsListContainer'),

    // Payout Confirmation Modal
    confirmEntryModal: document.getElementById('confirmEntryModal'),
    confirmCustomerName: document.getElementById('confirmCustomerName'),
    confirmCustomerAmount: document.getElementById('confirmCustomerAmount'),
    confirmCustomerMobile: document.getElementById('confirmCustomerMobile'),
    confirmCustomerTime: document.getElementById('confirmCustomerTime'),
    confirmSendWhatsAppBtn: document.getElementById('confirmSendWhatsAppBtn'),
    confirmPrintReceiptBtn: document.getElementById('confirmPrintReceiptBtn'),
    confirmCloseModalBtn: document.getElementById('confirmCloseModalBtn'),

    // ===================================
    // UNIVERSAL MODIFY AMOUNT MODAL
    // ===================================
    modifyModal: document.getElementById('modifyModal'),
    closeModifyModal: document.getElementById('closeModifyModal'),
    cancelModifyBtn: document.getElementById('cancelModifyBtn'),
    saveModifyBtn: document.getElementById('saveModifyBtn'),
    modifyModalCustomerName: document.getElementById('modifyModalCustomerName'),
    modifyModalAccountOrMobileLabel: document.getElementById('modifyModalAccountOrMobileLabel'),
    modifyModalAccountOrMobile: document.getElementById('modifyModalAccountOrMobile'),
    modifyModalCurrentAmount: document.getElementById('modifyModalCurrentAmount'),
    modifyNewAmountInput: document.getElementById('modifyNewAmountInput'),
    modifyReasonInput: document.getElementById('modifyReasonInput'),
    modifyStepsTimelineContainer: document.getElementById('modifyStepsTimelineContainer'),

    // ===================================
    // BACKUP & SYNC MODAL
    // ===================================
    backupModal: document.getElementById('backupModal'),
    closeBackupModal: document.getElementById('closeBackupModal'),
    syncServerDot: document.getElementById('syncServerDot'),
    syncServerStatusText: document.getElementById('syncServerStatusText'),
    syncServerSubtext: document.getElementById('syncServerSubtext'),
    forceSyncBtn: document.getElementById('forceSyncBtn'),
    downloadBackupBtn: document.getElementById('downloadBackupBtn'),
    restoreFileInput: document.getElementById('restoreFileInput'),

    // Denomination Modal
    denomModal: document.getElementById('denomModal'),
    denomModalTitle: document.getElementById('denomModalTitle'),
    openMorningDenomBtn: document.getElementById('openMorningDenomBtn'),
    openNightDenomBtn: document.getElementById('openNightDenomBtn'),
    closeDenomModal: document.getElementById('closeDenomModal'),
    clearDenomBtn: document.getElementById('clearDenomBtn'),
    applyDenomBtn: document.getElementById('applyDenomBtn'),
    denomCoins: document.getElementById('denomCoins'),
    denomCoinsSubtotal: document.getElementById('denomCoinsSubtotal'),
    denomGrandTotal: document.getElementById('denomGrandTotal'),

    // History Modal
    historyModal: document.getElementById('historyModal'),
    closeHistoryModal: document.getElementById('closeHistoryModal'),
    historyListContainer: document.getElementById('historyListContainer'),
    historyCountBadge: document.getElementById('historyCountBadge'),
    clearAllHistoryBtn: document.getElementById('clearAllHistoryBtn'),

    // Center Details Modal
    centerModal: document.getElementById('centerModal'),
    cancelCenterBtn: document.getElementById('cancelCenterBtn'),
    saveCenterBtn: document.getElementById('saveCenterBtn'),
    settingCenterName: document.getElementById('settingCenterName'),
    settingPassword: document.getElementById('settingPassword'),

    // Print Slips
    printableSlip: document.getElementById('printableSlip'),
    slipCenterName: document.getElementById('slipCenterName'),
    slipDate: document.getElementById('slipDate'),
    slipAccountMorning: document.getElementById('slipAccountMorning'),
    slipMorningCash: document.getElementById('slipMorningCash'),
    slipTotalMorning: document.getElementById('slipTotalMorning'),
    slipDue: document.getElementById('slipDue'),
    slipUdhari: document.getElementById('slipUdhari'),
    slipHome: document.getElementById('slipHome'),
    slipExpected: document.getElementById('slipExpected'),
    slipAccountNight: document.getElementById('slipAccountNight'),
    slipCashNight: document.getElementById('slipCashNight'),
    slipActual: document.getElementById('slipActual'),
    slipVerdictBox: document.getElementById('slipVerdictBox'),
    slipVerdictTitle: document.getElementById('slipVerdictTitle'),
    slipDiffAmount: document.getElementById('slipDiffAmount'),

    // Printable Receipt
    printableReceipt: document.getElementById('printableReceipt'),
    receiptCenterName: document.getElementById('receiptCenterName'),
    receiptDate: document.getElementById('receiptDate'),
    receiptType: document.getElementById('receiptType'),
    receiptCustomerName: document.getElementById('receiptCustomerName'),
    receiptAccountOrMobileLabel: document.getElementById('receiptAccountOrMobileLabel'),
    receiptCustomerAccountOrMobile: document.getElementById('receiptCustomerAccountOrMobile'),
    receiptCustomerAmount: document.getElementById('receiptCustomerAmount'),

    // Toast
    toast: document.getElementById('toast'),
    toastMsg: document.getElementById('toastMsg')
  };

  // --- HELPERS ---
  function formatINR(val) {
    if (isNaN(val) || val === null || val === undefined) return '₹0';
    return '₹' + Number(val).toLocaleString('en-IN', {
      maximumFractionDigits: 2,
      minimumFractionDigits: Number.isInteger(Number(val)) ? 0 : 2
    });
  }

  function getNum(input) {
    if (!input) return 0;
    const v = parseFloat(input.value);
    return isNaN(v) ? 0 : v;
  }

  function showToast(msg) {
    el.toastMsg.innerText = msg;
    el.toast.classList.remove('opacity-0', 'pointer-events-none');
    el.toast.classList.add('opacity-100');
    setTimeout(() => {
      el.toast.classList.remove('opacity-100');
      el.toast.classList.add('opacity-0', 'pointer-events-none');
    }, 2200);
  }

  // Prevent accidental increment/decrement on scroll
  document.addEventListener('wheel', function (e) {
    if (document.activeElement && document.activeElement.type === 'number') {
      document.activeElement.blur();
    }
  }, { passive: true });

  // =========================================================================
  // 🔒 MASTER PASSWORD & 7-DAY EXPIRATION SYSTEM
  // =========================================================================
  const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

  function checkPasswordAuth() {
    // 1. If no password set anywhere yet
    if (!masterPassword) {
      el.lockScreenTitle.innerText = "Setup Master Password / PIN";
      el.lockScreenSubtitle.innerText = "Set a secure password for your personal site";
      el.lockInputLabel.innerText = "Create New Password / PIN";
      el.unlockBtnText.innerText = "Save & Unlock";
      el.rememberMeContainer.classList.add('hidden');
      el.lockScreenOverlay.classList.remove('hidden');
      return false;
    }

    // 2. Check 7-day session expiration
    const expiry = localStorage.getItem('csp_session_expiry');
    const now = Date.now();

    if (expiry && now < Number(expiry)) {
      // Session is valid within 7 days -> Auto-unlock!
      el.lockScreenOverlay.classList.add('hidden');
      return true;
    }

    // 3. Expired or not logged in -> Prompt for password
    el.lockScreenTitle.innerText = "Personal CSP Vault";
    el.lockScreenSubtitle.innerText = "Enter your Master Password / PIN to unlock";
    el.lockInputLabel.innerText = "Password / PIN";
    el.unlockBtnText.innerText = "Unlock Site";
    el.rememberMeContainer.classList.remove('hidden');
    el.lockErrorMsg.classList.add('hidden');
    el.lockPasswordInput.value = '';
    el.lockScreenOverlay.classList.remove('hidden');
    return false;
  }

  function handleUnlockSubmit(e) {
    e.preventDefault();
    const entered = el.lockPasswordInput.value.trim();

    // Setup mode: user sets new password
    if (!masterPassword) {
      if (!entered || entered.length < 3) {
        alert('Password should be at least 3 characters or numbers long!');
        return;
      }
      masterPassword = entered;
      localStorage.setItem('csp_master_password', masterPassword);
      // Set 7 days session
      const expiry = Date.now() + SEVEN_DAYS_MS;
      localStorage.setItem('csp_session_expiry', expiry.toString());
      el.lockScreenOverlay.classList.add('hidden');
      showToast('Master password saved! Unlocked for 7 days.');
      syncAllDataToServer();
      return;
    }

    // Verify existing password
    if (entered === masterPassword) {
      el.lockErrorMsg.classList.add('hidden');
      const remember = el.rememberMeCheckbox.checked;
      const expiry = Date.now() + (remember ? SEVEN_DAYS_MS : 2 * 60 * 60 * 1000);
      localStorage.setItem('csp_session_expiry', expiry.toString());
      el.lockScreenOverlay.classList.add('hidden');
      showToast('Unlocked! Access valid for 7 days.');
    } else {
      el.lockErrorMsg.classList.remove('hidden');
      el.lockCard.classList.remove('animate-shake');
      void el.lockCard.offsetWidth; // Trigger reflow for animation
      el.lockCard.classList.add('animate-shake');
      el.lockPasswordInput.select();
    }
  }

  function lockSiteManually() {
    localStorage.removeItem('csp_session_expiry');
    checkPasswordAuth();
    showToast('Site locked successfully');
  }

  // =========================================================================
  // CROSS-DEVICE DATA SYNCHRONIZATION & SAFETY
  // =========================================================================
  async function checkServerStatusAndSync() {
    try {
      const res = await fetch('/api/all-data', { cache: 'no-store' });
      if (res.ok) {
        isServerConnected = true;
        const data = await res.json();
        
        // 1. Merge Settings & Password
        if (data.settings) {
          if (data.settings.centerName) {
            centerName = data.settings.centerName;
            localStorage.setItem('csp_center_name', centerName);
            el.headerTitle.innerText = centerName;
          }
          if (data.settings.password) {
            if (masterPassword && masterPassword !== data.settings.password) {
              localStorage.removeItem('csp_session_expiry');
            }
            masterPassword = data.settings.password;
            localStorage.setItem('csp_master_password', masterPassword);
          }
        }

        // 2. Merge Deposits
        if (Array.isArray(data.deposits) && data.deposits.length > 0) {
          const localDeposits = getDeposits();
          const merged = mergeArraysById(localDeposits, data.deposits);
          localStorage.setItem('csp_deposits', JSON.stringify(merged));
        }

        // 3. Merge Payouts
        if (Array.isArray(data.payouts) && data.payouts.length > 0) {
          const localPayouts = getPayouts();
          const merged = mergeArraysById(localPayouts, data.payouts);
          localStorage.setItem('csp_payouts', JSON.stringify(merged));
        }

        // 4. Merge Daily Hisab Records
        if (data.records && Object.keys(data.records).length > 0) {
          let localHistory = JSON.parse(localStorage.getItem('csp_history') || '[]');
          const serverList = Object.keys(data.records).map(k => data.records[k]);
          const merged = mergeArraysByDate(localHistory, serverList);
          localStorage.setItem('csp_history', JSON.stringify(merged));
        }

        updateSyncUiStatus(true);
        return;
      }
    } catch (e) {
      isServerConnected = false;
    }
    updateSyncUiStatus(false);
  }

  function mergeArraysById(localArr, remoteArr) {
    const map = new Map();
    remoteArr.forEach(item => map.set(item.id, item));
    localArr.forEach(item => {
      if (!map.has(item.id)) {
        map.set(item.id, item);
      } else {
        // Keep whichever has longer step history or newer timestamp
        const remoteItem = map.get(item.id);
        const localHistLen = item.history ? item.history.length : 1;
        const remoteHistLen = remoteItem.history ? remoteItem.history.length : 1;
        if (localHistLen >= remoteHistLen) {
          map.set(item.id, item);
        }
      }
    });
    return Array.from(map.values()).sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''));
  }

  function mergeArraysByDate(localArr, remoteArr) {
    const map = new Map();
    remoteArr.forEach(item => map.set(item.date, item));
    localArr.forEach(item => {
      if (!map.has(item.date)) map.set(item.date, item);
    });
    return Array.from(map.values()).sort((a, b) => b.date.localeCompare(a.date));
  }

  async function syncAllDataToServer() {
    if (!isServerConnected) return;
    try {
      const records = JSON.parse(localStorage.getItem('csp_history') || '[]');
      const recordsMap = {};
      records.forEach(r => { if (r.date) recordsMap[r.date] = r; });

      const bundle = {
        records: recordsMap,
        deposits: getDeposits(),
        payouts: getPayouts(),
        settings: {
          centerName: centerName,
          password: masterPassword
        }
      };

      await fetch('/api/sync-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bundle)
      });
    } catch (e) {
      console.warn('Sync to server failed:', e);
    }
  }

  function updateSyncUiStatus(online) {
    if (online) {
      el.syncServerDot.className = 'w-2 h-2 rounded-full bg-emerald-500 animate-pulse';
      el.syncServerStatusText.innerText = 'Central Server Online (Synced)';
      el.syncServerSubtext.innerText = 'Data is safely stored on disk and synced across all your connected systems.';
    } else {
      el.syncServerDot.className = 'w-2 h-2 rounded-full bg-amber-500';
      el.syncServerStatusText.innerText = 'Local Storage Safe Vault (Offline)';
      el.syncServerSubtext.innerText = 'Running standalone. You can download or upload complete backups anytime below.';
    }
  }

  // --- 1-CLICK BACKUP & RESTORE ---
  function downloadCompleteBackup() {
    const backupData = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      centerName: centerName,
      masterPassword: masterPassword,
      history: JSON.parse(localStorage.getItem('csp_history') || '[]'),
      deposits: getDeposits(),
      payouts: getPayouts()
    };

    const dateStr = new Date().toISOString().split('T')[0];
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CSP_Personal_Backup_${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Complete backup file downloaded safely!');
  }

  function restoreFromBackupFile(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (event) {
      try {
        const data = JSON.parse(event.target.result);
        if (!data.deposits && !data.payouts && !data.history) {
          alert('Invalid backup file format!');
          return;
        }

        if (confirm('Restore all data from this backup? This will update your records safely.')) {
          if (data.centerName) {
            centerName = data.centerName;
            localStorage.setItem('csp_center_name', centerName);
            el.headerTitle.innerText = centerName;
          }
          if (data.masterPassword) {
            masterPassword = data.masterPassword;
            localStorage.setItem('csp_master_password', masterPassword);
          }
          if (Array.isArray(data.deposits)) {
            localStorage.setItem('csp_deposits', JSON.stringify(data.deposits));
          }
          if (Array.isArray(data.payouts)) {
            localStorage.setItem('csp_payouts', JSON.stringify(data.payouts));
          }
          if (Array.isArray(data.history)) {
            localStorage.setItem('csp_history', JSON.stringify(data.history));
          }

          syncAllDataToServer();
          renderDepositsList();
          renderPayoutsList();
          loadDayData(el.selectedDate.value);
          el.backupModal.classList.add('hidden');
          showToast('All data restored 100% successfully!');
        }
      } catch (err) {
        alert('Error parsing backup file: ' + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset file input
  }

  // --- INIT ---
  async function init() {
    const today = new Date().toISOString().split('T')[0];
    el.selectedDate.value = today;
    el.depositPaymentDate.value = today;
    el.depositFilterDate.value = today;
    el.payoutFilterDate.value = today;

    el.headerTitle.innerText = centerName;
    el.settingCenterName.value = centerName;

    // Check & sync server data first
    await checkServerStatusAndSync();

    // Check password protection
    checkPasswordAuth();

    // Load day data
    await loadDayData(today);

    renderDepositsList();
    renderPayoutsList();

    attachListeners();
    calculate();

    if (window.lucide) window.lucide.createIcons();
  }

  // --- TAB NAVIGATION (Daily Hisab vs Deposit vs Kitna Diye) ---
  function switchTab(tab) {
    activeTab = tab;

    const inactiveClass = 'px-2.5 sm:px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 text-slate-600 hover:text-slate-900';
    const activeDailyClass = 'px-2.5 sm:px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 bg-white text-blue-700 shadow-xs';
    const activeDepositClass = 'px-2.5 sm:px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 bg-white text-emerald-700 shadow-xs';
    const activePayoutClass = 'px-2.5 sm:px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 bg-white text-indigo-700 shadow-xs';

    el.tabDailyHisab.className = inactiveClass;
    el.tabDeposit.className = inactiveClass;
    el.tabKitnaDiye.className = inactiveClass;

    el.viewDailyHisab.classList.add('hidden');
    el.viewDeposit.classList.add('hidden');
    el.viewKitnaDiye.classList.add('hidden');

    if (tab === 'daily') {
      el.viewDailyHisab.classList.remove('hidden');
      el.tabDailyHisab.className = activeDailyClass;
    } else if (tab === 'deposit') {
      el.viewDeposit.classList.remove('hidden');
      el.tabDeposit.className = activeDepositClass;
      renderDepositsList();
    } else {
      el.viewKitnaDiye.classList.remove('hidden');
      el.tabKitnaDiye.className = activePayoutClass;
      renderPayoutsList();
    }

    if (window.lucide) window.lucide.createIcons();
  }

  // --- MAIN RECONCILIATION CALCULATION ---
  let lastVerdict = null;

  function calculate() {
    const accM = getNum(el.accountMorning);
    const cashM = getNum(el.morningCash);
    const pDue = getNum(el.paymentDue);   // ADD (+)
    const udh = getNum(el.udhari);        // SUBTRACT (-)
    const home = getNum(el.homeUse);      // SUBTRACT (-)
    const accN = getNum(el.accountNight);
    const cashN = getNum(el.cashNight);

    const morningTotal = accM + cashM;
    const expectedClosing = morningTotal + pDue - udh - home;
    const actualClosing = accN + cashN;
    const diff = Math.round((actualClosing - expectedClosing) * 100) / 100;

    // Badges & Steps
    el.subtotalMorningBadge.innerText = 'Total: ' + formatINR(morningTotal);
    el.subtotalNightBadge.innerText = 'Total: ' + formatINR(actualClosing);

    el.stepMorningTotal.innerText = formatINR(morningTotal);
    el.stepDue.innerText = '+' + formatINR(pDue);
    el.stepUdhari.innerText = '-' + formatINR(udh);
    el.stepHome.innerText = '-' + formatINR(home);
    el.stepExpected.innerText = formatINR(expectedClosing);
    el.stepActual.innerText = formatINR(actualClosing);

    const hasData = (
      el.accountMorning.value !== '' ||
      el.morningCash.value !== '' ||
      el.paymentDue.value !== '' ||
      el.udhari.value !== '' ||
      el.homeUse.value !== '' ||
      el.accountNight.value !== '' ||
      el.cashNight.value !== ''
    );

    renderVerdict(hasData, diff, expectedClosing, actualClosing);
  }

  function renderVerdict(hasData, diff, expected, actual) {
    el.verdictCard.classList.remove('verdict-perfect', 'verdict-shortage', 'verdict-surplus');
    el.diagnosisBox.classList.add('hidden');

    if (!hasData) {
      el.verdictBadge.className = 'text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500';
      el.verdictBadge.innerText = 'No Data';

      el.verdictHero.className = 'text-center py-5 px-3 rounded-xl bg-slate-50 border border-slate-100 mb-4';
      el.verdictIconContainer.className = 'w-12 h-12 mx-auto rounded-full bg-slate-200 text-slate-500 flex items-center justify-center mb-2';
      el.verdictIconContainer.innerHTML = '<i data-lucide="calculator" class="w-6 h-6"></i>';

      el.verdictTitle.innerText = "Enter Today's Numbers";
      el.verdictTitle.className = 'text-lg font-black text-slate-800';
      el.verdictSubtitle.innerText = 'Input morning balance, adjustments, and night balance.';

      el.diffAmountBox.classList.add('hidden');
      lastVerdict = null;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    el.diffAmountBox.classList.remove('hidden');

    if (diff === 0) {
      el.verdictCard.classList.add('verdict-perfect');
      el.verdictBadge.className = 'text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300';
      el.verdictBadge.innerText = '✓ PERFECT (₹0)';

      el.verdictHero.className = 'text-center py-5 px-3 rounded-xl bg-emerald-50 border border-emerald-200 mb-4';
      el.verdictIconContainer.className = 'w-12 h-12 mx-auto rounded-full bg-emerald-600 text-white flex items-center justify-center mb-2 shadow-sm animate-bounce';
      el.verdictIconContainer.innerHTML = '<i data-lucide="check" class="w-6 h-6"></i>';

      el.verdictTitle.innerText = 'Transaction Perfect!';
      el.verdictTitle.className = 'text-lg font-black text-emerald-900';
      el.verdictSubtitle.innerText = 'All accounts, cash, and adjustments match 100%. No issue found.';

      el.diffAmountText.innerText = '₹0.00 (Balanced)';
      el.diffAmountText.className = 'text-2xl font-black font-mono mt-0.5 text-emerald-700';

      if (lastVerdict !== 'perfect' && typeof confetti === 'function') {
        confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
      }
      lastVerdict = 'perfect';

    } else if (diff < 0) {
      const shortage = Math.abs(diff);
      el.verdictCard.classList.add('verdict-shortage');
      el.verdictBadge.className = 'text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300';
      el.verdictBadge.innerText = `⚠ ISSUE: SHORTAGE`;

      el.verdictHero.className = 'text-center py-5 px-3 rounded-xl bg-rose-50 border border-rose-200 mb-4';
      el.verdictIconContainer.className = 'w-12 h-12 mx-auto rounded-full bg-rose-600 text-white flex items-center justify-center mb-2 shadow-sm';
      el.verdictIconContainer.innerHTML = '<i data-lucide="alert-triangle" class="w-6 h-6"></i>';

      el.verdictTitle.innerText = `Issue: ₹${shortage.toLocaleString('en-IN')} Shortage!`;
      el.verdictTitle.className = 'text-lg font-black text-rose-900';
      el.verdictSubtitle.innerText = `Expected ₹${expected.toLocaleString('en-IN')}, but actual closing is ₹${actual.toLocaleString('en-IN')}.`;

      el.diffAmountText.innerText = `-₹${shortage.toLocaleString('en-IN')} (Missing)`;
      el.diffAmountText.className = 'text-2xl font-black font-mono mt-0.5 text-rose-700';

      el.diagnosisBox.classList.remove('hidden');
      el.diagnosisBox.className = 'mt-3 p-2.5 rounded-lg text-xs bg-rose-50 border border-rose-200 text-rose-900 font-medium';
      el.diagnosisBox.innerText = `Check: Unrecorded cash given, forgotten personal expense, or recount drawer cash.`;

      lastVerdict = 'shortage';

    } else {
      el.verdictCard.classList.add('verdict-surplus');
      el.verdictBadge.className = 'text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300';
      el.verdictBadge.innerText = `▲ ISSUE: SURPLUS`;

      el.verdictHero.className = 'text-center py-5 px-3 rounded-xl bg-amber-50 border border-amber-200 mb-4';
      el.verdictIconContainer.className = 'w-12 h-12 mx-auto rounded-full bg-amber-600 text-white flex items-center justify-center mb-2 shadow-sm';
      el.verdictIconContainer.innerHTML = '<i data-lucide="info" class="w-6 h-6"></i>';

      el.verdictTitle.innerText = `Issue: ₹${diff.toLocaleString('en-IN')} Surplus!`;
      el.verdictTitle.className = 'text-lg font-black text-amber-900';
      el.verdictSubtitle.innerText = `Actual capital is ₹${diff.toLocaleString('en-IN')} higher than expected.`;

      el.diffAmountText.innerText = `+₹${diff.toLocaleString('en-IN')} (Excess)`;
      el.diffAmountText.className = 'text-2xl font-black font-mono mt-0.5 text-amber-700';

      el.diagnosisBox.classList.remove('hidden');
      el.diagnosisBox.className = 'mt-3 p-2.5 rounded-lg text-xs bg-amber-50 border border-amber-200 text-amber-900 font-medium';
      el.diagnosisBox.innerText = `Check: Deposit cash received from customer but not yet transferred on portal.`;

      lastVerdict = 'surplus';
    }

    if (window.lucide) window.lucide.createIcons();
  }

  // --- DRAFT & PERSISTENCE ---
  function getDraftKey(date) {
    return 'csp_draft_' + date;
  }

  async function loadDayData(date) {
    let loadedData = null;

    if (isServerConnected) {
      try {
        const res = await fetch(`/api/day?date=${encodeURIComponent(date)}`, { cache: 'no-store' });
        if (res.ok) {
          const body = await res.json();
          if (body.record) loadedData = body.record;
        }
      } catch (err) {}
    }

    if (!loadedData) {
      const raw = localStorage.getItem(getDraftKey(date));
      if (raw) {
        try { loadedData = JSON.parse(raw); } catch (e) {}
      }
      if (!loadedData) {
        const history = JSON.parse(localStorage.getItem('csp_history') || '[]');
        const found = history.find(h => h.date === date);
        if (found) loadedData = found;
      }
    }

    if (loadedData) {
      el.accountMorning.value = loadedData.accountMorning ?? '';
      el.morningCash.value = loadedData.morningCash ?? '';
      el.paymentDue.value = loadedData.paymentDue ?? '';
      el.udhari.value = loadedData.udhari ?? '';
      el.homeUse.value = loadedData.homeUse ?? '';
      el.accountNight.value = loadedData.accountNight ?? '';
      el.cashNight.value = loadedData.cashNight ?? '';
    } else {
      clearInputs();
    }

    calculate();
  }

  function clearInputs() {
    el.accountMorning.value = '';
    el.morningCash.value = '';
    el.paymentDue.value = '';
    el.udhari.value = '';
    el.homeUse.value = '';
    el.accountNight.value = '';
    el.cashNight.value = '';
  }

  let draftSyncTimer = null;
  function autoSaveLocal() {
    const date = el.selectedDate.value;
    const data = {
      date: date,
      accountMorning: el.accountMorning.value,
      morningCash: el.morningCash.value,
      paymentDue: el.paymentDue.value,
      udhari: el.udhari.value,
      homeUse: el.homeUse.value,
      accountNight: el.accountNight.value,
      cashNight: el.cashNight.value
    };
    localStorage.setItem(getDraftKey(date), JSON.stringify(data));

    // Debounced auto-sync to backend so Father's morning inputs are instantly available on other devices!
    clearTimeout(draftSyncTimer);
    draftSyncTimer = setTimeout(() => {
      if (isServerConnected) {
        fetch('/api/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        }).catch(() => {});
      }
    }, 800);
  }

  async function saveRecord() {
    const date = el.selectedDate.value;
    const accM = getNum(el.accountMorning);
    const cashM = getNum(el.morningCash);
    const pDue = getNum(el.paymentDue);
    const udh = getNum(el.udhari);
    const home = getNum(el.homeUse);
    const accN = getNum(el.accountNight);
    const cashN = getNum(el.cashNight);

    const mTotal = accM + cashM;
    const exp = mTotal + pDue - udh - home;
    const act = accN + cashN;
    const diff = Math.round((act - exp) * 100) / 100;

    const recordData = {
      date: date,
      accountMorning: el.accountMorning.value,
      morningCash: el.morningCash.value,
      paymentDue: el.paymentDue.value,
      udhari: el.udhari.value,
      homeUse: el.homeUse.value,
      accountNight: el.accountNight.value,
      cashNight: el.cashNight.value,
      morningTotal: mTotal,
      expected: exp,
      actual: act,
      diff: diff,
      status: diff === 0 ? 'PERFECT' : (diff < 0 ? 'SHORTAGE' : 'SURPLUS'),
      savedAt: new Date().toISOString()
    };

    autoSaveLocal();

    let history = JSON.parse(localStorage.getItem('csp_history') || '[]');
    history = history.filter(item => item.date !== date);
    history.unshift(recordData);
    localStorage.setItem('csp_history', JSON.stringify(history));

    syncAllDataToServer();
    showToast('Record saved and synchronized!');
  }

  // =========================================================================
  // SECTION: DEPOSITS
  // =========================================================================
  function getDeposits() {
    return JSON.parse(localStorage.getItem('csp_deposits') || '[]');
  }

  function saveDeposits(list) {
    localStorage.setItem('csp_deposits', JSON.stringify(list));
    renderDepositsList();
    syncAllDataToServer();
  }

  function handleDepositSubmit(e) {
    e.preventDefault();
    const name = el.depositCustomerName.value.trim();
    const account = el.depositAccountNumber.value.trim();
    const amount = parseFloat(el.depositAmount.value) || 0;
    const paymentDate = el.depositPaymentDate.value || el.selectedDate.value;

    if (!name || !account || amount <= 0) {
      alert('Please fill customer name, account number, and valid amount!');
      return;
    }

    const now = new Date();
    const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newDeposit = {
      id: 'DEP-' + Date.now().toString().slice(-6),
      name: name,
      account: account,
      amount: amount,
      paymentDate: paymentDate,
      timestamp: now.toISOString(),
      formattedTime: formattedTime,
      history: [
        {
          step: 1,
          amount: amount,
          timestamp: `${paymentDate} ${formattedTime}`,
          reason: 'Initial Deposit Recorded'
        }
      ]
    };

    const list = getDeposits();
    list.unshift(newDeposit);
    saveDeposits(list);

    el.depositCustomerName.value = '';
    el.depositAccountNumber.value = '';
    el.depositAmount.value = '';

    showDepositConfirmation(newDeposit);
  }

  function showDepositConfirmation(deposit) {
    currentActiveDeposit = deposit;
    el.confirmDepositCustomerName.innerText = deposit.name;
    el.confirmDepositAccountNumber.innerText = deposit.account;
    el.confirmDepositAmount.innerText = '₹' + deposit.amount.toLocaleString('en-IN');
    el.confirmDepositPaymentDate.innerText = deposit.paymentDate + ' ' + deposit.formattedTime;

    el.confirmDepositModal.classList.remove('hidden');
    if (typeof confetti === 'function') {
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.6 } });
    }
    if (window.lucide) window.lucide.createIcons();
  }

  function printDepositReceipt(deposit) {
    if (!deposit) return;
    el.receiptCenterName.innerText = centerName;
    el.receiptDate.innerText = `DATE: ${deposit.paymentDate} ${deposit.formattedTime} | REF: #${deposit.id}`;
    el.receiptType.innerText = 'DEPOSIT RECEIPT';
    el.receiptCustomerName.innerText = deposit.name;
    el.receiptAccountOrMobileLabel.innerText = 'Account Number:';
    el.receiptCustomerAccountOrMobile.innerText = deposit.account;
    el.receiptCustomerAmount.innerText = '₹ ' + deposit.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 });
    window.print();
  }

  function renderDepositsList() {
    const list = getDeposits();
    const filterDate = el.depositFilterDate.value;
    const query = (el.depositSearchInput.value || '').toLowerCase().trim();

    const filtered = list.filter(d => {
      const matchDate = filterDate ? d.paymentDate === filterDate : true;
      const matchQuery = !query ? true : (
        d.name.toLowerCase().includes(query) ||
        d.account.toLowerCase().includes(query)
      );
      return matchDate && matchQuery;
    });

    const totalDeposited = filtered.reduce((acc, curr) => acc + (curr.amount || 0), 0);
    el.depositSummaryTotal.innerText = formatINR(totalDeposited);
    el.depositSummaryCount.innerText = filtered.length;

    const today = el.selectedDate.value;
    const todayDeposits = list.filter(d => d.paymentDate === today);
    el.tabDepositBadge.innerText = todayDeposits.length;

    el.depositsListContainer.innerHTML = '';

    if (filtered.length === 0) {
      el.depositsListContainer.innerHTML = `
        <div class="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400">
          <i data-lucide="arrow-down-circle" class="w-8 h-8 mx-auto mb-2 text-slate-300"></i>
          <p class="text-xs font-semibold">No deposit records found for this filter.</p>
          <p class="text-[11px] text-slate-400 mt-0.5">Use the form on the left to record a customer deposit.</p>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    filtered.forEach(d => {
      const card = document.createElement('div');
      card.className = 'bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-emerald-200 transition';

      const hasHistory = d.history && d.history.length > 1;
      const stepBadge = hasHistory ? `
        <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 inline-flex items-center gap-1 cursor-pointer view-history-trigger" data-id="${d.id}">
          <i data-lucide="history" class="w-3 h-3"></i>
          <span>Step ${d.history.length} (Modified)</span>
        </span>
      ` : '';

      card.innerHTML = `
        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <span class="font-bold text-slate-900 text-sm font-sans">${d.name}</span>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 font-mono">${d.paymentDate} ${d.formattedTime}</span>
            ${stepBadge}
          </div>
          <div class="text-xs text-slate-500 font-mono flex items-center gap-2">
            <span><i data-lucide="credit-card" class="w-3 h-3 inline mr-1 text-slate-400"></i>A/C: <strong>${d.account}</strong></span>
          </div>
        </div>

        <div class="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
          <div class="text-right">
            <div class="text-base font-black font-mono text-emerald-700">₹${d.amount.toLocaleString('en-IN')}</div>
          </div>
          
          <div class="flex items-center gap-1">
            <button class="deposit-modify-btn p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 transition" title="Modify Amount & Store Step" data-id="${d.id}">
              <i data-lucide="edit-3" class="w-4 h-4"></i>
            </button>
            <button class="deposit-print-btn p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition" title="Print Deposit Slip" data-id="${d.id}">
              <i data-lucide="printer" class="w-4 h-4"></i>
            </button>
            <button class="deposit-del-btn p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition" title="Delete" data-id="${d.id}">
              <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
          </div>
        </div>
      `;

      el.depositsListContainer.appendChild(card);
    });

    el.depositsListContainer.querySelectorAll('.deposit-modify-btn, .view-history-trigger').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const d = getDeposits().find(item => item.id === id);
        if (d) openModifyModal('deposit', d);
      });
    });

    el.depositsListContainer.querySelectorAll('.deposit-print-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const d = getDeposits().find(item => item.id === id);
        if (d) printDepositReceipt(d);
      });
    });

    el.depositsListContainer.querySelectorAll('.deposit-del-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        if (confirm('Delete this deposit entry?')) {
          const list = getDeposits().filter(item => item.id !== id);
          saveDeposits(list);
          showToast('Deposit entry deleted');
        }
      });
    });

    if (window.lucide) window.lucide.createIcons();
  }

  function exportDepositsCsv() {
    const list = getDeposits();
    if (list.length === 0) {
      alert('No deposit records to export!');
      return;
    }

    const headers = ['Deposit ID', 'Payment Date', 'Time', 'Customer Name', 'Account Number', 'Amount (INR)', 'Revision Steps'];
    const rows = list.map(d => [
      d.id,
      d.paymentDate,
      d.formattedTime,
      `"${d.name.replace(/"/g, '""')}"`,
      `"${d.account}"`,
      d.amount,
      (d.history ? d.history.length : 1)
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `CSP_Deposits_${el.depositFilterDate.value || 'all'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // =========================================================================
  // SECTION: KITNA DIYE / BAKI
  // =========================================================================
  function getPayouts() {
    return JSON.parse(localStorage.getItem('csp_payouts') || '[]');
  }

  function savePayouts(list) {
    localStorage.setItem('csp_payouts', JSON.stringify(list));
    renderPayoutsList();
    syncAllDataToServer();
  }

  function handlePayoutSubmit(e) {
    e.preventDefault();
    const name = el.payoutName.value.trim();
    const amount = parseFloat(el.payoutAmount.value) || 0;
    const mobile = el.payoutMobile.value.trim();
    const date = el.selectedDate.value;

    if (!name || amount <= 0) {
      alert('Please enter valid customer name and amount!');
      return;
    }

    const now = new Date();
    const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const formattedDate = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

    const newPayout = {
      id: 'PAY-' + Date.now().toString().slice(-6),
      date: date,
      timestamp: now.toISOString(),
      formattedTime: formattedTime,
      formattedDate: formattedDate,
      name: name,
      amount: amount,
      mobile: mobile,
      history: [
        {
          step: 1,
          amount: amount,
          timestamp: `${formattedDate} ${formattedTime}`,
          reason: 'Initial Payout Recorded'
        }
      ]
    };

    const list = getPayouts();
    list.unshift(newPayout);
    savePayouts(list);

    el.payoutName.value = '';
    el.payoutAmount.value = '';
    el.payoutMobile.value = '';

    showPayoutConfirmation(newPayout);
  }

  function showPayoutConfirmation(payout) {
    currentActivePayout = payout;
    el.confirmCustomerName.innerText = payout.name;
    el.confirmCustomerAmount.innerText = '₹' + payout.amount.toLocaleString('en-IN');
    el.confirmCustomerMobile.innerText = payout.mobile ? '+91 ' + payout.mobile : 'Not provided';
    el.confirmCustomerTime.innerText = `${payout.formattedDate}, ${payout.formattedTime}`;

    el.confirmEntryModal.classList.remove('hidden');
    if (typeof confetti === 'function') {
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.6 } });
    }
    if (window.lucide) window.lucide.createIcons();
  }

  function sendWhatsAppConfirmation(payout) {
    if (!payout) return;
    const mobile = payout.mobile.replace(/\D/g, '');
    const amountFormatted = '₹' + payout.amount.toLocaleString('en-IN');

    const msg = 
`*${centerName}*
------------------------------
*PAYMENT CONFIRMATION RECEIPT*
Customer Name: *${payout.name}*
Amount: *${amountFormatted}*
Date: ${payout.formattedDate || payout.date}
Time: ${payout.formattedTime}
Receipt Ref: #${payout.id}
------------------------------
✅ Status: Cash Disbursed Successfully.
Thank you for visiting!`;

    const encoded = encodeURIComponent(msg);
    let waUrl = '';
    if (mobile && mobile.length >= 10) {
      const cleanPhone = mobile.length === 10 ? '91' + mobile : mobile;
      waUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encoded}`;
    } else {
      waUrl = `https://api.whatsapp.com/send?text=${encoded}`;
    }

    window.open(waUrl, '_blank');
  }

  function printPayoutReceipt(payout) {
    if (!payout) return;
    el.receiptCenterName.innerText = centerName;
    el.receiptDate.innerText = `DATE: ${payout.formattedDate || payout.date} ${payout.formattedTime} | REF: #${payout.id}`;
    el.receiptType.innerText = 'CASH PAYOUT RECEIPT';
    el.receiptCustomerName.innerText = payout.name;
    el.receiptAccountOrMobileLabel.innerText = 'Mobile Number:';
    el.receiptCustomerAccountOrMobile.innerText = payout.mobile ? '+91 ' + payout.mobile : '-';
    el.receiptCustomerAmount.innerText = '₹ ' + payout.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 });
    window.print();
  }

  function renderPayoutsList() {
    const list = getPayouts();
    const filterDate = el.payoutFilterDate.value;
    const query = (el.searchPayoutInput.value || '').toLowerCase().trim();

    const filtered = list.filter(p => {
      const matchDate = filterDate ? p.date === filterDate : true;
      const matchQuery = !query ? true : (
        p.name.toLowerCase().includes(query) ||
        (p.mobile && p.mobile.includes(query))
      );
      return matchDate && matchQuery;
    });

    const totalGiven = filtered.reduce((acc, curr) => acc + (curr.amount || 0), 0);
    el.payoutSummaryTotal.innerText = formatINR(totalGiven);
    el.payoutSummaryCount.innerText = filtered.length;

    const today = el.selectedDate.value;
    const todayPayouts = list.filter(p => p.date === today);
    el.tabKitnaDiyeBadge.innerText = todayPayouts.length;

    el.payoutsListContainer.innerHTML = '';

    if (filtered.length === 0) {
      el.payoutsListContainer.innerHTML = `
        <div class="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400">
          <i data-lucide="hand-coins" class="w-8 h-8 mx-auto mb-2 text-slate-300"></i>
          <p class="text-xs font-semibold">No payout records found for this filter.</p>
          <p class="text-[11px] text-slate-400 mt-0.5">Use the form on the left to record cash given to customers.</p>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    filtered.forEach(p => {
      const card = document.createElement('div');
      card.className = 'bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-indigo-200 transition';

      const hasHistory = p.history && p.history.length > 1;
      const stepBadge = hasHistory ? `
        <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 inline-flex items-center gap-1 cursor-pointer view-payout-history-trigger" data-id="${p.id}">
          <i data-lucide="history" class="w-3 h-3"></i>
          <span>Step ${p.history.length} (Modified)</span>
        </span>
      ` : '';

      card.innerHTML = `
        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <span class="font-bold text-slate-900 text-sm font-sans">${p.name}</span>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 font-mono">${p.date} ${p.formattedTime}</span>
            ${stepBadge}
          </div>
          <div class="text-xs text-slate-500 font-mono">
            ${p.mobile ? `<span><i data-lucide="phone" class="w-3 h-3 inline mr-1 text-slate-400"></i>+91 ${p.mobile}</span>` : '<span class="text-slate-400">No mobile</span>'}
          </div>
        </div>

        <div class="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
          <div class="text-right">
            <div class="text-base font-black font-mono text-indigo-700">₹${p.amount.toLocaleString('en-IN')}</div>
          </div>
          
          <div class="flex items-center gap-1">
            <button class="payout-modify-btn p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 transition" title="Modify Amount & Store Step" data-id="${p.id}">
              <i data-lucide="edit-3" class="w-4 h-4"></i>
            </button>
            <button class="payout-wa-btn p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition" title="Send WhatsApp Receipt" data-id="${p.id}">
              <i data-lucide="message-circle" class="w-4 h-4"></i>
            </button>
            <button class="payout-print-btn p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition" title="Print Slip" data-id="${p.id}">
              <i data-lucide="printer" class="w-4 h-4"></i>
            </button>
            <button class="payout-del-btn p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition" title="Delete" data-id="${p.id}">
              <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
          </div>
        </div>
      `;

      el.payoutsListContainer.appendChild(card);
    });

    el.payoutsListContainer.querySelectorAll('.payout-modify-btn, .view-payout-history-trigger').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const p = getPayouts().find(item => item.id === id);
        if (p) openModifyModal('payout', p);
      });
    });

    el.payoutsListContainer.querySelectorAll('.payout-wa-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const p = getPayouts().find(item => item.id === id);
        if (p) sendWhatsAppConfirmation(p);
      });
    });

    el.payoutsListContainer.querySelectorAll('.payout-print-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const p = getPayouts().find(item => item.id === id);
        if (p) printPayoutReceipt(p);
      });
    });

    el.payoutsListContainer.querySelectorAll('.payout-del-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        if (confirm('Delete this payout entry?')) {
          const list = getPayouts().filter(item => item.id !== id);
          savePayouts(list);
          showToast('Entry deleted');
        }
      });
    });

    if (window.lucide) window.lucide.createIcons();
  }

  function exportPayoutsCsv() {
    const list = getPayouts();
    if (list.length === 0) {
      alert('No payout records to export!');
      return;
    }

    const headers = ['Receipt ID', 'Date', 'Time', 'Customer Name', 'Amount (INR)', 'Mobile', 'Revision Steps'];
    const rows = list.map(p => [
      p.id,
      p.date,
      p.formattedTime,
      `"${p.name.replace(/"/g, '""')}"`,
      p.amount,
      p.mobile || '',
      (p.history ? p.history.length : 1)
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `CSP_Kitna_Baki_Diye_${el.payoutFilterDate.value || 'all'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // =========================================================================
  // UNIVERSAL "MODIFY AMOUNT" & STEP HISTORY MODAL
  // =========================================================================
  function openModifyModal(type, item) {
    activeModifyType = type;
    activeModifyItem = item;

    el.modifyModalCustomerName.innerText = item.name;
    if (type === 'deposit') {
      el.modifyModalAccountOrMobileLabel.innerText = 'Account Number:';
      el.modifyModalAccountOrMobile.innerText = item.account;
    } else {
      el.modifyModalAccountOrMobileLabel.innerText = 'Mobile Number:';
      el.modifyModalAccountOrMobile.innerText = item.mobile ? '+91 ' + item.mobile : 'None';
    }

    el.modifyModalCurrentAmount.innerText = '₹' + item.amount.toLocaleString('en-IN');
    el.modifyNewAmountInput.value = item.amount;
    el.modifyReasonInput.value = '';

    renderStepTimeline(item);

    el.modifyModal.classList.remove('hidden');
    el.modifyNewAmountInput.focus();
    el.modifyNewAmountInput.select();
    if (window.lucide) window.lucide.createIcons();
  }

  function renderStepTimeline(item) {
    const history = item.history || [
      { step: 1, amount: item.amount, timestamp: item.formattedTime || item.date, reason: 'Initial Entry' }
    ];

    el.modifyStepsTimelineContainer.innerHTML = '';

    history.forEach((h, idx) => {
      const stepDiv = document.createElement('div');
      stepDiv.className = 'relative timeline-dot text-xs';
      
      const isLatest = idx === history.length - 1;

      stepDiv.innerHTML = `
        <div class="flex items-center justify-between">
          <span class="font-bold text-slate-800 ${isLatest ? 'text-indigo-700' : ''}">
            Step ${h.step || (idx + 1)}: ₹${(h.amount || 0).toLocaleString('en-IN')}
          </span>
          <span class="text-[10px] text-slate-400 font-mono">${h.timestamp || ''}</span>
        </div>
        <p class="text-[11px] text-slate-500 mt-0.5">${h.reason || 'Amount updated'}</p>
      `;

      el.modifyStepsTimelineContainer.appendChild(stepDiv);
    });
  }

  function saveModifiedAmount() {
    if (!activeModifyItem) return;

    const newAmount = parseFloat(el.modifyNewAmountInput.value);
    if (isNaN(newAmount) || newAmount < 0) {
      alert('Please enter a valid amount!');
      return;
    }

    const reason = el.modifyReasonInput.value.trim() || `Amount changed from ₹${activeModifyItem.amount.toLocaleString('en-IN')} to ₹${newAmount.toLocaleString('en-IN')}`;

    const now = new Date();
    const formattedTimestamp = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) + ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (!activeModifyItem.history) {
      activeModifyItem.history = [
        {
          step: 1,
          amount: activeModifyItem.amount,
          timestamp: activeModifyItem.formattedTime || 'Initial',
          reason: 'Initial Entry'
        }
      ];
    }

    const nextStepNum = activeModifyItem.history.length + 1;
    activeModifyItem.history.push({
      step: nextStepNum,
      amount: newAmount,
      timestamp: formattedTimestamp,
      reason: reason
    });

    activeModifyItem.amount = newAmount;

    if (activeModifyType === 'deposit') {
      const list = getDeposits();
      const idx = list.findIndex(d => d.id === activeModifyItem.id);
      if (idx !== -1) {
        list[idx] = activeModifyItem;
        saveDeposits(list);
      }
    } else {
      const list = getPayouts();
      const idx = list.findIndex(p => p.id === activeModifyItem.id);
      if (idx !== -1) {
        list[idx] = activeModifyItem;
        savePayouts(list);
      }
    }

    el.modifyModal.classList.add('hidden');
    showToast(`Amount updated to ₹${newAmount.toLocaleString('en-IN')} (Step ${nextStepNum} saved)!`);
  }

  // --- DENOMINATION COUNTER ---
  function openDenom(target) {
    activeDenomTarget = target;
    el.denomModalTitle.innerText = target === 'morning' ? 'Morning Cash - Note Counter' : 'Cash Night - Note Counter';
    document.querySelectorAll('.denom-input').forEach(i => i.value = '');
    el.denomCoins.value = '';
    calcDenom();
    el.denomModal.classList.remove('hidden');
  }

  function calcDenom() {
    let grand = 0;
    document.querySelectorAll('.denom-input').forEach(input => {
      const note = parseInt(input.getAttribute('data-note'), 10);
      const count = parseInt(input.value, 10) || 0;
      const sub = note * count;
      grand += sub;
      const span = document.querySelector(`.denom-subtotal[data-note="${note}"]`);
      if (span) span.innerText = `= ₹ ${sub.toLocaleString('en-IN')}`;
    });

    const coins = parseFloat(el.denomCoins.value) || 0;
    grand += coins;
    el.denomCoinsSubtotal.innerText = `= ₹ ${coins.toLocaleString('en-IN')}`;
    el.denomGrandTotal.innerText = `₹ ${grand.toLocaleString('en-IN')}`;
    return grand;
  }

  function applyDenom() {
    const total = calcDenom();
    if (activeDenomTarget === 'morning') {
      el.morningCash.value = total;
    } else {
      el.cashNight.value = total;
    }
    el.denomModal.classList.add('hidden');
    calculate();
    autoSaveLocal();
    showToast(`Applied ₹${total.toLocaleString('en-IN')}`);
  }

  // --- PRINT SLIP ---
  function printSlip() {
    el.slipCenterName.innerText = centerName;
    el.slipDate.innerText = `DATE: ${el.selectedDate.value} | TIME: ${new Date().toLocaleTimeString()}`;

    const accM = getNum(el.accountMorning);
    const cashM = getNum(el.morningCash);
    const pDue = getNum(el.paymentDue);
    const udh = getNum(el.udhari);
    const home = getNum(el.homeUse);
    const accN = getNum(el.accountNight);
    const cashN = getNum(el.cashNight);

    const mTotal = accM + cashM;
    const exp = mTotal + pDue - udh - home;
    const act = accN + cashN;
    const diff = Math.round((act - exp) * 100) / 100;

    el.slipAccountMorning.innerText = accM.toFixed(2);
    el.slipMorningCash.innerText = cashM.toFixed(2);
    el.slipTotalMorning.innerText = mTotal.toFixed(2);
    el.slipDue.innerText = `+${pDue.toFixed(2)}`;
    el.slipUdhari.innerText = `-${udh.toFixed(2)}`;
    el.slipHome.innerText = `-${home.toFixed(2)}`;
    el.slipExpected.innerText = exp.toFixed(2);
    el.slipAccountNight.innerText = accN.toFixed(2);
    el.slipCashNight.innerText = cashN.toFixed(2);
    el.slipActual.innerText = act.toFixed(2);

    if (diff === 0) {
      el.slipVerdictTitle.innerText = 'PERFECT - ALL BALANCED';
      el.slipDiffAmount.innerText = 'DIFFERENCE: ₹ 0.00';
      el.slipVerdictBox.className = 'p-2 border border-black text-center bg-gray-50';
    } else if (diff < 0) {
      el.slipVerdictTitle.innerText = 'ISSUE: CASH SHORTAGE';
      el.slipDiffAmount.innerText = `SHORTAGE: -₹ ${Math.abs(diff).toFixed(2)}`;
      el.slipVerdictBox.className = 'p-2 border border-black text-center bg-gray-100';
    } else {
      el.slipVerdictTitle.innerText = 'ISSUE: CASH SURPLUS';
      el.slipDiffAmount.innerText = `SURPLUS: +₹ ${diff.toFixed(2)}`;
      el.slipVerdictBox.className = 'p-2 border border-black text-center bg-gray-100';
    }

    window.print();
  }

  // --- DEMO SAMPLE ---
  function fillSample() {
    el.accountMorning.value = 30000;
    el.morningCash.value = 25000;
    el.paymentDue.value = 4000;
    el.udhari.value = 2000;
    el.homeUse.value = 1000;
    el.accountNight.value = 40000;
    el.cashNight.value = 16000;

    calculate();
    autoSaveLocal();
    showToast('Sample data loaded');
  }

  // --- EVENT LISTENERS ---
  function attachListeners() {
    // Lock Screen Submit & Toggles
    el.lockScreenForm.addEventListener('submit', handleUnlockSubmit);
    el.lockSiteBtn.addEventListener('click', lockSiteManually);
    el.togglePasswordVisibilityBtn.addEventListener('click', () => {
      const isPwd = el.lockPasswordInput.type === 'password';
      el.lockPasswordInput.type = isPwd ? 'text' : 'password';
      el.togglePasswordIcon.setAttribute('data-lucide', isPwd ? 'eye-off' : 'eye');
      if (window.lucide) window.lucide.createIcons();
    });

    // Backup & Restore Actions
    el.openBackupBtn.addEventListener('click', () => {
      checkServerStatusAndSync();
      el.backupModal.classList.remove('hidden');
    });
    el.closeBackupModal.addEventListener('click', () => el.backupModal.classList.add('hidden'));
    el.forceSyncBtn.addEventListener('click', async () => {
      await checkServerStatusAndSync();
      await syncAllDataToServer();
      showToast('Sync completed with server!');
    });
    el.downloadBackupBtn.addEventListener('click', downloadCompleteBackup);
    el.restoreFileInput.addEventListener('change', restoreFromBackupFile);

    // Tab Navigation
    el.tabDailyHisab.addEventListener('click', () => switchTab('daily'));
    el.tabDeposit.addEventListener('click', () => switchTab('deposit'));
    el.tabKitnaDiye.addEventListener('click', () => switchTab('payouts'));

    // Deposit Form Submit & Filters
    el.depositForm.addEventListener('submit', handleDepositSubmit);
    el.depositSearchInput.addEventListener('input', renderDepositsList);
    el.depositFilterDate.addEventListener('change', renderDepositsList);
    el.depositFilterTodayBtn.addEventListener('click', () => {
      el.depositFilterDate.value = new Date().toISOString().split('T')[0];
      renderDepositsList();
    });
    el.depositFilterAllBtn.addEventListener('click', () => {
      el.depositFilterDate.value = '';
      renderDepositsList();
    });
    el.exportDepositsCsvBtn.addEventListener('click', exportDepositsCsv);

    // Deposit Confirmation Modal Actions
    el.confirmPrintDepositReceiptBtn.addEventListener('click', () => {
      printDepositReceipt(currentActiveDeposit);
    });
    el.confirmCloseDepositModalBtn.addEventListener('click', () => {
      el.confirmDepositModal.classList.add('hidden');
    });

    // Payout (Kitna Baki / Diye) Submit & Filters
    el.payoutForm.addEventListener('submit', handlePayoutSubmit);
    el.searchPayoutInput.addEventListener('input', renderPayoutsList);
    el.payoutFilterDate.addEventListener('change', renderPayoutsList);
    el.payoutFilterTodayBtn.addEventListener('click', () => {
      el.payoutFilterDate.value = new Date().toISOString().split('T')[0];
      renderPayoutsList();
    });
    el.payoutFilterAllBtn.addEventListener('click', () => {
      el.payoutFilterDate.value = '';
      renderPayoutsList();
    });
    el.exportPayoutsCsvBtn.addEventListener('click', exportPayoutsCsv);

    // Payout Confirmation Modal Actions
    el.confirmSendWhatsAppBtn.addEventListener('click', () => {
      sendWhatsAppConfirmation(currentActivePayout);
    });
    el.confirmPrintReceiptBtn.addEventListener('click', () => {
      printPayoutReceipt(currentActivePayout);
    });
    el.confirmCloseModalBtn.addEventListener('click', () => {
      el.confirmEntryModal.classList.add('hidden');
    });

    // Modify Amount Modal Actions
    el.saveModifyBtn.addEventListener('click', saveModifiedAmount);
    el.closeModifyModal.addEventListener('click', () => el.modifyModal.classList.add('hidden'));
    el.cancelModifyBtn.addEventListener('click', () => el.modifyModal.classList.add('hidden'));

    // Daily Balance inputs
    [
      el.accountMorning, el.morningCash, el.paymentDue,
      el.udhari, el.homeUse, el.accountNight, el.cashNight
    ].forEach(input => {
      input.addEventListener('input', () => {
        calculate();
        autoSaveLocal();
      });
    });

    // Master Date Change
    el.selectedDate.addEventListener('change', () => {
      const d = el.selectedDate.value;
      loadDayData(d);
      el.depositPaymentDate.value = d;
      el.depositFilterDate.value = d;
      el.payoutFilterDate.value = d;
      renderDepositsList();
      renderPayoutsList();
    });

    // Reset button
    el.resetDayBtn.addEventListener('click', () => {
      if (confirm('Reset values for this date?')) {
        clearInputs();
        localStorage.removeItem(getDraftKey(el.selectedDate.value));
        calculate();
        showToast('Cleared');
      }
    });

    // Demo Sample
    el.fillDemoBtn.addEventListener('click', fillSample);
    el.saveRecordBtn.addEventListener('click', saveRecord);
    el.printReportBtn.addEventListener('click', printSlip);

    // Denomination Modal
    el.openMorningDenomBtn.addEventListener('click', () => openDenom('morning'));
    el.openNightDenomBtn.addEventListener('click', () => openDenom('night'));
    el.closeDenomModal.addEventListener('click', () => el.denomModal.classList.add('hidden'));
    el.clearDenomBtn.addEventListener('click', () => {
      document.querySelectorAll('.denom-input').forEach(i => i.value = '');
      el.denomCoins.value = '';
      calcDenom();
    });
    el.applyDenomBtn.addEventListener('click', applyDenom);
    document.querySelectorAll('.denom-input').forEach(i => i.addEventListener('input', calcDenom));
    el.denomCoins.addEventListener('input', calcDenom);

    // History Modal
    el.openHistoryBtn.addEventListener('click', () => {
      renderHistoryModal();
      el.historyModal.classList.remove('hidden');
    });
    el.closeHistoryModal.addEventListener('click', () => el.historyModal.classList.add('hidden'));
    el.clearAllHistoryBtn.addEventListener('click', () => {
      if (confirm('Clear history?')) {
        localStorage.removeItem('csp_history');
        renderHistoryModal();
        syncAllDataToServer();
        showToast('History cleared');
      }
    });

    // Center Details & Password Modal
    el.editCenterBtn.addEventListener('click', () => el.centerModal.classList.remove('hidden'));
    el.cancelCenterBtn.addEventListener('click', () => el.centerModal.classList.add('hidden'));
    el.saveCenterBtn.addEventListener('click', () => {
      centerName = el.settingCenterName.value.trim() || 'CSP Balance Manager';
      localStorage.setItem('csp_center_name', centerName);
      el.headerTitle.innerText = centerName;

      // Update Master Password if entered
      const newPwd = el.settingPassword.value.trim();
      if (newPwd) {
        masterPassword = newPwd;
        localStorage.setItem('csp_master_password', masterPassword);
        // Extend 7 days
        localStorage.setItem('csp_session_expiry', (Date.now() + SEVEN_DAYS_MS).toString());
        el.settingPassword.value = '';
        showToast('Password updated successfully!');
      } else {
        showToast('Shop details updated');
      }

      syncAllDataToServer();
      el.centerModal.classList.add('hidden');
    });

    // Close on backdrop click
    [el.denomModal, el.historyModal, el.centerModal, el.confirmEntryModal, el.confirmDepositModal, el.modifyModal, el.backupModal].forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.add('hidden');
      });
    });
  }

  function renderHistoryModal() {
    const history = JSON.parse(localStorage.getItem('csp_history') || '[]');
    el.historyCountBadge.innerText = history.length;
    el.historyListContainer.innerHTML = '';

    if (history.length === 0) {
      el.historyListContainer.innerHTML = '<p class="text-center text-slate-400 py-6 text-xs">No saved history yet.</p>';
      return;
    }

    history.forEach(item => {
      const row = document.createElement('div');
      row.className = 'p-3 rounded-lg border border-slate-200 bg-white flex justify-between items-center text-xs';
      
      let badge = 'bg-emerald-100 text-emerald-800';
      if (item.diff < 0) badge = 'bg-rose-100 text-rose-800';
      if (item.diff > 0) badge = 'bg-amber-100 text-amber-800';

      row.innerHTML = `
        <div>
          <div class="font-bold text-slate-900 font-mono">${item.date}</div>
          <div class="text-[11px] text-slate-500 font-mono">Actual: ₹${(item.actual || 0).toLocaleString('en-IN')} | Exp: ₹${(item.expected || 0).toLocaleString('en-IN')}</div>
        </div>
        <div class="flex items-center gap-2">
          <span class="px-2 py-0.5 rounded font-bold font-mono text-[11px] ${badge}">Diff: ₹${(item.diff || 0).toLocaleString('en-IN')}</span>
          <button class="load-hist text-blue-600 font-semibold hover:underline" data-date="${item.date}">Load</button>
        </div>
      `;
      el.historyListContainer.appendChild(row);
    });

    el.historyListContainer.querySelectorAll('.load-hist').forEach(b => {
      b.addEventListener('click', (e) => {
        const d = e.currentTarget.getAttribute('data-date');
        el.selectedDate.value = d;
        loadDayData(d);
        renderDepositsList();
        renderPayoutsList();
        el.historyModal.classList.add('hidden');
        showToast('Loaded ' + d);
      });
    });
  }

  init();

})();
