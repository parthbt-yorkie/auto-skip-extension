# YouTube Auto Skip

A Chrome extension that automatically skips YouTube ads and dismisses "Are you still watching?" popups.

## ✨ Features

- **Auto Skip Ads** - Automatically skips video ads as soon as the skip button becomes available
- **Dismiss Popups** - Auto-clicks "Yes" on "Are you still watching?" prompts
- **Stats Tracking** - Track how many ads you've skipped and popups dismissed
- **Easy Toggle** - Enable/disable the extension with one click from the popup
- **Lightweight** - Minimal code, no external dependencies

---

## 📁 File Structure

```
auto-skip-extension/
├── manifest.json      # Chrome extension configuration
├── content.js         # Content script (runs on YouTube pages)
├── injected.js        # Injected script (runs in main world)
├── background.js      # Background service worker
├── popup.html         # Extension popup UI
├── popup.css          # Popup styles
├── popup.js           # Popup functionality
├── icons/
│   ├── icon16.png     # Toolbar icon (16x16)
│   ├── icon48.png     # Extension page icon (48x48)
│   └── icon128.png    # Chrome Web Store icon (128x128)
└── README.md          # This file
```

### File Descriptions

| File            | Description                                                                                                                                |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `manifest.json` | Defines extension permissions, scripts, and metadata. Uses Manifest V3.                                                                    |
| `content.js`    | Runs in an isolated world on YouTube. Detects ads and skip buttons, sends commands to the injected script.                                 |
| `injected.js`   | Runs in the main world (same context as YouTube's scripts). Has access to YouTube's player API to execute `stopVideo()` and `playVideo()`. |
| `background.js` | Service worker that initializes default settings on extension install.                                                                     |
| `popup.html`    | The HTML structure for the extension popup UI.                                                                                             |
| `popup.css`     | Styles for the popup with a dark YouTube-inspired theme.                                                                                   |
| `popup.js`      | Handles popup interactions: toggle, stats display, reset functionality.                                                                    |

### How It Works

1. **Detection** (`content.js`): Monitors the page for ad indicators (`.ytp-skip-ad-button`, `.ad-showing` class, etc.)
2. **Communication**: When a skippable ad is detected, sends a custom event to `injected.js`
3. **Skip** (`injected.js`): Uses YouTube's internal player API (`player.stopVideo()` + `player.playVideo()`) to skip the ad
4. **Stats**: Tracks and persists skip counts using Chrome's storage API

---

## 🚀 Installation

### Option 1: Clone from GitHub

```bash
# Clone the repository
git clone https://github.com/parthbt-yorkie/auto-skip-extension.git

# Navigate to the directory
cd auto-skip-extension
```

### Option 2: Download ZIP

1. Click the green **Code** button on GitHub
2. Select **Download ZIP**
3. Extract the ZIP file to a folder

---

## 🔧 Load Extension in Chrome

1. Open Chrome and navigate to:

   ```
   chrome://extensions/
   ```

2. Enable **Developer mode** (toggle in the top right corner)

3. Click **Load unpacked**

4. Select the `auto-skip-extension` folder

5. The extension icon will appear in your toolbar! 🎉

---

## 📖 Usage

1. **Click the extension icon** in your Chrome toolbar to open the popup

2. **Toggle the switch** to enable or disable auto-skip

3. **Watch YouTube** - ads will be skipped automatically when the skip button appears

4. **View stats** - see how many ads you've skipped and popups dismissed

5. **Reset stats** - click "Reset Stats" to clear the counters

---

## 🔒 Privacy

This extension:

- ✅ Only runs on `youtube.com`
- ✅ Stores settings locally in Chrome
- ✅ Does not collect any personal data
- ✅ Does not make any network requests
- ✅ Open source - you can verify all the code

---

## 🛠️ Development

To modify the extension:

1. Make changes to the source files
2. Go to `chrome://extensions/`
3. Click the **refresh icon** on the extension card
4. Refresh any open YouTube tabs

---

## 📝 License

MIT License - Feel free to modify and distribute!

---

**Enjoy ad-free YouTube! 🎬**
