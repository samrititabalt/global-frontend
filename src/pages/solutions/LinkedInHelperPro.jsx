import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Linkedin, 
  MessageSquare, 
  Send, 
  CheckCircle, 
  AlertCircle, 
  Loader, 
  User, 
  Clock,
  Eye,
  EyeOff,
  RefreshCw
} from 'lucide-react';
import Header from '../../components/public/Header';
import Footer from '../../components/public/Footer';

const LinkedInHelperPro = () => {
  const [isLinkedInLoggedIn, setIsLinkedInLoggedIn] = useState(false);
  const [checkingLogin, setCheckingLogin] = useState(true);
  const [messages, setMessages] = useState([]);
  const [selectedMessages, setSelectedMessages] = useState(new Set());
  const [replyTemplate, setReplyTemplate] = useState('');
  const [customRecipients, setCustomRecipients] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [previewMessages, setPreviewMessages] = useState([]);
  const [extractionError, setExtractionError] = useState('');
  const iframeRef = useRef(null);

  // Check if user is logged into LinkedIn
  useEffect(() => {
    checkLinkedInLogin();
  }, []);

  const checkLinkedInLogin = async () => {
    setCheckingLogin(true);
    try {
      // Try to access LinkedIn inbox to check if logged in
      // This is a client-side check - we'll try to read from the active session
      const linkedInInboxUrl = 'https://www.linkedin.com/messaging/';
      
      // Check if we can access LinkedIn (this is a simplified check)
      // In a real implementation, you'd need to use LinkedIn's API or check session cookies
      // For now, we'll show a message asking user to ensure they're logged in
      
      // Try to detect if user has LinkedIn session
      // Note: Due to CORS and security, we can't directly check LinkedIn login status
      // User must manually confirm or we check via iframe (with limitations)
      
      // For this implementation, we'll provide a manual check button
      // In production, you'd integrate with LinkedIn API or use browser extension
      setIsLinkedInLoggedIn(false); // Default to false, user must verify
      setCheckingLogin(false);
    } catch (error) {
      console.error('Error checking LinkedIn login:', error);
      setIsLinkedInLoggedIn(false);
      setCheckingLogin(false);
    }
  };

  const handleVerifyLogin = () => {
    // Open LinkedIn in new tab for user to verify
    window.open('https://www.linkedin.com/messaging/', '_blank');
    // After user confirms, they can click "I'm Logged In" button
  };

  const handleConfirmLogin = () => {
    setIsLinkedInLoggedIn(true);
    setCheckingLogin(false);
  };

  const extractMessages = async () => {
    if (!isLinkedInLoggedIn) {
      setExtractionError('Please ensure you are logged into LinkedIn first.');
      return;
    }

    setIsExtracting(true);
    setExtractionError('');

    try {
      // In a real implementation, this would:
      // 1. Use LinkedIn API to fetch messages
      // 2. Or use a browser extension to read from the active session
      // 3. Or use iframe with proper permissions (limited by CORS)
      
      // For this demo, we'll show a message explaining the limitation
      // and provide instructions for the user
      
      // Simulated extraction (replace with actual LinkedIn API call)
      setTimeout(() => {
        // Example extracted messages structure
        const extractedMessages = [
          {
            id: 1,
            senderFullName: 'John Smith',
            senderFirstName: 'John',
            lastMessage: 'Hi, I saw your profile and would like to connect.',
            timestamp: new Date(Date.now() - 86400000).toISOString(),
            conversationId: 'conv_1'
          },
          {
            id: 2,
            senderFullName: 'Sarah Johnson',
            senderFirstName: 'Sarah',
            lastMessage: 'Thanks for connecting! Would love to chat about opportunities.',
            timestamp: new Date(Date.now() - 172800000).toISOString(),
            conversationId: 'conv_2'
          },
          {
            id: 3,
            senderFullName: 'Michael Brown',
            senderFirstName: 'Michael',
            lastMessage: 'Hello, are you available for a quick call this week?',
            timestamp: new Date(Date.now() - 259200000).toISOString(),
            conversationId: 'conv_3'
          }
        ];

        setMessages(extractedMessages);
        setIsExtracting(false);
      }, 2000);

      // In production, replace with:
      // const response = await fetch('/api/linkedin/extract-messages', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ sessionToken: linkedInSessionToken })
      // });
      // const data = await response.json();
      // setMessages(data.messages);

    } catch (error) {
      console.error('Error extracting messages:', error);
      setExtractionError('Failed to extract messages. Please ensure you are logged into LinkedIn and try again.');
      setIsExtracting(false);
    }
  };

  const toggleMessageSelection = (messageId) => {
    const newSelected = new Set(selectedMessages);
    if (newSelected.has(messageId)) {
      newSelected.delete(messageId);
    } else {
      newSelected.add(messageId);
    }
    setSelectedMessages(newSelected);
  };

  const selectAllMessages = () => {
    if (selectedMessages.size === messages.length) {
      setSelectedMessages(new Set());
    } else {
      setSelectedMessages(new Set(messages.map(m => m.id)));
    }
  };

  const generatePreview = () => {
    if (!replyTemplate.trim()) {
      setExtractionError('Please enter a reply template first.');
      return;
    }

    const selected = messages.filter(m => selectedMessages.has(m.id));
    if (selected.length === 0) {
      setExtractionError('Please select at least one conversation to reply to.');
      return;
    }

    const previews = selected.map(msg => {
      let personalizedMessage = replyTemplate
        .replace(/{first_name}/g, msg.senderFirstName)
        .replace(/{full_name}/g, msg.senderFullName);
      
      return {
        ...msg,
        personalizedMessage
      };
    });

    setPreviewMessages(previews);
    setPreviewMode(true);
  };

  const sendBulkReplies = async () => {
    if (previewMessages.length === 0) {
      setExtractionError('Please generate a preview first.');
      return;
    }

    setIsSending(true);
    setExtractionError('');

    try {
      // Smart delay function - randomized delay between replies
      const getRandomDelay = () => {
        // Random delay between 3-8 seconds to mimic human behavior
        return Math.floor(Math.random() * 5000) + 3000;
      };

      // Send messages one by one with delays
      for (let i = 0; i < previewMessages.length; i++) {
        const msg = previewMessages[i];
        
        // In production, this would send via LinkedIn API:
        // await fetch('/api/linkedin/send-message', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({
        //     conversationId: msg.conversationId,
        //     message: msg.personalizedMessage
        //   })
        // });

        // Simulate sending (replace with actual API call)
        console.log(`Sending to ${msg.senderFullName}: ${msg.personalizedMessage}`);

        // Wait before sending next message (except for the last one)
        if (i < previewMessages.length - 1) {
          const delay = getRandomDelay();
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }

      // Success
      alert(`Successfully sent ${previewMessages.length} personalized replies!`);
      setPreviewMode(false);
      setPreviewMessages([]);
      setSelectedMessages(new Set());
      setReplyTemplate('');
      setIsSending(false);

    } catch (error) {
      console.error('Error sending replies:', error);
      setExtractionError('Failed to send some replies. Please try again.');
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 flex items-center gap-3">
            <Linkedin className="text-blue-600" size={40} />
            LinkedIn Helper Pro
          </h1>
          <p className="text-lg text-gray-600">
            Extract inbox messages and send personalized bulk replies
          </p>
        </motion.div>

        {/* LinkedIn Login Check */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Linkedin className="text-blue-600" size={24} />
            LinkedIn Login Status
          </h2>
          
          {checkingLogin ? (
            <div className="flex items-center gap-3 text-gray-600">
              <Loader className="w-5 h-5 animate-spin" />
              <span>Checking LinkedIn login status...</span>
            </div>
          ) : !isLinkedInLoggedIn ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-yellow-900 mb-2">LinkedIn Login Required</h3>
                  <p className="text-yellow-800 text-sm mb-4">
                    Please ensure you are logged into your LinkedIn account in this browser before using this tool.
                    This tool works with your active LinkedIn session and does not handle login or credentials.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={handleVerifyLogin}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      Open LinkedIn
                    </button>
                    <button
                      onClick={handleConfirmLogin}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                    >
                      I'm Logged In
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-green-800 font-medium">LinkedIn session detected. You're ready to proceed.</span>
            </div>
          )}
        </div>

        {/* Error Display */}
        {extractionError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-800 text-sm">{extractionError}</p>
            </div>
            <button
              onClick={() => setExtractionError('')}
              className="text-red-600 hover:text-red-800"
            >
              ×
            </button>
          </div>
        )}

        {/* Message Extraction */}
        {isLinkedInLoggedIn && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <MessageSquare className="text-blue-600" size={24} />
                Inbox Messages
              </h2>
              <button
                onClick={extractMessages}
                disabled={isExtracting}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isExtracting ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Extracting...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    Extract Messages
                  </>
                )}
              </button>
            </div>

            {messages.length > 0 && (
              <div className="mt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-gray-600">
                    {messages.length} message{messages.length !== 1 ? 's' : ''} found
                  </span>
                  <button
                    onClick={selectAllMessages}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    {selectedMessages.size === messages.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedMessages.has(msg.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => toggleMessageSelection(msg.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <User className="w-4 h-4 text-gray-500" />
                            <span className="font-semibold text-gray-900">{msg.senderFullName}</span>
                            {selectedMessages.has(msg.id) && (
                              <CheckCircle className="w-4 h-4 text-blue-600" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{msg.lastMessage}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            <span>{new Date(msg.timestamp).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Reply Template */}
        {isLinkedInLoggedIn && messages.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Send className="text-blue-600" size={24} />
              Reply Template
            </h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Write your reply template (use {'{first_name}'} and {'{full_name}'} for personalization):
              </label>
              <textarea
                value={replyTemplate}
                onChange={(e) => setReplyTemplate(e.target.value)}
                placeholder="Hi {first_name}, thanks for reaching out! I'd love to connect..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows="6"
              />
              <p className="text-xs text-gray-500 mt-2">
                Available placeholders: {'{first_name}'}, {'{full_name}'}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={generatePreview}
                disabled={!replyTemplate.trim() || selectedMessages.size === 0}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {previewMode ? <EyeOff className="w-4 h-4 inline mr-2" /> : <Eye className="w-4 h-4 inline mr-2" />}
                {previewMode ? 'Hide Preview' : 'Preview Messages'}
              </button>
            </div>
          </div>
        )}

        {/* Preview */}
        {previewMode && previewMessages.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Preview Messages</h2>
            <div className="space-y-4 max-h-96 overflow-y-auto mb-4">
              {previewMessages.map((msg, index) => (
                <div key={msg.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="font-semibold text-gray-900">{msg.senderFullName}</span>
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{msg.personalizedMessage}</p>
                </div>
              ))}
            </div>
            <button
              onClick={sendBulkReplies}
              disabled={isSending}
              className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
            >
              {isSending ? (
                <>
                  <Loader className="w-5 h-5 animate-spin inline mr-2" />
                  Sending Messages (with smart delays)...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 inline mr-2" />
                  Send {previewMessages.length} Personalized Reply{previewMessages.length !== 1 ? 'ies' : ''}
                </>
              )}
            </button>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Messages will be sent with randomized delays (3-8 seconds) between each reply to mimic human behavior.
            </p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default LinkedInHelperPro;
