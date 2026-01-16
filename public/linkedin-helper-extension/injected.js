// Injected script that runs in page context (not isolated)

(function() {
  'use strict';

  // Create connection to content script
  const extensionId = chrome?.runtime?.id || window.location.hostname;
  
  // Listen for messages from content script
  window.addEventListener('message', (event) => {
    if (event.source !== window || !event.data.fromContentScript) return;

    const { action, data } = event.data;

    if (action === 'connected') {
      console.log('LinkedIn Helper: Connected to backend');
      showNotification('LinkedIn Helper connected', 'success');
    }

    if (action === 'inboxSynced') {
      console.log('LinkedIn Helper: Inbox synced', data);
      showNotification(`Synced ${data.conversations.length} conversations`, 'success');
    }

    if (action === 'messageSent') {
      if (data.success) {
        showNotification('Message sent successfully', 'success');
      } else {
        showNotification('Failed to send message', 'error');
      }
    }

    if (action === 'connectionSent') {
      if (data.success) {
        showNotification('Connection request sent', 'success');
      } else {
        showNotification('Failed to send connection', 'error');
      }
    }
  });

  // Request auth token
  window.postMessage({
    fromExtension: true,
    action: 'getAuthToken'
  }, '*');

  // Helper function to show notifications
  function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      max-width: 300px;
      animation: slideIn 0.3s ease-out;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  // Add CSS for animations
  if (!document.getElementById('linkedin-helper-styles')) {
    const style = document.createElement('style');
    style.id = 'linkedin-helper-styles';
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @keyframes slideOut {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(100%);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }

  console.log('LinkedIn Helper: Injected script loaded');
})();

