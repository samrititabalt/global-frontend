// Popup script for extension

let isConnected = false;
let authToken = null;

// Check connection status on load
chrome.storage.local.get(['authToken'], (result) => {
  authToken = result.authToken;
  isConnected = !!authToken;
  updateUI();
});

// Connect button
document.getElementById('connectBtn').addEventListener('click', async () => {
  if (isConnected) {
    // Disconnect
    chrome.storage.local.remove(['authToken'], () => {
      authToken = null;
      isConnected = false;
      updateUI();
    });
  } else {
    // Open dashboard to connect
    chrome.tabs.create({
      url: 'https://your-app-url.com/solutions/linkedin-helper/connect'
    });
  }
});

// Sync button
document.getElementById('syncBtn').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  if (tab.url?.includes('linkedin.com')) {
    chrome.tabs.sendMessage(tab.id, { action: 'syncInbox' });
    document.getElementById('syncBtn').disabled = true;
    document.getElementById('syncBtn').textContent = 'Syncing...';
    
    setTimeout(() => {
      document.getElementById('syncBtn').disabled = false;
      document.getElementById('syncBtn').textContent = 'Sync Inbox';
    }, 3000);
  } else {
    alert('Please navigate to LinkedIn first');
  }
});

function updateUI() {
  const statusEl = document.getElementById('status');
  const connectBtn = document.getElementById('connectBtn');
  const syncBtn = document.getElementById('syncBtn');

  if (isConnected) {
    statusEl.className = 'status connected';
    statusEl.textContent = '✓ Connected';
    connectBtn.textContent = 'Disconnect';
    syncBtn.disabled = false;
  } else {
    statusEl.className = 'status disconnected';
    statusEl.textContent = 'Not connected';
    connectBtn.textContent = 'Connect to Dashboard';
    syncBtn.disabled = true;
  }
}

// Listen for auth token updates
chrome.storage.onChanged.addListener((changes) => {
  if (changes.authToken) {
    authToken = changes.authToken.newValue;
    isConnected = !!authToken;
    updateUI();
  }
});

