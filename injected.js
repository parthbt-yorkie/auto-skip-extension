// YouTube Auto Skip - Injected Script (runs in main world)

(function () {
    'use strict';

    let wasAdPlaying = false;
    let wasMuted = false;

    window.addEventListener('youtube-auto-skip-command', function (e) {
        if (e.detail === 'speed-up-ad') {
            speedUpAd();
        } else if (e.detail === 'restore-normal') {
            restoreNormal();
        }
    });

    function speedUpAd() {
        const video = document.querySelector('video');
        const player = document.getElementById('movie_player');
        
        if (!video || !player) return;
        
        // Save mute state before muting (only on first detection)
        if (!wasAdPlaying && typeof player.isMuted === 'function') {
            wasMuted = player.isMuted();
        }
        
        // Speed up the video
        if (video.playbackRate !== 16) {
            video.playbackRate = 16;
            console.log('[YouTube Auto Skip] Ad sped up to 16x');
        }
        
        // Always mute (in case it got unmuted)
        if (typeof player.mute === 'function' && typeof player.isMuted === 'function') {
            if (!player.isMuted()) {
                player.mute();
                console.log('[YouTube Auto Skip] Ad muted');
            }
        }
        
        wasAdPlaying = true;
    }

    function restoreNormal() {
        const video = document.querySelector('video');
        const player = document.getElementById('movie_player');
        
        if (!wasAdPlaying) return;
        
        if (video) {
            video.playbackRate = 1;
        }
        
        // Restore mute state
        if (player && typeof player.unMute === 'function' && !wasMuted) {
            player.unMute();
        }
        
        wasAdPlaying = false;
        console.log('[YouTube Auto Skip] Normal playback restored');
    }
})();
