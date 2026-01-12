/**
 * LinkedIn Helper Extension Communication Utility
 * 
 * Handles communication between LinkedIn Helper Pro web app and Chrome extension
 * All functions are safe to call even when extension is not installed
 */

// Safe browser detection
const isBrowser = typeof window !== 'undefined';

// Extension ID (will be actual extension ID when published)
const EXTENSION_ID = 'linkedin-helper-pro';
const MESSAGE_TIMEOUT = 10000; // 10 seconds

/**
 * Check if we're in a browser environment
 */
export function checkIsBrowser() {
  return isBrowser;
}

/**
 * Check if the extension is installed
 * Returns false if not in browser or extension not found
 */
export function isExtensionInstalled() {
  if (!isBrowser) {
    return Promise.resolve(false);
  }

  return new Promise((resolve) => {
    try {
      // Try to communicate with extension via postMessage
      const checkMessage = {
        source: 'linkedin-helper-pro-web',
        action: 'ping'
      };

      const timeout = setTimeout(() => {
        if (window) {
          window.removeEventListener('message', messageHandler);
        }
        resolve(false);
      }, 1000);

      const messageHandler = (event) => {
        if (event.data && event.data.source === 'linkedin-helper-extension' && event.data.action === 'pong') {
          clearTimeout(timeout);
          if (window) {
            window.removeEventListener('message', messageHandler);
          }
          resolve(true);
        }
      };

      if (window) {
        window.addEventListener('message', messageHandler);
        window.postMessage(checkMessage, '*');
      } else {
        resolve(false);
      }

      // Also try Chrome runtime messaging (if available)
      if (isBrowser && typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
        try {
          chrome.runtime.sendMessage(EXTENSION_ID, { action: 'ping' }, (response) => {
            if (chrome.runtime && !chrome.runtime.lastError) {
              clearTimeout(timeout);
              if (window) {
                window.removeEventListener('message', messageHandler);
              }
              resolve(true);
            }
          });
        } catch (error) {
          // Extension not installed or error - continue with postMessage check
        }
      }
    } catch (error) {
      console.warn('[LinkedIn Helper] Error checking extension:', error);
      resolve(false);
    }
  });
}

/**
 * Check LinkedIn session via extension
 * Returns false if extension not available
 */
export function checkLinkedInSession() {
  if (!isBrowser) {
    return Promise.resolve({ isLoggedIn: false, userName: null, error: 'Not in browser environment' });
  }

  return new Promise((resolve, reject) => {
    try {
      const request = {
        source: 'linkedin-helper-pro-web',
        action: 'checkSession'
      };

      const timeout = setTimeout(() => {
        if (window) {
          window.removeEventListener('message', messageHandler);
        }
        reject(new Error('Timeout: Extension did not respond. Please ensure the extension is installed.'));
      }, MESSAGE_TIMEOUT);

      const messageHandler = (event) => {
        if (event.data && event.data.source === 'linkedin-helper-extension' && event.data.action === 'sessionResponse') {
          clearTimeout(timeout);
          if (window) {
            window.removeEventListener('message', messageHandler);
          }
          resolve(event.data.data || { isLoggedIn: false, userName: null });
        }
      };

      if (window) {
        window.addEventListener('message', messageHandler);
        window.postMessage(request, '*');
      } else {
        reject(new Error('Window object not available'));
      }
    } catch (error) {
      reject(new Error(`Failed to check session: ${error.message}`));
    }
  });
}

/**
 * Extract conversations from LinkedIn inbox via extension
 * Returns error if extension not available
 */
export function extractConversations(batchSize = 50) {
  if (!isBrowser) {
    return Promise.resolve({ success: false, error: 'Not in browser environment' });
  }

  return new Promise((resolve, reject) => {
    try {
      const request = {
        source: 'linkedin-helper-pro-web',
        action: 'extractConversations',
        batchSize
      };

      const timeout = setTimeout(() => {
        if (window) {
          window.removeEventListener('message', messageHandler);
        }
        reject(new Error('Timeout: Extension did not respond. Please ensure the extension is installed and you are logged into LinkedIn.'));
      }, MESSAGE_TIMEOUT * 3); // Longer timeout for extraction

      const messageHandler = (event) => {
        if (event.data && event.data.source === 'linkedin-helper-extension' && event.data.action === 'extractionResponse') {
          clearTimeout(timeout);
          if (window) {
            window.removeEventListener('message', messageHandler);
          }
          resolve(event.data.data || { success: false, error: 'No data received' });
        }
      };

      if (window) {
        window.addEventListener('message', messageHandler);
        window.postMessage(request, '*');
      } else {
        reject(new Error('Window object not available'));
      }
    } catch (error) {
      reject(new Error(`Failed to extract conversations: ${error.message}`));
    }
  });
}

/**
 * Get logged-in user name from extension
 * Returns null if extension not available
 */
export function getLinkedInUserName() {
  if (!isBrowser) {
    return Promise.resolve({ success: false, userName: null, error: 'Not in browser environment' });
  }

  return new Promise((resolve, reject) => {
    try {
      const request = {
        source: 'linkedin-helper-pro-web',
        action: 'getUserName'
      };

      const timeout = setTimeout(() => {
        if (window) {
          window.removeEventListener('message', messageHandler);
        }
        resolve({ success: false, userName: null, error: 'Timeout: Extension did not respond' });
      }, MESSAGE_TIMEOUT);

      const messageHandler = (event) => {
        if (event.data && event.data.source === 'linkedin-helper-extension' && event.data.action === 'userNameResponse') {
          clearTimeout(timeout);
          if (window) {
            window.removeEventListener('message', messageHandler);
          }
          resolve(event.data.data || { success: false, userName: null });
        }
      };

      if (window) {
        window.addEventListener('message', messageHandler);
        window.postMessage(request, '*');
      } else {
        resolve({ success: false, userName: null, error: 'Window object not available' });
      }
    } catch (error) {
      resolve({ success: false, userName: null, error: error.message });
    }
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
