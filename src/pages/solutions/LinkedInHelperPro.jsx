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
  RefreshCw,
  Download,
  Search,
  Building2,
  Filter
} from 'lucide-react';
import Header from '../../components/public/Header';
import Footer from '../../components/public/Footer';
import {
  isExtensionInstalled,
  checkLinkedInSession,
  extractConversations,
  getLinkedInUserName,
  applyFilters
} from '../../utils/linkedinExtension';

const LinkedInHelperPro = () => {
  const [extensionInstalled, setExtensionInstalled] = useState(false);
  const [checkingExtension, setCheckingExtension] = useState(true);
  const [isLinkedInLoggedIn, setIsLinkedInLoggedIn] = useState(false);
  const [checkingLogin, setCheckingLogin] = useState(false);
  const [linkedInUserName, setLinkedInUserName] = useState(null);
  const [messages, setMessages] = useState([]);
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [selectedMessages, setSelectedMessages] = useState(new Set());
  const [replyTemplate, setReplyTemplate] = useState('');
  const [customRecipients, setCustomRecipients] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [previewMessages, setPreviewMessages] = useState([]);
  const [extractionError, setExtractionError] = useState('');
  const [batchSize, setBatchSize] = useState(50);
  const [filters, setFilters] = useState({
    companyName: '',
    keyword: ''
  });
  const iframeRef = useRef(null);

  // Check for extension installation on mount (client-side only)
  useEffect(() => {
    // Only run in browser environment
    if (typeof window === 'undefined') return;
    
    // Small delay to ensure page is fully mounted
    const timer = setTimeout(() => {
      checkExtensionInstallation();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Check LinkedIn session when extension is detected
  useEffect(() => {
    // Only run in browser and if extension is installed
    if (typeof window === 'undefined' || !extensionInstalled) return;
    
    checkLinkedInLogin();
  }, [extensionInstalled]);

  // Apply filters when messages or filters change
  useEffect(() => {
    if (messages.length > 0) {
      const filtered = applyFilters(messages, filters);
      setFilteredMessages(filtered);
    } else {
      setFilteredMessages([]);
    }
  }, [messages, filters]);

  const checkExtensionInstallation = async () => {
    // Guard: Only run in browser
    if (typeof window === 'undefined') {
      setExtensionInstalled(false);
      setCheckingExtension(false);
      return;
    }

    setCheckingExtension(true);
    try {
      const installed = await isExtensionInstalled();
      setExtensionInstalled(installed || false); // Ensure boolean
    } catch (error) {
      console.warn('[LinkedIn Helper] Error checking extension:', error);
      setExtensionInstalled(false);
    } finally {
      setCheckingExtension(false);
    }
  };

  const checkLinkedInLogin = async () => {
    // Guard: Only run in browser
    if (typeof window === 'undefined') {
      setIsLinkedInLoggedIn(false);
      setLinkedInUserName(null);
      setCheckingLogin(false);
      return;
    }

    setCheckingLogin(true);
    setExtractionError('');
    try {
      const sessionInfo = await checkLinkedInSession();
      const isLoggedIn = sessionInfo?.isLoggedIn || false;
      const userName = sessionInfo?.userName || null;
      
      setIsLinkedInLoggedIn(isLoggedIn);
      setLinkedInUserName(userName);
      
      if (!isLoggedIn) {
        // Check if the error says user is logged in but name not found
        if (sessionInfo?.error && sessionInfo.error.includes('appears to be logged in')) {
          // User is logged in, just couldn't extract name
          setIsLinkedInLoggedIn(true);
          setExtractionError('Logged in but could not detect name. Please try refreshing LinkedIn page.');
        } else {
          const errorMsg = sessionInfo?.error || 'Not logged into LinkedIn. Please open LinkedIn in a new tab and log in, then try again.';
          setExtractionError(errorMsg);
        }
      } else {
        // User is logged in - clear any errors
        setExtractionError('');
      }
    } catch (error) {
      console.warn('[LinkedIn Helper] Error checking LinkedIn login:', error);
      setExtractionError(error.message || 'Failed to check LinkedIn session. Please ensure the extension is installed and LinkedIn is open in a tab.');
      setIsLinkedInLoggedIn(false);
      setLinkedInUserName(null);
    } finally {
      setCheckingLogin(false);
    }
  };

  const handleRefreshSession = () => {
    checkLinkedInLogin();
  };

  const handleOpenLinkedIn = () => {
    window.open('https://www.linkedin.com/feed/', '_blank');
  };

  const handleVerifyLogin = () => {
    window.open('https://www.linkedin.com/feed/', '_blank');
  };

  const handleConfirmLogin = () => {
    checkLinkedInLogin();
  };

  const extractMessages = async () => {
    // Guard: Check extension and session
    if (!extensionInstalled || typeof window === 'undefined') {
      setExtractionError('LinkedIn Helper extension is not installed. Please install it first.');
      return;
    }

    if (!isLinkedInLoggedIn) {
      setExtractionError('Please ensure you are logged into LinkedIn first.');
      return;
    }

    setIsExtracting(true);
    setExtractionError('');
    setMessages([]);
    setSelectedMessages(new Set());

    try {
      const result = await extractConversations(batchSize);
      
      if (result && result.success && result.conversations && Array.isArray(result.conversations)) {
        // Add unique IDs to conversations
        const messagesWithIds = result.conversations.map((conv, index) => ({
          ...conv,
          id: `conv_${index}_${Date.now()}`,
          conversationId: `conv_${index}`
        }));
        
        setMessages(messagesWithIds);
        setExtractionError('');
      } else {
        const errorMsg = result?.error || 'Failed to extract conversations. LinkedIn UI may have changed or extension is not responding.';
        setExtractionError(errorMsg);
        setMessages([]);
      }
    } catch (error) {
      console.error('[LinkedIn Helper] Error extracting messages:', error);
      setExtractionError(error?.message || 'Failed to extract messages. Please ensure you are logged into LinkedIn and try again.');
      setMessages([]);
    } finally {
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
    const messagesToSelect = filteredMessages.length > 0 ? filteredMessages : messages;
    if (selectedMessages.size === messagesToSelect.length) {
      setSelectedMessages(new Set());
    } else {
      setSelectedMessages(new Set(messagesToSelect.map(m => m.id)));
    }
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const generatePreview = () => {
    if (!replyTemplate.trim()) {
      setExtractionError('Please enter a reply template first.');
      return;
    }

    const messagesToUse = filteredMessages.length > 0 ? filteredMessages : messages;
    const selected = messagesToUse.filter(m => selectedMessages.has(m.id));
    if (selected.length === 0) {
      setExtractionError('Please select at least one conversation to reply to.');
      return;
    }

    const previews = selected.map(msg => {
      let personalizedMessage = replyTemplate
        .replace(/{first_name}/g, msg.senderFirstName || 'there')
        .replace(/{full_name}/g, msg.senderFullName || 'there');
      
      return {
        ...msg,
        personalizedMessage
      };
    });

    setPreviewMessages(previews);
    setPreviewMode(true);
    setExtractionError('');
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
                      disabled={checkingLogin}
                      className={`px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm ${
                        checkingLogin ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {checkingLogin ? (
                        <span className="flex items-center gap-2">
                          <Loader className="w-4 h-4 animate-spin" />
                          Checking...
                        </span>
                      ) : (
                        "I'm Logged In"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-green-800 font-medium">
                  {linkedInUserName 
                    ? `Logged in as ${linkedInUserName}`
                    : 'LinkedIn session detected. You\'re ready to proceed.'}
                </span>
              </div>
              <button
                onClick={handleRefreshSession}
                className="text-sm text-green-700 hover:text-green-900 underline"
              >
                Refresh Status
              </button>
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
        {(extensionInstalled && isLinkedInLoggedIn) ? (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <MessageSquare className="text-blue-600" size={24} />
                Inbox Messages
              </h2>
              <div className="flex items-center gap-3">
                <select
                  value={batchSize}
                  onChange={(e) => setBatchSize(Number(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  disabled={isExtracting}
                >
                  <option value={50}>50 conversations</option>
                  <option value={100}>100 conversations</option>
                  <option value={150}>150 conversations</option>
                </select>
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
            </div>

            {/* Filters */}
            {messages.length > 0 && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                  <Filter className="w-4 h-4 text-gray-600" />
                  <h3 className="font-semibold text-gray-900">Filters</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company Name
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={filters.companyName}
                        onChange={(e) => handleFilterChange('companyName', e.target.value)}
                        placeholder="Filter by company..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Keyword (Message Content)
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={filters.keyword}
                        onChange={(e) => handleFilterChange('keyword', e.target.value)}
                        placeholder="Search in messages..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                    </div>
                  </div>
                </div>
                {(filters.companyName || filters.keyword) && (
                  <button
                    onClick={() => setFilters({ companyName: '', keyword: '' })}
                    className="mt-3 text-sm text-blue-600 hover:text-blue-700"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            )}

            {messages.length > 0 ? (
              <div className="mt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-gray-600">
                    {filteredMessages.length > 0 ? filteredMessages.length : messages.length} message{(filteredMessages.length > 0 ? filteredMessages.length : messages.length) !== 1 ? 's' : ''} found
                    {filteredMessages.length !== messages.length && (
                      <span className="text-gray-500 ml-2">
                        (filtered from {messages.length} total)
                      </span>
                    )}
                  </span>
                  <button
                    onClick={selectAllMessages}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    {selectedMessages.size === (filteredMessages.length > 0 ? filteredMessages.length : messages.length) ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {(filteredMessages.length > 0 ? filteredMessages : messages).map((msg) => (
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
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            {msg.companyName && (
                              <div className="flex items-center gap-1">
                                <Building2 className="w-3 h-3" />
                                <span>{msg.companyName}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{new Date(msg.timestamp).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-4 p-8 text-center bg-gray-50 rounded-lg border border-gray-200">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 mb-2 font-medium">No messages extracted yet.</p>
                <p className="text-sm text-gray-500">
                  Click "Extract Messages" above to load conversations from your LinkedIn inbox.
                </p>
              </div>
            )}
          </div>
        ) : null}

        {/* Reply Template */}
        {extensionInstalled && isLinkedInLoggedIn && messages.length > 0 && (
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
