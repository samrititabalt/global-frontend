import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageSquare, RefreshCw, Reply, Sparkles, CheckCircle2 } from 'lucide-react';
import Layout from '../../components/Layout';
import api from '../../utils/axios';

const Inbox = () => {
  const { accountId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [selectedMessages, setSelectedMessages] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [showAiSuggestions, setShowAiSuggestions] = useState(false);
  const [conversationId, setConversationId] = useState(null);

  useEffect(() => {
    loadMessages();
  }, [accountId]);

  const loadMessages = async () => {
    try {
      const response = await api.get(`/linkedin-helper/accounts/${accountId}/inbox`);
      setMessages(response.data.messages);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      await api.post(`/linkedin-helper/accounts/${accountId}/inbox/sync`);
      setTimeout(() => {
        loadMessages();
        setSyncing(false);
      }, 3000);
    } catch (error) {
      console.error('Error syncing:', error);
      setSyncing(false);
    }
  };

  const handleReply = (msg) => {
    setConversationId(msg.conversationId);
    setShowReplyModal(true);
    loadAiSuggestions(msg.conversationId);
  };

  const loadAiSuggestions = async (convId) => {
    try {
      const response = await api.post(`/linkedin-helper/accounts/${accountId}/messages/ai-suggestions`, {
        conversationId: convId
      });
      setAiSuggestions(response.data.suggestions || []);
    } catch (error) {
      console.error('Error loading AI suggestions:', error);
    }
  };

  const sendReply = async () => {
    if (!replyText.trim()) return;

    try {
      await api.post(`/linkedin-helper/accounts/${accountId}/messages/reply`, {
        conversationId,
        messageText: replyText
      });
      setShowReplyModal(false);
      setReplyText('');
      loadMessages();
    } catch (error) {
      console.error('Error sending reply:', error);
    }
  };

  const sendBulkReply = async () => {
    if (selectedMessages.size === 0 || !replyText.trim()) return;

    try {
      const conversationIds = Array.from(selectedMessages);
      await api.post(`/linkedin-helper/accounts/${accountId}/messages/bulk-reply`, {
        conversationIds,
        messageTemplate: replyText
      });
      setSelectedMessages(new Set());
      setShowReplyModal(false);
      setReplyText('');
      loadMessages();
    } catch (error) {
      console.error('Error sending bulk reply:', error);
    }
  };

  const groupedMessages = messages.reduce((acc, msg) => {
    if (!acc[msg.conversationId]) {
      acc[msg.conversationId] = [];
    }
    acc[msg.conversationId].push(msg);
    return acc;
  }, {});

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Inbox</h1>
            <p className="text-gray-600">{messages.length} conversations</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleSync}
              disabled={syncing}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-5 w-5 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Syncing...' : 'Sync Inbox'}
            </button>
            {selectedMessages.size > 0 && (
              <button
                onClick={() => {
                  setConversationId(null);
                  setShowReplyModal(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
              >
                <Reply className="h-5 w-5" />
                Bulk Reply ({selectedMessages.size})
              </button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          {Object.keys(groupedMessages).length === 0 ? (
            <div className="px-6 py-12 text-center">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No messages found</p>
              <button
                onClick={handleSync}
                className="mt-4 text-blue-600 hover:text-blue-700 font-semibold"
              >
                Sync inbox to load messages
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {Object.entries(groupedMessages).map(([convId, convMessages]) => {
                const latest = convMessages[convMessages.length - 1];
                const isSelected = selectedMessages.has(convId);
                const unreadCount = convMessages.filter(m => !m.isRead).length;

                return (
                  <div
                    key={convId}
                    className={`px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                      isSelected ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => {
                      const newSelected = new Set(selectedMessages);
                      if (isSelected) {
                        newSelected.delete(convId);
                      } else {
                        newSelected.add(convId);
                      }
                      setSelectedMessages(newSelected);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            e.stopPropagation();
                            const newSelected = new Set(selectedMessages);
                            if (e.target.checked) {
                              newSelected.add(convId);
                            } else {
                              newSelected.delete(convId);
                            }
                            setSelectedMessages(newSelected);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="h-5 w-5"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900">{latest.senderName}</h3>
                            {unreadCount > 0 && (
                              <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                                {unreadCount}
                              </span>
                            )}
                            {latest.isReplied && (
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                            {latest.messageText}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(latest.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReply(latest);
                        }}
                        className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        Reply
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Reply Modal */}
        {showReplyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4"
            >
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">
                    {conversationId ? 'Reply to Message' : `Bulk Reply (${selectedMessages.size} conversations)`}
                  </h2>
                  <button
                    onClick={() => {
                      setShowReplyModal(false);
                      setReplyText('');
                      setAiSuggestions([]);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="px-6 py-4">
                {conversationId && (
                  <div className="mb-4">
                    <button
                      onClick={() => setShowAiSuggestions(!showAiSuggestions)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg font-semibold hover:bg-purple-200 transition-colors"
                    >
                      <Sparkles className="h-5 w-5" />
                      {showAiSuggestions ? 'Hide' : 'Show'} AI Suggestions
                    </button>
                    {showAiSuggestions && aiSuggestions.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {aiSuggestions.map((suggestion, idx) => (
                          <div
                            key={idx}
                            onClick={() => setReplyText(suggestion)}
                            className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                          >
                            <p className="text-sm text-gray-700">{suggestion}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your message..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[150px]"
                  rows={6}
                />

                <div className="mt-4 flex items-center gap-4">
                  <button
                    onClick={conversationId ? sendReply : sendBulkReply}
                    disabled={!replyText.trim()}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {conversationId ? 'Send Reply' : `Send to ${selectedMessages.size} Conversations`}
                  </button>
                  <button
                    onClick={() => {
                      setShowReplyModal(false);
                      setReplyText('');
                    }}
                    className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Inbox;

