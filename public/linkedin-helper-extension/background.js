// Background service worker for LinkedIn Helper Extension
// TODO: Update this URL to match your backend
const API_BASE_URL = 'https://your-backend-url.com/api';

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getAuthToken') {
    chrome.storage.local.get(['authToken'], (result) => {
      sendResponse({ token: result.authToken });
    });
    return true; // Keep channel open for async response
  }

  if (request.action === 'setAuthToken') {
    chrome.storage.local.set({ authToken: request.token }, () => {
      sendResponse({ success: true });
    });
    return true;
  }

  if (request.action === 'apiRequest') {
    handleAPIRequest(request, sendResponse);
    return true;
  }
});

async function handleAPIRequest(request, sendResponse) {
  try {
    const { token } = await chrome.storage.local.get(['authToken']);
    
    const response = await fetch(`${API_BASE_URL}${request.endpoint}`, {
      method: request.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: request.body ? JSON.stringify(request.body) : undefined
    });

    const data = await response.json();
    sendResponse({ success: response.ok, data });
  } catch (error) {
    sendResponse({ success: false, error: error.message });
  }
}

// Listen for tab updates to inject content script
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url?.includes('linkedin.com')) {
    chrome.tabs.sendMessage(tabId, { action: 'pageLoaded' }).catch(() => {
      // Content script not ready, ignore
    });
  }
});

