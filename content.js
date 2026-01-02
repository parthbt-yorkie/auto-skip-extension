// YouTube Auto Skip - Content Script

(function () {
    'use strict';

    let isEnabled = true;
    let checkInterval = null;
    let skippedCount = 0;
    let dismissedCount = 0;
    let lastSkipTime = 0;
    let lastDismissTime = 0;
    const DEBOUNCE_MS = 2000;

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

    function sendSkipCommand() {
        window.dispatchEvent(new CustomEvent('youtube-auto-skip-command', { detail: 'skip-ad' }));
    }

    function isAdPlaying() {
        const player = document.getElementById('movie_player');
        return !!(
            document.querySelector('.ytp-ad-player-overlay-layout') ||
            document.querySelector('.ytp-skip-ad-button') ||
            (player && player.classList.contains('ad-showing'))
        );
    }

    function isSkipButtonAvailable() {
        const btn = document.querySelector('button.ytp-skip-ad-button');
        if (!btn || btn.style.display === 'none') return false;
        return (btn.textContent || '').toLowerCase().includes('skip');
    }

    function skipAd() {
        const now = Date.now();
        if (now - lastSkipTime < DEBOUNCE_MS) return false;

        sendSkipCommand();
        lastSkipTime = now;
        skippedCount++;
        saveStats();
        return true;
    }

    function tryDismissPopup() {
        const now = Date.now();
        if (now - lastDismissTime < DEBOUNCE_MS) return false;

        const dialog = document.querySelector('yt-confirm-dialog-renderer');
        if (!dialog) return false;

        const btn = dialog.querySelector('#confirm-button button') ||
            dialog.querySelector('yt-button-renderer button');

        if (btn) {
            btn.click();
            lastDismissTime = now;
            dismissedCount++;
            saveStats();
            return true;
        }
        return false;
    }

    function checkAndSkip() {
        if (!isEnabled) return;
        if (isAdPlaying() && isSkipButtonAvailable()) skipAd();
        tryDismissPopup();
    }

    function startMonitoring() {
        if (checkInterval) return;
        checkInterval = setInterval(checkAndSkip, 500);

        const observer = new MutationObserver(() => {
            if (isEnabled) setTimeout(checkAndSkip, 100);
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

    function stopMonitoring() {
        if (checkInterval) {
            clearInterval(checkInterval);
            checkInterval = null;
        }
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
