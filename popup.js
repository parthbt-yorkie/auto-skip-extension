// YouTube Auto Skip - Popup Script

document.addEventListener('DOMContentLoaded', () => {
  const enableToggle = document.getElementById('enableToggle');
  const statusIndicator = document.getElementById('statusIndicator');
  const adsSkippedEl = document.getElementById('adsSkipped');
  const popupsDismissedEl = document.getElementById('popupsDismissed');
  const resetStatsBtn = document.getElementById('resetStats');

  loadState();
  loadStats();

  enableToggle.addEventListener('change', () => {
    const enabled = enableToggle.checked;
    chrome.storage.sync.set({ autoSkipEnabled: enabled });
    updateStatusUI(enabled);
    notifyContentScript({ action: 'toggle', enabled });
  });

  resetStatsBtn.addEventListener('click', () => {
    chrome.storage.sync.set({ skippedCount: 0, dismissedCount: 0 }, () => {
      adsSkippedEl.textContent = '0';
      popupsDismissedEl.textContent = '0';
      resetStatsBtn.textContent = 'Done!';
      setTimeout(() => resetStatsBtn.textContent = 'Reset Stats', 1000);
    });
    notifyContentScript({ action: 'resetStats' });
  });

  function loadState() {
    chrome.storage.sync.get(['autoSkipEnabled'], (result) => {
      const enabled = result.autoSkipEnabled !== false;
      enableToggle.checked = enabled;
      updateStatusUI(enabled);
    });
  }

  function loadStats() {
    chrome.storage.sync.get(['skippedCount', 'dismissedCount'], (result) => {
      adsSkippedEl.textContent = (result.skippedCount || 0).toLocaleString();
      popupsDismissedEl.textContent = (result.dismissedCount || 0).toLocaleString();
    });
  }

  function updateStatusUI(enabled) {
    const statusText = statusIndicator.querySelector('.status-text');
    if (enabled) {
      statusIndicator.classList.remove('disabled');
      statusText.textContent = 'Active';
    } else {
      statusIndicator.classList.add('disabled');
      statusText.textContent = 'Paused';
    }
  }

  function notifyContentScript(message) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.url?.includes('youtube.com')) {
        chrome.tabs.sendMessage(tabs[0].id, message).catch(() => { });
      }
    });
  }

  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'sync') {
      if (changes.skippedCount) {
        adsSkippedEl.textContent = (changes.skippedCount.newValue || 0).toLocaleString();
      }
      if (changes.dismissedCount) {
        popupsDismissedEl.textContent = (changes.dismissedCount.newValue || 0).toLocaleString();
      }
    }
  });
});
