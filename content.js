// YouTube Auto Skip - Content Script

(function () {
    'use strict';

    let isEnabled = true;
    let checkInterval = null;
    let observer = null;
    let skippedCount = 0;
    let dismissedCount = 0;
    let lastCountTime = 0;
    const DEBOUNCE_MS = 5000;

    function loadState() {
        try {
            chrome.storage.sync.get(['autoSkipEnabled', 'skippedCount', 'dismissedCount'], (result) => {
                isEnabled = result.autoSkipEnabled !== false;
                skippedCount = result.skippedCount || 0;
                dismissedCount = result.dismissedCount || 0;
                if (isEnabled) startMonitoring();
            });
        } catch (e) {
            isEnabled = true;
            startMonitoring();
        }
    }

    function saveStats() {
        try {
            chrome.storage.sync.set({ skippedCount, dismissedCount });
        } catch (e) { }
    }

    function sendCommand(command) {
        window.dispatchEvent(new CustomEvent('youtube-auto-skip-command', { detail: command }));
    }

    function isAdPlaying() {
        const player = document.getElementById('movie_player');
        return !!(
            document.querySelector('.ytp-ad-player-overlay-layout') ||
            (player && player.classList.contains('ad-showing'))
        );
    }

    function handleAd() {
        const now = Date.now();
        
        if (isAdPlaying()) {
            // Speed up the ad
            sendCommand('speed-up-ad');
            
            // Count this ad (debounced)
            if (now - lastCountTime > DEBOUNCE_MS) {
                lastCountTime = now;
                skippedCount++;
                saveStats();
            }
        } else {
            // Restore normal playback when ad ends
            sendCommand('restore-normal');
        }
    }

    function tryDismissPopup() {
        const dialog = document.querySelector('yt-confirm-dialog-renderer');
        if (!dialog) return false;

        const btn = dialog.querySelector('#confirm-button button') ||
            dialog.querySelector('yt-button-renderer button');

        if (btn) {
            btn.click();
            dismissedCount++;
            saveStats();
            return true;
        }
        return false;
    }

    function checkAndHandle() {
        if (!isEnabled) return;
        handleAd();
        tryDismissPopup();
    }

    function startMonitoring() {
        if (checkInterval) return;
        checkInterval = setInterval(checkAndHandle, 300);

        if (!observer) {
            observer = new MutationObserver(() => {
                if (isEnabled) setTimeout(checkAndHandle, 50);
            });
            if (document.body) {
                observer.observe(document.body, {
                    childList: true,
                    subtree: true,
                    attributes: true,
                    attributeFilter: ['class']
                });
            }
        }
    }

    function stopMonitoring() {
        if (checkInterval) {
            clearInterval(checkInterval);
            checkInterval = null;
        }
        if (observer) {
            observer.disconnect();
            observer = null;
        }
        // Restore normal playback when disabled
        sendCommand('restore-normal');
    }

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.action === 'toggle') {
            isEnabled = message.enabled;
            isEnabled ? startMonitoring() : stopMonitoring();
            sendResponse({ success: true });
        } else if (message.action === 'getStats') {
            sendResponse({ skippedCount, dismissedCount });
        } else if (message.action === 'resetStats') {
            skippedCount = 0;
            dismissedCount = 0;
            saveStats();
            sendResponse({ success: true });
        }
        return true;
    });

    loadState();
})();
