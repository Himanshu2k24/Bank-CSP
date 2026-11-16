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
  let activeTab = 'daily'; // 'daily', 'deposit', 'payouts', or 'deleted'
  let activeDenomTarget = 'morning';
  let centerName = localStorage.getItem('csp_center_name') || 'CSP Balance Manager';
  let masterUsername = localStorage.getItem('csp_master_username') || 'admin';
  let masterPassword = localStorage.getItem('csp_master_password') || '';
  let isServerConnected = false;

  // Active items for modals
  let currentActivePayout = null;
  let currentActiveDeposit = null;
  let activeModifyType = null; // 'deposit' or 'payout'
  let activeModifyItem = null;

  // Deleted History filters
  let deletedTypeFilter = 'all'; // 'all', 'deposit', 'payout'
  let deletedDateFilter = '';
  let deletedSearchQuery = '';

  // DOM Elements
  const el = {
    // Lock Screen Elements
    lockScreenOverlay: document.getElementById('lockScreenOverlay'),
    lockCard: document.getElementById('lockCard'),
    lockScreenTitle: document.getElementById('lockScreenTitle'),
    lockScreenSubtitle: document.getElementById('lockScreenSubtitle'),
    lockScreenForm: document.getElementById('lockScreenForm'),
    lockUsernameInput: document.getElementById('lockUsernameInput'),
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
    tabDeletedHistory: document.getElementById('tabDeletedHistory'),
    tabDeletedBadge: document.getElementById('tabDeletedBadge'),

    // Views
    viewDailyHisab: document.getElementById('viewDailyHisab'),
    viewDeposit: document.getElementById('viewDeposit'),
    viewKitnaDiye: document.getElementById('viewKitnaDiye'),
    viewDeletedHistory: document.getElementById('viewDeletedHistory'),
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
    accDigitCount: document.getElementById('accDigitCount'),
    accNumberError: document.getElementById('accNumberError'),
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
    // DELETED HISTORY ELEMENTS
    // ===================================
    deletedTotalBadge: document.getElementById('deletedTotalBadge'),
    deletedSummaryAmount: document.getElementById('deletedSummaryAmount'),
    deletedSummaryDeposits: document.getElementById('deletedSummaryDeposits'),
    deletedSummaryPayouts: document.getElementById('deletedSummaryPayouts'),
    delFilterTypeAll: document.getElementById('delFilterTypeAll'),
    delFilterTypeDeposit: document.getElementById('delFilterTypeDeposit'),
    delFilterTypePayout: document.getElementById('delFilterTypePayout'),
    deletedFilterDate: document.getElementById('deletedFilterDate'),
    deletedFilterTodayBtn: document.getElementById('deletedFilterTodayBtn'),
    deletedFilterAllBtn: document.getElementById('deletedFilterAllBtn'),
    exportDeletedCsvBtn: document.getElementById('exportDeletedCsvBtn'),
    clearAllDeletedBtn: document.getElementById('clearAllDeletedBtn'),
    deletedSearchInput: document.getElementById('deletedSearchInput'),
    deletedListContainer: document.getElementById('deletedListContainer'),
    viewDeletedDepositsBtn: document.getElementById('viewDeletedDepositsBtn'),
    viewDeletedPayoutsBtn: document.getElementById('viewDeletedPayoutsBtn'),
    quickDeletedDepositCount: document.getElementById('quickDeletedDepositCount'),
    quickDeletedPayoutCount: document.getElementById('quickDeletedPayoutCount'),

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
    gitSyncBadge: document.getElementById('gitSyncBadge'),
    gitSyncStatusText: document.getElementById('gitSyncStatusText'),
    manualGitSyncBtn: document.getElementById('manualGitSyncBtn'),
    manualGitSyncBtnText: document.getElementById('manualGitSyncBtnText'),

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
    settingUsername: document.getElementById('settingUsername'),
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
  // 🔒 MASTER USERNAME & PASSWORD (7-DAY REMEMBER AUTH)
  // =========================================================================
  const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

  function checkPasswordAuth() {
    // 1. If no password set anywhere yet -> Setup Admin Account Mode
    if (!masterPassword) {
      el.lockScreenTitle.innerText = "Setup Admin Account";
      el.lockScreenSubtitle.innerText = "Set a username and password to secure your personal CSP site";
      if (el.lockUsernameInput) {
        el.lockUsernameInput.value = masterUsername || 'admin';
        el.lockUsernameInput.disabled = false;
      }
      el.lockInputLabel.innerText = "Create Password / PIN";
      el.unlockBtnText.innerText = "Create Account & Unlock";
      el.rememberMeContainer.classList.add('hidden');
      el.lockErrorMsg.classList.add('hidden');
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

    // 3. Expired or not logged in -> Prompt for Username & Password
    el.lockScreenTitle.innerText = "Personal CSP Vault";
    el.lockScreenSubtitle.innerText = "Enter your Username and Password to unlock";
    if (el.lockUsernameInput) {
      el.lockUsernameInput.value = masterUsername || 'admin';
      el.lockUsernameInput.disabled = false;
    }
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
    const enteredUser = el.lockUsernameInput ? el.lockUsernameInput.value.trim() : 'admin';
    const enteredPass = el.lockPasswordInput.value.trim();

    // Setup mode: user sets new username and password
    if (!masterPassword) {
      if (!enteredUser || enteredUser.length < 2) {
        alert('Username should be at least 2 characters long!');
        return;
      }
      if (!enteredPass || enteredPass.length < 3) {
        alert('Password should be at least 3 characters or numbers long!');
        return;
      }
      masterUsername = enteredUser;
      masterPassword = enteredPass;
      localStorage.setItem('csp_master_username', masterUsername);
      localStorage.setItem('csp_master_password', masterPassword);

      // Set 7 days session
      const expiry = Date.now() + SEVEN_DAYS_MS;
      localStorage.setItem('csp_session_expiry', expiry.toString());
      el.lockScreenOverlay.classList.add('hidden');
      showToast('Admin account created! Unlocked for 7 days.');
      syncAllDataToServer();
      return;
    }

    // Verify existing username and password
    const userMatches = enteredUser.toLowerCase() === (masterUsername || 'admin').toLowerCase();
    const passMatches = enteredPass === masterPassword;

    if (userMatches && passMatches) {
      el.lockErrorMsg.classList.add('hidden');
      const remember = el.rememberMeCheckbox.checked;
      const expiry = Date.now() + (remember ? SEVEN_DAYS_MS : 2 * 60 * 60 * 1000);
      localStorage.setItem('csp_session_expiry', expiry.toString());
      el.lockScreenOverlay.classList.add('hidden');
      showToast(`Welcome back, ${masterUsername}! Unlocked for 7 days.`);
    } else {
      el.lockErrorMsg.innerText = !userMatches ? 'Incorrect username. Please check and try again.' : 'Incorrect password. Please try again.';
      el.lockErrorMsg.classList.remove('hidden');
      el.lockCard.classList.remove('animate-shake');
      void el.lockCard.offsetWidth; // Trigger reflow for animation
      el.lockCard.classList.add('animate-shake');
      if (!userMatches && el.lockUsernameInput) {
        el.lockUsernameInput.select();
      } else {
        el.lockPasswordInput.select();
      }
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
          if (data.settings.username) {
            if (masterUsername && masterUsername !== data.settings.username) {
              localStorage.removeItem('csp_session_expiry');
            }
            masterUsername = data.settings.username;
            localStorage.setItem('csp_master_username', masterUsername);
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

        // 5. Merge Deleted History
        if (Array.isArray(data.deleted) && data.deleted.length > 0) {
          const localDeleted = getDeletedHistory();
          const merged = mergeArraysById(localDeleted, data.deleted);
          localStorage.setItem('csp_deleted_history', JSON.stringify(merged));
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
          username: masterUsername || 'admin',
          password: masterPassword
        },
        deleted: getDeletedHistory()
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
      masterUsername: masterUsername || 'admin',
      masterPassword: masterPassword,
      history: JSON.parse(localStorage.getItem('csp_history') || '[]'),
      deposits: getDeposits(),
      payouts: getPayouts(),
      deleted: getDeletedHistory()
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
          if (data.masterUsername) {
            masterUsername = data.masterUsername;
            localStorage.setItem('csp_master_username', masterUsername);
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
          if (Array.isArray(data.deleted)) {
            localStorage.setItem('csp_deleted_history', JSON.stringify(data.deleted));
          }

          syncAllDataToServer();
          renderDepositsList();
          renderPayoutsList();
          renderDeletedList();
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

  // =========================================================================
  // GITHUB AUTO-SYNC TRIGGER (CLIENT-SIDE)
  // =========================================================================
  async function triggerGitSync(actionDescription = 'Update data') {
    if (!isServerConnected) return;
    try {
      if (el.gitSyncStatusText) el.gitSyncStatusText.innerText = 'Syncing to GitHub...';
      const res = await fetch('/api/git-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: actionDescription })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          if (el.gitSyncStatusText) el.gitSyncStatusText.innerText = `Pushed (${time})`;
          if (el.gitSyncBadge) {
            el.gitSyncBadge.className = 'px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
            el.gitSyncBadge.innerText = 'Auto-Push Active';
          }
        }
      }
    } catch (e) {
      console.warn('Git sync request failed:', e);
    }
  }

  async function checkGitStatus() {
    if (!isServerConnected) return;
    try {
      const res = await fetch('/api/git-status');
      if (res.ok) {
        const json = await res.json();
        if (json.success && el.gitSyncStatusText) {
          el.gitSyncStatusText.innerText = json.status || 'Active';
        }
      }
    } catch (e) {}
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
    if (el.settingUsername) el.settingUsername.value = masterUsername || 'admin';

    // Check & sync server data first
    await checkServerStatusAndSync();

    // Check password protection
    checkPasswordAuth();

    // Check GitHub sync status
    checkGitStatus();

    // Load day data
    await loadDayData(today);

    renderDepositsList();
    renderPayoutsList();
    renderDeletedList();

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
    const activeDeletedClass = 'px-2.5 sm:px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 bg-white text-rose-700 shadow-xs';

    el.tabDailyHisab.className = inactiveClass;
    el.tabDeposit.className = inactiveClass;
    el.tabKitnaDiye.className = inactiveClass;
    el.tabDeletedHistory.className = inactiveClass;

    el.viewDailyHisab.classList.add('hidden');
    el.viewDeposit.classList.add('hidden');
    el.viewKitnaDiye.classList.add('hidden');
    el.viewDeletedHistory.classList.add('hidden');

    if (tab === 'daily') {
      el.viewDailyHisab.classList.remove('hidden');
      el.tabDailyHisab.className = activeDailyClass;
    } else if (tab === 'deposit') {
      el.viewDeposit.classList.remove('hidden');
      el.tabDeposit.className = activeDepositClass;
      renderDepositsList();
    } else if (tab === 'payouts') {
      el.viewKitnaDiye.classList.remove('hidden');
      el.tabKitnaDiye.className = activePayoutClass;
      renderPayoutsList();
    } else if (tab === 'deleted') {
      el.viewDeletedHistory.classList.remove('hidden');
      el.tabDeletedHistory.className = activeDeletedClass;
      renderDeletedList();
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
    const account = el.depositAccountNumber.value.trim().replace(/\D/g, '');
    const amount = parseFloat(el.depositAmount.value) || 0;
    const paymentDate = el.depositPaymentDate.value || el.selectedDate.value;

    if (!name || !account || amount <= 0) {
      alert('Please fill customer name, account number, and valid amount!');
      return;
    }

    // Strict 16-Digit Account Number Validation
    if (account.length !== 16 || !/^\d{16}$/.test(account)) {
      if (el.accNumberError) el.accNumberError.classList.remove('hidden');
      el.depositAccountNumber.classList.add('border-rose-400');
      el.depositAccountNumber.focus();
      alert(`Account Number must be exactly 16 digits!\n(खाता संख्या ठीक 16 अंकों की होनी चाहिए, अभी ${account.length} अंक हैं)`);
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
    if (el.accDigitCount) {
      el.accDigitCount.innerText = '(0/16 digits)';
      el.accDigitCount.className = 'text-[10px] font-mono font-bold text-amber-600';
    }
    if (el.accNumberError) el.accNumberError.classList.add('hidden');
    el.depositAccountNumber.classList.remove('border-emerald-400', 'border-rose-400');

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
        const itemToDelete = getDeposits().find(item => item.id === id);
        if (confirm(`Delete deposit entry for ${itemToDelete ? itemToDelete.name : 'customer'}? It will be safely preserved in Deleted History.`)) {
          if (itemToDelete) {
            addToDeletedHistory(itemToDelete, 'deposit');
          }
          const list = getDeposits().filter(item => item.id !== id);
          saveDeposits(list);
          showToast('Deposit deleted & saved to Deleted History');
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
        const itemToDelete = getPayouts().find(item => item.id === id);
        if (confirm(`Delete udhari entry for ${itemToDelete ? itemToDelete.name : 'customer'}? It will be safely preserved in Deleted History.`)) {
          if (itemToDelete) {
            addToDeletedHistory(itemToDelete, 'payout');
          }
          const list = getPayouts().filter(item => item.id !== id);
          savePayouts(list);
          showToast('Entry deleted & saved to Deleted History');
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
  // SECTION: DELETED HISTORY AUDIT TRAIL
  // =========================================================================
  function getDeletedHistory() {
    return JSON.parse(localStorage.getItem('csp_deleted_history') || '[]');
  }

  function saveDeletedHistory(list) {
    localStorage.setItem('csp_deleted_history', JSON.stringify(list));
    renderDeletedList();
    syncAllDataToServer();
  }

  function addToDeletedHistory(item, type) {
    const now = new Date();
    const deletedDate = now.toISOString().split('T')[0];
    const deletedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const formattedDeletedDate = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

    let addedDate = 'N/A';
    let addedTime = 'N/A';
    if (type === 'deposit') {
      addedDate = item.paymentDate || (item.timestamp ? item.timestamp.split('T')[0] : 'N/A');
      addedTime = item.formattedTime || (item.timestamp ? new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A');
    } else {
      addedDate = item.date || item.formattedDate || (item.timestamp ? item.timestamp.split('T')[0] : 'N/A');
      addedTime = item.formattedTime || (item.timestamp ? new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A');
    }

    const deletedRecord = {
      id: 'DEL-' + Date.now().toString().slice(-6) + '-' + Math.floor(Math.random() * 1000),
      originalId: item.id || '',
      type: type, // 'deposit' or 'payout'
      name: item.name || 'Unknown Customer',
      account: item.account || '',
      mobile: item.mobile || '',
      amount: Number(item.amount) || 0,
      // Details of Add
      addedDate: addedDate,
      addedTime: addedTime,
      addedTimestamp: item.timestamp || now.toISOString(),
      // Details of Delete
      deletedDate: deletedDate,
      deletedTime: deletedTime,
      formattedDeletedDate: formattedDeletedDate,
      deletedTimestamp: now.toISOString(),
      // Step History
      history: Array.isArray(item.history) ? item.history : []
    };

    const list = getDeletedHistory();
    list.unshift(deletedRecord);
    saveDeletedHistory(list);
  }

  function restoreDeletedItem(id) {
    const list = getDeletedHistory();
    const item = list.find(d => d.id === id);
    if (!item) return;

    const label = item.type === 'deposit' ? 'deposit' : 'udhari';
    if (!confirm(`Restore ${label} record of ₹${item.amount.toLocaleString('en-IN')} for ${item.name}?`)) {
      return;
    }

    if (item.type === 'deposit') {
      const deposits = getDeposits();
      const restored = {
        id: item.originalId || ('DEP-' + Date.now().toString().slice(-6)),
        name: item.name,
        account: item.account,
        amount: item.amount,
        paymentDate: item.addedDate !== 'N/A' ? item.addedDate : new Date().toISOString().split('T')[0],
        timestamp: item.addedTimestamp || new Date().toISOString(),
        formattedTime: item.addedTime !== 'N/A' ? item.addedTime : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        history: item.history && item.history.length > 0 ? item.history : [
          { step: 1, amount: item.amount, timestamp: `${item.addedDate} ${item.addedTime}`, reason: 'Restored from Deleted History' }
        ]
      };
      deposits.unshift(restored);
      saveDeposits(deposits);
      showToast(`Deposit of ₹${item.amount.toLocaleString('en-IN')} for ${item.name} restored!`);
    } else {
      const payouts = getPayouts();
      const restored = {
        id: item.originalId || ('PAY-' + Date.now().toString().slice(-6)),
        date: item.addedDate !== 'N/A' ? item.addedDate : new Date().toISOString().split('T')[0],
        timestamp: item.addedTimestamp || new Date().toISOString(),
        formattedTime: item.addedTime !== 'N/A' ? item.addedTime : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        formattedDate: item.addedDate !== 'N/A' ? item.addedDate : new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        name: item.name,
        amount: item.amount,
        mobile: item.mobile,
        history: item.history && item.history.length > 0 ? item.history : [
          { step: 1, amount: item.amount, timestamp: `${item.addedDate} ${item.addedTime}`, reason: 'Restored from Deleted History' }
        ]
      };
      payouts.unshift(restored);
      savePayouts(payouts);
      showToast(`Udhari entry of ₹${item.amount.toLocaleString('en-IN')} for ${item.name} restored!`);
    }

    const updatedList = list.filter(d => d.id !== id);
    saveDeletedHistory(updatedList);
  }

  function permanentlyDelete(id) {
    if (confirm('Permanently delete this record? This action cannot be undone.')) {
      const list = getDeletedHistory().filter(d => d.id !== id);
      saveDeletedHistory(list);
      showToast('Record permanently deleted');
    }
  }

  function clearAllDeleted() {
    const list = getDeletedHistory();
    if (list.length === 0) {
      showToast('Deleted History is already empty');
      return;
    }
    if (confirm('Permanently clear all deleted records? This will erase all audit logs in Deleted History.')) {
      saveDeletedHistory([]);
      showToast('Deleted history cleared completely');
    }
  }

  function setDeletedTypeFilter(type) {
    deletedTypeFilter = type;
    const activeClass = 'px-2.5 py-1 rounded-md text-xs font-bold bg-white text-slate-800 shadow-xs';
    const inactiveClass = 'px-2.5 py-1 rounded-md text-xs font-bold text-slate-600 hover:text-slate-900';

    el.delFilterTypeAll.className = type === 'all' ? activeClass : inactiveClass;
    el.delFilterTypeDeposit.className = type === 'deposit' ? activeClass : inactiveClass;
    el.delFilterTypePayout.className = type === 'payout' ? activeClass : inactiveClass;

    renderDeletedList();
  }

  function exportDeletedCsv() {
    const list = getDeletedHistory();
    if (list.length === 0) {
      alert('No deleted records to export!');
      return;
    }

    const headers = [
      'Type',
      'Customer Name',
      'Account / Mobile',
      'Amount (INR)',
      'Date Added (Original)',
      'Time Added',
      'Date Deleted',
      'Time Deleted',
      'Original ID'
    ];

    const rows = list.map(item => [
      item.type === 'deposit' ? 'Deposit' : 'Udhari',
      `"${(item.name || '').replace(/"/g, '""')}"`,
      `"${item.type === 'deposit' ? item.account : (item.mobile ? '+91 ' + item.mobile : '')}"`,
      item.amount,
      item.addedDate,
      item.addedTime,
      item.deletedDate,
      item.deletedTime,
      item.originalId || item.id
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `CSP_Deleted_History_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function renderDeletedList() {
    const allList = getDeletedHistory();

    // Badges & Metrics
    el.tabDeletedBadge.innerText = allList.length;
    el.deletedTotalBadge.innerText = `${allList.length} Item${allList.length === 1 ? '' : 's'}`;

    const depositItems = allList.filter(d => d.type === 'deposit');
    const payoutItems = allList.filter(d => d.type === 'payout');

    el.quickDeletedDepositCount.innerText = depositItems.length;
    el.quickDeletedPayoutCount.innerText = payoutItems.length;

    const totalDeletedAmount = allList.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const depositDeletedAmount = depositItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const payoutDeletedAmount = payoutItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

    el.deletedSummaryAmount.innerText = '₹' + totalDeletedAmount.toLocaleString('en-IN');
    el.deletedSummaryDeposits.innerText = `${depositItems.length} (₹${depositDeletedAmount.toLocaleString('en-IN')})`;
    el.deletedSummaryPayouts.innerText = `${payoutItems.length} (₹${payoutDeletedAmount.toLocaleString('en-IN')})`;

    // Filter List
    let filtered = allList;
    if (deletedTypeFilter !== 'all') {
      filtered = filtered.filter(item => item.type === deletedTypeFilter);
    }
    if (deletedDateFilter) {
      filtered = filtered.filter(item => item.deletedDate === deletedDateFilter);
    }
    if (deletedSearchQuery) {
      filtered = filtered.filter(item => {
        const q = deletedSearchQuery;
        const nameMatch = (item.name || '').toLowerCase().includes(q);
        const accMatch = (item.account || '').toLowerCase().includes(q);
        const mobMatch = (item.mobile || '').toLowerCase().includes(q);
        const amtMatch = String(item.amount || '').includes(q);
        const dateMatch = (item.addedDate || '').includes(q) || (item.deletedDate || '').includes(q);
        return nameMatch || accMatch || mobMatch || amtMatch || dateMatch;
      });
    }

    el.deletedListContainer.innerHTML = '';

    if (filtered.length === 0) {
      el.deletedListContainer.innerHTML = `
        <div class="bg-white rounded-xl border border-slate-200 p-8 sm:p-12 text-center space-y-3">
          <div class="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <i data-lucide="trash-2" class="w-6 h-6"></i>
          </div>
          <div class="text-sm font-bold text-slate-700">No Deleted Records Found</div>
          <p class="text-xs text-slate-400 max-w-sm mx-auto">
            Whenever any Deposit or Udhari entry is deleted, it will be safely logged here with complete Add and Delete timestamps.
          </p>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    filtered.forEach(item => {
      const isDeposit = item.type === 'deposit';
      const borderClass = isDeposit ? 'border-l-4 border-l-emerald-500' : 'border-l-4 border-l-indigo-500';
      const typeBadge = isDeposit
        ? `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1"><i data-lucide="arrow-down-circle" class="w-3 h-3 text-emerald-600"></i> Deposit (खाता जमा)</span>`
        : `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-200 flex items-center gap-1"><i data-lucide="hand-coins" class="w-3 h-3 text-indigo-600"></i> Udhari / Diye</span>`;

      const accountOrMobile = isDeposit
        ? `A/c: <span class="font-mono font-bold text-slate-800">${item.account || 'N/A'}</span>`
        : `Mobile: <span class="font-mono font-bold text-slate-800">${item.mobile ? '+91 ' + item.mobile : 'Not provided'}</span>`;

      const hasHistory = Array.isArray(item.history) && item.history.length > 1;

      const card = document.createElement('div');
      card.className = `bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3 hover:border-slate-300 transition ${borderClass}`;
      card.innerHTML = `
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div class="flex items-center gap-2 flex-wrap">
            ${typeBadge}
            <h3 class="text-base font-bold text-slate-900">${item.name}</h3>
            <span class="text-xs text-slate-400">|</span>
            <span class="text-xs text-slate-600">${accountOrMobile}</span>
          </div>

          <div class="flex items-center gap-3">
            <div class="text-right">
              <span class="text-[10px] uppercase font-bold text-slate-400 block">Amount Deleted</span>
              <span class="text-lg font-black font-mono text-rose-700 line-through">₹${item.amount.toLocaleString('en-IN')}</span>
            </div>

            <!-- Action Buttons: Restore & Delete Permanently -->
            <div class="flex items-center gap-1 pl-2 border-l border-slate-200">
              <button class="restore-del-btn px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition flex items-center gap-1 border border-emerald-200" data-id="${item.id}" title="Restore back to active ledger">
                <i data-lucide="rotate-ccw" class="w-3.5 h-3.5"></i>
                <span>Restore (वापस लाएं)</span>
              </button>
              <button class="permanent-del-btn p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition" data-id="${item.id}" title="Permanently delete from audit log">
                <i data-lucide="trash" class="w-3.5 h-3.5"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- 2-Box Comparison: Details of ADD vs Details of DELETE -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          
          <!-- Box 1: Details of ADD -->
          <div class="p-3 rounded-lg bg-emerald-50/50 border border-emerald-100 space-y-1.5">
            <div class="flex items-center justify-between font-bold text-emerald-900 border-b border-emerald-200/60 pb-1">
              <span class="flex items-center gap-1">
                <i data-lucide="plus-circle" class="w-3.5 h-3.5 text-emerald-600"></i>
                <span>Details of ADD (कब जोड़ा गया था)</span>
              </span>
              <span class="font-mono text-[10px] text-emerald-700">${item.originalId || item.id}</span>
            </div>
            <div class="grid grid-cols-2 gap-2 text-[11px] pt-1">
              <div>
                <span class="text-slate-500 block">Payment / Trans Date:</span>
                <strong class="text-slate-800 font-mono text-xs">${item.addedDate}</strong>
              </div>
              <div>
                <span class="text-slate-500 block">Time Added:</span>
                <strong class="text-slate-800 font-mono text-xs">${item.addedTime}</strong>
              </div>
            </div>
          </div>

          <!-- Box 2: Details of DELETE -->
          <div class="p-3 rounded-lg bg-rose-50/50 border border-rose-100 space-y-1.5">
            <div class="flex items-center justify-between font-bold text-rose-900 border-b border-rose-200/60 pb-1">
              <span class="flex items-center gap-1">
                <i data-lucide="trash-2" class="w-3.5 h-3.5 text-rose-600"></i>
                <span>Details of DELETE (कब हटाया गया)</span>
              </span>
              <span class="px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-100 text-rose-800">DELETED</span>
            </div>
            <div class="grid grid-cols-2 gap-2 text-[11px] pt-1">
              <div>
                <span class="text-slate-500 block">Date of Deletion:</span>
                <strong class="text-rose-700 font-mono text-xs">${item.deletedDate}</strong>
              </div>
              <div>
                <span class="text-slate-500 block">Time of Deletion:</span>
                <strong class="text-rose-700 font-mono text-xs">${item.deletedTime}</strong>
              </div>
            </div>
          </div>

        </div>

        ${hasHistory ? `
          <!-- Collapsible Modification Steps Prior to Deletion -->
          <div class="pt-1">
            <button class="toggle-del-history-btn text-[11px] font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 transition" data-id="${item.id}">
              <i data-lucide="history" class="w-3 h-3 text-indigo-500"></i>
              <span>View ${item.history.length} modification step(s) recorded before deletion</span>
            </button>
            <div id="del-steps-${item.id}" class="hidden mt-2 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1.5">
              ${item.history.map(s => `
                <div class="flex items-center justify-between text-[11px] border-b border-slate-200/50 last:border-none pb-1">
                  <div>
                    <span class="font-bold text-slate-700">Step #${s.step}:</span>
                    <span class="text-slate-500">${s.reason || 'Amount updated'}</span>
                    <span class="text-[10px] text-slate-400">(${s.timestamp})</span>
                  </div>
                  <span class="font-mono font-bold text-slate-900">₹${s.amount.toLocaleString('en-IN')}</span>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
      `;

      el.deletedListContainer.appendChild(card);
    });

    // Wire up Restore buttons
    el.deletedListContainer.querySelectorAll('.restore-del-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        restoreDeletedItem(id);
      });
    });

    // Wire up Permanent Delete buttons
    el.deletedListContainer.querySelectorAll('.permanent-del-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        permanentlyDelete(id);
      });
    });

    // Wire up Toggle History buttons
    el.deletedListContainer.querySelectorAll('.toggle-del-history-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const box = document.getElementById(`del-steps-${id}`);
        if (box) {
          box.classList.toggle('hidden');
        }
      });
    });

    if (window.lucide) window.lucide.createIcons();
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
      checkGitStatus();
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

    // GitHub Manual Push Button
    if (el.manualGitSyncBtn) {
      el.manualGitSyncBtn.addEventListener('click', async () => {
        el.manualGitSyncBtn.disabled = true;
        if (el.manualGitSyncBtnText) el.manualGitSyncBtnText.innerText = 'Pushing to GitHub...';
        await syncAllDataToServer();
        await triggerGitSync('Manual push from UI');
        el.manualGitSyncBtn.disabled = false;
        if (el.manualGitSyncBtnText) el.manualGitSyncBtnText.innerText = 'Push to GitHub Now (अभी गिटहब पर भेजें)';
        showToast('Committed & pushed to GitHub repository!');
      });
    }

    // Tab Navigation
    el.tabDailyHisab.addEventListener('click', () => switchTab('daily'));
    el.tabDeposit.addEventListener('click', () => switchTab('deposit'));
    el.tabKitnaDiye.addEventListener('click', () => switchTab('payouts'));
    el.tabDeletedHistory.addEventListener('click', () => switchTab('deleted'));
    el.viewDeletedDepositsBtn.addEventListener('click', () => {
      switchTab('deleted');
      setDeletedTypeFilter('deposit');
    });
    el.viewDeletedPayoutsBtn.addEventListener('click', () => {
      switchTab('deleted');
      setDeletedTypeFilter('payout');
    });

    // Deleted History Filters & Actions
    el.delFilterTypeAll.addEventListener('click', () => setDeletedTypeFilter('all'));
    el.delFilterTypeDeposit.addEventListener('click', () => setDeletedTypeFilter('deposit'));
    el.delFilterTypePayout.addEventListener('click', () => setDeletedTypeFilter('payout'));
    el.deletedFilterDate.addEventListener('change', () => {
      deletedDateFilter = el.deletedFilterDate.value;
      renderDeletedList();
    });
    el.deletedFilterTodayBtn.addEventListener('click', () => {
      const today = new Date().toISOString().split('T')[0];
      el.deletedFilterDate.value = today;
      deletedDateFilter = today;
      renderDeletedList();
    });
    el.deletedFilterAllBtn.addEventListener('click', () => {
      el.deletedFilterDate.value = '';
      deletedDateFilter = '';
      renderDeletedList();
    });
    el.deletedSearchInput.addEventListener('input', (e) => {
      deletedSearchQuery = e.target.value.toLowerCase().trim();
      renderDeletedList();
    });
    el.exportDeletedCsvBtn.addEventListener('click', exportDeletedCsv);
    el.clearAllDeletedBtn.addEventListener('click', clearAllDeleted);

    // Live 16-Digit Account Number Sanitizer & Counter
    el.depositAccountNumber.addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/\D/g, '').slice(0, 16);
      const len = e.target.value.length;
      if (el.accDigitCount) {
        if (len === 16) {
          el.accDigitCount.innerText = '✓ 16 Digits';
          el.accDigitCount.className = 'text-[10px] font-mono font-bold text-emerald-600';
          if (el.accNumberError) el.accNumberError.classList.add('hidden');
          el.depositAccountNumber.classList.remove('border-rose-400');
          el.depositAccountNumber.classList.add('border-emerald-400');
        } else {
          el.accDigitCount.innerText = `(${len}/16 digits)`;
          el.accDigitCount.className = 'text-[10px] font-mono font-bold text-amber-600';
          el.depositAccountNumber.classList.remove('border-emerald-400');
        }
      }
    });

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
    el.editCenterBtn.addEventListener('click', () => {
      if (el.settingCenterName) el.settingCenterName.value = centerName || '';
      if (el.settingUsername) el.settingUsername.value = masterUsername || 'admin';
      if (el.settingPassword) el.settingPassword.value = '';
      el.centerModal.classList.remove('hidden');
    });
    el.cancelCenterBtn.addEventListener('click', () => el.centerModal.classList.add('hidden'));
    el.saveCenterBtn.addEventListener('click', () => {
      centerName = el.settingCenterName.value.trim() || 'CSP Balance Manager';
      localStorage.setItem('csp_center_name', centerName);
      el.headerTitle.innerText = centerName;

      // Update Master Username if entered
      const newUsername = el.settingUsername ? el.settingUsername.value.trim() : '';
      if (newUsername) {
        masterUsername = newUsername;
        localStorage.setItem('csp_master_username', masterUsername);
      }

      // Update Master Password if entered
      const newPwd = el.settingPassword.value.trim();
      let pwdUpdated = false;
      if (newPwd) {
        masterPassword = newPwd;
        localStorage.setItem('csp_master_password', masterPassword);
        // Extend 7 days
        localStorage.setItem('csp_session_expiry', (Date.now() + SEVEN_DAYS_MS).toString());
        el.settingPassword.value = '';
        pwdUpdated = true;
      }

      if (pwdUpdated) {
        showToast('Password & Security settings updated!');
      } else {
        showToast('Shop & Login details updated');
      }

      syncAllDataToServer();
      triggerGitSync('Updated Center & Security Settings');
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
