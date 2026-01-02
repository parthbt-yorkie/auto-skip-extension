// YouTube Auto Skip - Background Service Worker

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    chrome.storage.sync.set({
      autoSkipEnabled: true,
      skippedCount: 0,
      dismissedCount: 0
    });
  }
});
