/**
 * LinkedIn Helper Extension Communication Utility
 * 
 * Handles communication between LinkedIn Helper Pro web app and Chrome extension
 */

const EXTENSION_ID = 'linkedin-helper-pro'; // Will be actual extension ID when published
const MESSAGE_TIMEOUT = 10000; // 10 seconds

/**
 * Check if the extension is installed
 */
export function isExtensionInstalled() {
  return new Promise((resolve) => {
    // Try to communicate with extension via postMessage
    // Extension will respond if installed
    const checkMessage = {
      source: 'linkedin-helper-pro-web',
      action: 'ping'
    };

    const timeout = setTimeout(() => {
      window.removeEventListener('message', messageHandler);
      resolve(false);
    }, 1000);

    const messageHandler = (event) => {
      if (event.data && event.data.source === 'linkedin-helper-extension' && event.data.action === 'pong') {
        clearTimeout(timeout);
        window.removeEventListener('message', messageHandler);
        resolve(true);
      }
    };

    window.addEventListener('message', messageHandler);
    window.postMessage(checkMessage, '*');

    // Also try Chrome runtime messaging (if extension is installed)
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      try {
        chrome.runtime.sendMessage(EXTENSION_ID, { action: 'ping' }, (response) => {
          if (!chrome.runtime.lastError) {
            clearTimeout(timeout);
            window.removeEventListener('message', messageHandler);
            resolve(true);
          }
        });
      } catch (error) {
        // Extension not installed or error
      }
    }
  });
}

/**
 * Check LinkedIn session via extension
 */
export function checkLinkedInSession() {
  return new Promise((resolve, reject) => {
    const request = {
      source: 'linkedin-helper-pro-web',
      action: 'checkSession'
    };

    const timeout = setTimeout(() => {
      window.removeEventListener('message', messageHandler);
      reject(new Error('Timeout: Extension did not respond'));
    }, MESSAGE_TIMEOUT);

    const messageHandler = (event) => {
      if (event.data && event.data.source === 'linkedin-helper-extension' && event.data.action === 'sessionResponse') {
        clearTimeout(timeout);
        window.removeEventListener('message', messageHandler);
        resolve(event.data.data);
      }
    };

    window.addEventListener('message', messageHandler);
    window.postMessage(request, '*');
  });
}

/**
 * Extract conversations from LinkedIn inbox via extension
 */
export function extractConversations(batchSize = 50) {
  return new Promise((resolve, reject) => {
    const request = {
      source: 'linkedin-helper-pro-web',
      action: 'extractConversations',
      batchSize
    };

    const timeout = setTimeout(() => {
      window.removeEventListener('message', messageHandler);
      reject(new Error('Timeout: Extension did not respond'));
    }, MESSAGE_TIMEOUT * 3); // Longer timeout for extraction

    const messageHandler = (event) => {
      if (event.data && event.data.source === 'linkedin-helper-extension' && event.data.action === 'extractionResponse') {
        clearTimeout(timeout);
        window.removeEventListener('message', messageHandler);
        resolve(event.data.data);
      }
    };

    window.addEventListener('message', messageHandler);
    window.postMessage(request, '*');
  });
}

/**
 * Get logged-in user name from extension
 */
export function getLinkedInUserName() {
  return new Promise((resolve, reject) => {
    const request = {
      source: 'linkedin-helper-pro-web',
      action: 'getUserName'
    };

    const timeout = setTimeout(() => {
      window.removeEventListener('message', messageHandler);
      reject(new Error('Timeout: Extension did not respond'));
    }, MESSAGE_TIMEOUT);

    const messageHandler = (event) => {
      if (event.data && event.data.source === 'linkedin-helper-extension' && event.data.action === 'userNameResponse') {
        clearTimeout(timeout);
        window.removeEventListener('message', messageHandler);
        resolve(event.data.data);
      }
    };

    window.addEventListener('message', messageHandler);
    window.postMessage(request, '*');
  });
}

/**
 * Filter conversations by company name
 */
export function filterByCompany(conversations, companyFilter) {
  if (!companyFilter || companyFilter.trim() === '') {
    return conversations;
  }

  const filterLower = companyFilter.toLowerCase().trim();
  return conversations.filter(conv => {
    const company = (conv.companyName || '').toLowerCase();
    return company.includes(filterLower);
  });
}

/**
 * Filter conversations by keyword in message content
 */
export function filterByKeyword(conversations, keywordFilter) {
  if (!keywordFilter || keywordFilter.trim() === '') {
    return conversations;
  }

  const filterLower = keywordFilter.toLowerCase().trim();
  return conversations.filter(conv => {
    const message = (conv.lastMessage || '').toLowerCase();
    const senderName = (conv.senderFullName || '').toLowerCase();
    return message.includes(filterLower) || senderName.includes(filterLower);
  });
}

/**
 * Apply all filters to conversations
 */
export function applyFilters(conversations, filters) {
  let filtered = [...conversations];

  if (filters.companyName) {
    filtered = filterByCompany(filtered, filters.companyName);
  }

  if (filters.keyword) {
    filtered = filterByKeyword(filtered, filters.keyword);
  }

  return filtered;
}
