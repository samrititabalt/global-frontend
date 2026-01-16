# LinkedIn Helper Browser Extension

## Installation

1. **Download this folder** or extract from zip
2. **Open Chrome/Edge** and go to `chrome://extensions` (or `edge://extensions`)
3. **Enable Developer Mode** (toggle in top right)
4. **Click "Load unpacked"**
5. **Select this folder** (`linkedin-helper-extension`)

## Configuration

Before using, update the API URL in `background.js`:

```javascript
const API_BASE_URL = 'https://your-backend-url.com/api';
```

Replace with your actual backend URL.

## Icons

You need to create icon files:
- `icon16.png` (16x16 pixels)
- `icon48.png` (48x48 pixels)  
- `icon128.png` (128x128 pixels)

Or use a simple LinkedIn logo icon. You can generate these from any LinkedIn logo image using an online tool.

## Usage

1. Install the extension
2. Go to LinkedIn Helper dashboard
3. Click "Connect Account"
4. Extension will automatically detect your LinkedIn session
5. Accept terms and connect

## Features

- Automatically runs on LinkedIn pages
- Syncs inbox conversations
- Sends messages with human-like behavior
- Sends connection requests
- Secure - uses your existing LinkedIn login

