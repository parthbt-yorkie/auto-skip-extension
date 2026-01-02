// YouTube Auto Skip - Injected Script (runs in main world)

(function () {
    'use strict';

    window.addEventListener('youtube-auto-skip-command', function (e) {
        if (e.detail === 'skip-ad') {
            const player = document.getElementById('movie_player');
            if (player && typeof player.stopVideo === 'function') {
                player.stopVideo();
                setTimeout(() => {
                    if (typeof player.playVideo === 'function') {
                        player.playVideo();
                    }
                }, 100);
            }
        }
    });
})();
