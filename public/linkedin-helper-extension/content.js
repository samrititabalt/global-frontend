// Content script that runs on LinkedIn pages

let isConnected = false;
let authToken = null;

// Inject script into page context
const script = document.createElement('script');
script.src = chrome.runtime.getURL('injected.js');
script.onload = function() {
  this.remove();
};
(document.head || document.documentElement).appendChild(script);

// Listen for messages from injected script
window.addEventListener('message', async (event) => {
  // Only accept messages from our extension
  if (event.source !== window || !event.data.fromExtension) return;

  const { action, data } = event.data;

  if (action === 'getAuthToken') {
    // Get token from background script
    chrome.runtime.sendMessage({ action: 'getAuthToken' }, (response) => {
      window.postMessage({
        fromContentScript: true,
        action: 'authToken',
        token: response?.token
      }, '*');
    });
  }

  if (action === 'apiRequest') {
    // Forward API request to background script
    chrome.runtime.sendMessage({
      action: 'apiRequest',
      ...data
    }, (response) => {
      window.postMessage({
        fromContentScript: true,
        action: 'apiResponse',
        requestId: data.requestId,
        response
      }, '*');
    });
  }

  if (action === 'syncInbox') {
    // Trigger inbox sync
    syncInbox();
  }

  if (action === 'sendMessage') {
    // Send message via automation
    sendMessageAutomation(data.conversationId, data.messageText);
  }

  if (action === 'sendConnection') {
    // Send connection request
    sendConnectionRequest(data.profileUrl, data.message);
  }
});

// Get auth token on load
chrome.runtime.sendMessage({ action: 'getAuthToken' }, (response) => {
  authToken = response?.token;
  if (authToken) {
    isConnected = true;
    notifyInjectedScript('connected', { token: authToken });
  }
});

function notifyInjectedScript(action, data) {
  window.postMessage({
    fromContentScript: true,
    action,
    data
  }, '*');
}

// Sync inbox function
async function syncInbox() {
  try {
    const conversations = await extractConversations();
    notifyInjectedScript('inboxSynced', { conversations });
    
    // Send to backend
    chrome.runtime.sendMessage({
      action: 'apiRequest',
      endpoint: '/linkedin-helper/accounts/current/inbox/sync',
      method: 'POST',
      body: { conversations }
    });
  } catch (error) {
    console.error('Inbox sync error:', error);
  }
}

// Extract conversations from LinkedIn page
async function extractConversations() {
  const conversations = [];
  
  // Wait for conversation list to load
  await waitForElement('[data-testid*="conversation"]', 10000);
  
  const conversationElements = document.querySelectorAll('[data-testid*="conversation"]');
  
  conversationElements.forEach((el, index) => {
    if (index >= 20) return; // Limit to 20
    
    const nameEl = el.querySelector('[data-testid*="name"]') || el.querySelector('span[dir="ltr"]');
    const messageEl = el.querySelector('[data-testid*="message"]') || el.querySelector('span[class*="message"]');
    const timeEl = el.querySelector('time') || el.querySelector('[data-testid*="time"]');
    
    const conversationId = el.getAttribute('data-conversation-id') || 
                          el.getAttribute('href')?.match(/\/messaging\/thread\/([^\/]+)/)?.[1] ||
                          `conv_${index}`;
    
    conversations.push({
      conversationId,
      senderName: nameEl?.textContent?.trim() || 'Unknown',
      lastMessage: messageEl?.textContent?.trim() || '',
      timestamp: timeEl?.getAttribute('datetime') || timeEl?.textContent?.trim() || new Date().toISOString()
    });
  });
  
  return conversations;
}

// Send message automation
async function sendMessageAutomation(conversationId, messageText) {
  try {
    // Navigate to conversation if not already there
    if (!window.location.href.includes(`/messaging/thread/${conversationId}`)) {
      window.location.href = `https://www.linkedin.com/messaging/thread/${conversationId}/`;
      await waitForNavigation();
    }
    
    // Wait for message input
    const messageInput = await waitForElement('div[contenteditable="true"][role="textbox"]', 10000);
    
    // Type message character by character
    messageInput.focus();
    await delay(200);
    
    for (const char of messageText) {
      messageInput.textContent += char;
      messageInput.dispatchEvent(new Event('input', { bubbles: true }));
      await delay(50 + Math.random() * 100); // Random delay between characters
    }
    
    await delay(500);
    
    // Find and click send button
    const sendButton = await waitForElement('button[aria-label*="Send"]', 5000);
    await delay(200);
    sendButton.click();
    
    notifyInjectedScript('messageSent', { conversationId, success: true });
  } catch (error) {
    notifyInjectedScript('messageSent', { conversationId, success: false, error: error.message });
  }
}

// Send connection request
async function sendConnectionRequest(profileUrl, message = null) {
  try {
    // Navigate to profile
    window.location.href = profileUrl;
    await waitForNavigation();
    
    // Wait for Connect button
    const connectButton = await waitForElement('button:has-text("Connect")', 10000);
    await delay(300);
    connectButton.click();
    
    await delay(1000);
    
    // If message provided, add note
    if (message) {
      const addNoteButton = await waitForElement('button:has-text("Add a note")', 5000).catch(() => null);
      if (addNoteButton) {
        addNoteButton.click();
        await delay(500);
        
        const noteInput = await waitForElement('textarea[placeholder*="note"]', 5000);
        noteInput.value = message;
        noteInput.dispatchEvent(new Event('input', { bubbles: true }));
        await delay(500);
      }
    }
    
    // Click Send
    const sendButton = await waitForElement('button:has-text("Send")', 5000);
    sendButton.click();
    
    notifyInjectedScript('connectionSent', { profileUrl, success: true });
  } catch (error) {
    notifyInjectedScript('connectionSent', { profileUrl, success: false, error: error.message });
  }
}

// Helper functions
function waitForElement(selector, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const element = document.querySelector(selector);
    if (element) {
      resolve(element);
      return;
    }
    
    const observer = new MutationObserver(() => {
      const element = document.querySelector(selector);
      if (element) {
        observer.disconnect();
        resolve(element);
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Element not found: ${selector}`));
    }, timeout);
  });
}

function waitForNavigation() {
  return new Promise((resolve) => {
    if (document.readyState === 'complete') {
      resolve();
    } else {
      window.addEventListener('load', resolve, { once: true });
    }
  });
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

