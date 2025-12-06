import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Paperclip,
  Mic,
  Phone,
  Video,
  FileText,
  X,
  Check,
  CheckCheck,
  PhoneOff,
  Edit,
  Trash2,
  MoreVertical,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../utils/axios';
import { chatAPI } from '../../services/api';
import { useWebRTC } from '../../hooks/useWebRTC';

/**
 * ChatInterface
 *
 * - Uses HTTP to load initial messages
 * - Uses Socket.io for REAL-TIME:
 *   - joinChat (rooms)
 *   - sendMessage (text)
 *   - newMessage (broadcast)
 *   - typing (with isTyping flag)
 *   - messageRead
 *   - agentOnline / agentOffline
 *
 * Attachments UI is present, but real-time send is focused on text messages for now.
 */

const ChatInterface = ({ chatSession, currentUser, socket }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [otherUserOnline, setOtherUserOnline] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [openMenuMessageId, setOpenMenuMessageId] = useState(null);
  const messagesEndRef = useRef(null);
  const menuRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const audioInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chatContainerRef = useRef(null);
  const audioRef = useRef(null);
  const editInputRef = useRef(null);

  // WebRTC for voice calls
  const {
    isCallActive,
    isCallIncoming,
    isCallOutgoing,
    callStatus,
    remoteStream,
    localStream,
    startCall,
    acceptCall,
    rejectCall,
    endCall,
  } = useWebRTC(socket, chatSession?._id, currentUser?._id || currentUser?.id);

  useEffect(() => {
    // Load existing messages via REST
    loadMessages();
  }, [chatSession?._id]);

  // Calculate otherUser outside useEffect
  const otherUser = chatSession?.customer?._id?.toString() === currentUser?._id?.toString()
    ? chatSession?.agent
    : chatSession?.customer;

  useEffect(() => {
    if (!socket || !chatSession?._id || !currentUser?._id) return;

    // Join chat room - this also triggers AI greeting on first join (backend)
    socket.emit('joinChat', chatSession._id);

    const handleNewMessage = message => {
      if (!message || !chatSession?._id) return;
      const messageChatId = message.chatSession?.toString?.() || message.chatSession?._id?.toString?.();
      if (messageChatId !== chatSession._id.toString()) return;
      // Check if message already exists to avoid duplicates
      setMessages(prev => {
        const exists = prev.some(msg => msg._id === message._id);
        if (exists) return prev;
        return [...prev, message];
      });
    };

    const handleError = (error) => {
      console.error('Socket error:', error);
      alert(error.message || 'An error occurred');
    };

    const handleTypingEvent = data => {
      if (data.chatSessionId !== chatSession._id) return;
      const dataUserId = data.userId?.toString();
      const currentUserId = currentUser._id?.toString() || currentUser.id?.toString();
      if (dataUserId === currentUserId) return;
      setIsTyping(!!data.isTyping);
      setTypingUser(data.userName || 'User');
    };

    const handleMessageReadEvent = data => {
      setMessages(prev =>
        prev.map(msg =>
          msg._id === data.messageId ? { ...msg, isRead: true, readAt: data.readAt } : msg
        )
      );
    };

    const handleAgentOnline = data => {
      const agentId = data.agentId?.toString();
      const otherUserId = otherUser?._id?.toString();
      if (agentId && otherUserId && agentId === otherUserId) {
        setOtherUserOnline(true);
      }
    };

    const handleAgentOffline = data => {
      const agentId = data.agentId?.toString();
      const otherUserId = otherUser?._id?.toString();
      if (agentId && otherUserId && agentId === otherUserId) {
        setOtherUserOnline(false);
      }
    };

    const handleMessageEdited = (editedMessage) => {
      if (!editedMessage || !chatSession?._id) return;
      const messageChatId = editedMessage.chatSession?.toString?.() || editedMessage.chatSession?._id?.toString?.();
      if (messageChatId !== chatSession._id.toString()) return;
      
      setMessages(prev =>
        prev.map(msg =>
          msg._id === editedMessage._id ? editedMessage : msg
        )
      );
    };

    const handleMessageDeleted = (deletedMessage) => {
      if (!deletedMessage || !chatSession?._id) return;
      const messageChatId = deletedMessage.chatSession?.toString?.() || deletedMessage.chatSession?._id?.toString?.();
      if (messageChatId !== chatSession._id.toString()) return;
      
      setMessages(prev =>
        prev.map(msg =>
          msg._id === deletedMessage._id ? deletedMessage : msg
        )
      );
    };

    socket.on('newMessage', handleNewMessage);
    socket.on('typing', handleTypingEvent);
    socket.on('messageRead', handleMessageReadEvent);
    socket.on('agentOnline', handleAgentOnline);
    socket.on('agentOffline', handleAgentOffline);
    socket.on('messageEdited', handleMessageEdited);
    socket.on('messageDeleted', handleMessageDeleted);
    socket.on('error', handleError);
    socket.on('tokenBalanceUpdate', (data) => {
      // Update token balance if needed
      console.log('Token balance updated:', data);
    });

    return () => {
      socket.off('newMessage', handleNewMessage);
      socket.off('typing', handleTypingEvent);
      socket.off('messageRead', handleMessageReadEvent);
      socket.off('agentOnline', handleAgentOnline);
      socket.off('agentOffline', handleAgentOffline);
      socket.off('messageEdited', handleMessageEdited);
      socket.off('messageDeleted', handleMessageDeleted);
      socket.off('error', handleError);
      socket.emit('leaveChat', chatSession._id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, chatSession?._id, currentUser?._id, otherUser?._id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const loadMessages = async () => {
    if (!chatSession?._id || !currentUser) return;
    try {
      // Use appropriate API based on user role
      const endpoint = currentUser.role === 'customer' 
        ? `/customer/chat-session/${chatSession._id}`
        : `/agent/chat-session/${chatSession._id}`;
      const response = await api.get(endpoint);
      setMessages(response.data.messages || []);
    } catch (error) {
      console.error('Error loading messages:', error);
      // Try alternative endpoint if first fails
      try {
        const response = await api.get(`/chat/sessions/${chatSession._id}/messages`);
        setMessages(response.data.messages || []);
      } catch (err) {
        console.error('Error loading messages from alternative endpoint:', err);
      }
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async e => {
    e.preventDefault();
    if (!inputMessage.trim() && attachments.length === 0) return;
    if (!socket || !chatSession?._id) {
      alert('Socket not connected. Please refresh the page.');
      return;
    }

    try {
      // Send attachments first if any
      if (attachments.length > 0) {
        setIsUploading(true);
        for (const attachment of attachments) {
          const formData = new FormData();
          formData.append('chatSessionId', chatSession._id);
          if (inputMessage.trim()) {
            formData.append('content', inputMessage.trim());
          }

          // Append file based on type
          if (attachment.type === 'image') {
            formData.append('image', attachment.file);
          } else if (attachment.type === 'audio') {
            formData.append('audio', attachment.file);
          } else {
            formData.append('file', attachment.file);
          }

          try {
            const response = await chatAPI.uploadFile(formData);
            if (response.data.success && response.data.message) {
              // Message will be added via socket event
              setMessages(prev => {
                const exists = prev.some(msg => msg._id === response.data.message._id);
                if (exists) return prev;
                return [...prev, response.data.message];
              });
            }
          } catch (error) {
            console.error('Error uploading file:', error);
            alert(error.response?.data?.message || 'Failed to upload file');
          }
        }
        setAttachments([]);
        setIsUploading(false);
      }

      // Send TEXT via Socket.io for real-time
      if (inputMessage.trim() && attachments.length === 0) {
        socket.emit('sendMessage', {
          chatSessionId: chatSession._id,
          content: inputMessage.trim(),
          messageType: 'text',
        });
        setInputMessage('');
        
        // Stop typing state
        socket.emit('typing', {
          chatSessionId: chatSession._id,
          isTyping: false,
          userId: currentUser._id || currentUser.id,
          userName: currentUser.name,
        });
      } else if (inputMessage.trim() && attachments.length > 0) {
        // Clear input after attachments are sent
        setInputMessage('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
      setIsUploading(false);
    }
  };

  const handleTypingStart = () => {
    if (!socket || !chatSession?._id || !currentUser) return;
    socket.emit('typing', {
      chatSessionId: chatSession._id,
      isTyping: true,
      userId: currentUser._id || currentUser.id,
      userName: currentUser.name,
    });
  };

  const handleFileSelect = (e, type = 'file') => {
    const files = Array.from(e.target.files);
    const newAttachments = files.map(file => ({
      file,
      type: type === 'image' ? 'image' : 
            type === 'audio' ? 'audio' : 'file',
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : 
               file.type.startsWith('audio/') ? URL.createObjectURL(file) : null,
    }));
    setAttachments(prev => [...prev, ...newAttachments]);
    // Reset input
    e.target.value = '';
  };

  const removeAttachment = (index) => {
    setAttachments(prev => {
      const newAttachments = [...prev];
      if (newAttachments[index].preview) {
        URL.revokeObjectURL(newAttachments[index].preview);
      }
      newAttachments.splice(index, 1);
      return newAttachments;
    });
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const audioFile = new File([blob], `voice-${Date.now()}.webm`, { type: 'audio/webm' });
        setAttachments(prev => [...prev, {
          file: audioFile,
          type: 'audio',
          preview: URL.createObjectURL(blob),
        }]);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Microphone access denied');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const formatTime = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (d.toDateString() === now.toDateString()) {
      return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    }
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleEditMessage = (message) => {
    setEditingMessageId(message._id);
    setEditContent(message.content || '');
    setOpenMenuMessageId(null); // Close menu when starting to edit
    setTimeout(() => {
      editInputRef.current?.focus();
    }, 100);
  };

  const handleSaveEdit = async (messageId) => {
    if (!editContent.trim()) {
      setEditingMessageId(null);
      return;
    }

    try {
      const response = await chatAPI.editMessage(messageId, {
        content: editContent.trim(),
      });

      if (response.data.success) {
        setMessages(prev =>
          prev.map(msg =>
            msg._id === messageId ? response.data.message : msg
          )
        );
        setEditingMessageId(null);
        setEditContent('');
      }
    } catch (error) {
      console.error('Error editing message:', error);
      alert(error.response?.data?.message || 'Failed to edit message');
    }
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditContent('');
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('Are you sure you want to delete this message?')) {
      return;
    }

    try {
      const response = await chatAPI.deleteMessage(messageId);

      if (response.data.success) {
        setMessages(prev =>
          prev.map(msg =>
            msg._id === messageId ? response.data.message : msg
          )
        );
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      alert(error.response?.data?.message || 'Failed to delete message');
    }
  };

  useEffect(() => {
    // Initial online state from chatSession if present (fallback false)
    if (otherUser && typeof otherUser.isOnline === 'boolean') {
      setOtherUserOnline(otherUser.isOnline);
    } else if (otherUser && otherUser.role === 'agent') {
      // For agents, check online status
      setOtherUserOnline(otherUser.isOnline || false);
    }
  }, [otherUser]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuMessageId(null);
      }
    };

    if (openMenuMessageId) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openMenuMessageId]);

  const toggleMessageMenu = (messageId) => {
    if (openMenuMessageId === messageId) {
      setOpenMenuMessageId(null);
    } else {
      setOpenMenuMessageId(messageId);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
              {otherUser?.name?.charAt(0) || 'U'}
            </div>
            {otherUserOnline && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{otherUser?.name || 'User'}</h3>
            <p className="text-sm text-gray-500">
              {otherUserOnline ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {!isCallActive ? (
            <button
              onClick={startCall}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Start voice call"
            >
              <Phone className="w-5 h-5 text-gray-600" />
            </button>
          ) : (
            <button
              onClick={endCall}
              className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              title="End call"
            >
              <PhoneOff className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Messages Container */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto px-6 py-4 space-y-4"
        style={{ scrollBehavior: 'smooth' }}
      >
        {messages.map((message, index) => {
          const senderId =
            typeof message.sender === 'object' ? message.sender._id : message.sender;
          const isOwn = senderId?.toString() === currentUser?._id?.toString();
          const showAvatar = index === 0 || messages[index - 1].sender !== message.sender;
          const showTime = index === messages.length - 1 || 
            new Date(messages[index + 1].createdAt) - new Date(message.createdAt) > 300000;

          return (
            <motion.div
              key={message._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${isOwn ? 'justify-end' : 'justify-start'} ${showAvatar ? 'mt-4' : 'mt-1'}`}
            >
              <div className={`flex items-end space-x-2 max-w-[70%] ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
                {!isOwn && showAvatar && (
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                    {otherUser?.name?.charAt(0) || 'U'}
                  </div>
                )}
                <div 
                  className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} relative group`}
                >
                  {/* 3 Dots Menu Button - Always visible for own messages */}
                  {isOwn && !message.isDeleted && editingMessageId !== message._id && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleMessageMenu(message._id);
                      }}
                      className={`absolute ${isOwn ? 'right-full mr-1' : 'left-full ml-1'} top-1/2 -translate-y-1/2 p-1.5 hover:bg-gray-100 rounded-full transition-colors z-10 ${
                        openMenuMessageId === message._id ? 'bg-gray-100' : 'opacity-0 group-hover:opacity-100'
                      }`}
                      title="More options"
                    >
                      <MoreVertical className="w-4 h-4 text-gray-500" />
                    </button>
                  )}

                  {/* Edit/Delete Menu */}
                  <AnimatePresence>
                    {isOwn && !message.isDeleted && openMenuMessageId === message._id && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: 0.15 }}
                        ref={menuRef}
                        className={`absolute ${isOwn ? 'right-full mr-2' : 'left-full ml-2'} top-0 flex flex-col bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-30 min-w-[140px]`}
                      >
                        {/* Only show edit for text messages */}
                        {message.messageType === 'text' && !message.attachments?.length && !message.fileUrl && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditMessage(message);
                            }}
                            className="px-4 py-2.5 text-left hover:bg-gray-50 transition-colors flex items-center space-x-3 text-sm text-gray-700 w-full"
                          >
                            <Edit className="w-4 h-4" />
                            <span>Edit</span>
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteMessage(message._id);
                            setOpenMenuMessageId(null);
                          }}
                          className="px-4 py-2.5 text-left hover:bg-gray-50 transition-colors flex items-center space-x-3 text-sm text-red-600 w-full"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Delete</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div
                    className={`rounded-2xl px-4 py-2 ${
                      message.isDeleted
                        ? 'bg-gray-200 text-gray-500 italic'
                        : isOwn
                        ? 'bg-blue-500 text-white rounded-br-sm'
                        : 'bg-white text-gray-900 rounded-bl-sm border border-gray-200'
                    }`}
                  >
                    {/* Show attachments only if message is not deleted */}
                    {!message.isDeleted && ((message.attachments && message.attachments.length > 0) || message.fileUrl) ? (
                      <div className="space-y-2 mb-2">
                        {message.attachments && message.attachments.map((att, idx) => (
                          <div key={idx}>
                            {att.type === 'image' && (
                              <img
                                src={att.url}
                                alt={att.fileName || 'Attachment'}
                                className="max-w-xs rounded-lg cursor-pointer"
                                onClick={() => window.open(att.url, '_blank')}
                              />
                            )}
                            {att.type === 'audio' && (
                              <audio controls className="w-full">
                                <source src={att.url} />
                              </audio>
                            )}
                            {att.type === 'file' && (
                              <a
                                href={att.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center space-x-2 text-blue-500 hover:text-blue-600"
                              >
                                <FileText className="w-4 h-4" />
                                <span>{att.fileName || 'File'}</span>
                              </a>
                            )}
                          </div>
                        ))}
                        {/* Legacy fileUrl support */}
                        {!message.attachments && message.fileUrl && (
                          <div>
                            {message.messageType === 'image' && (
                              <img
                                src={message.fileUrl}
                                alt={message.fileName || 'Image'}
                                className="max-w-xs rounded-lg cursor-pointer"
                                onClick={() => window.open(message.fileUrl, '_blank')}
                              />
                            )}
                            {message.messageType === 'audio' && (
                              <audio controls className="w-full">
                                <source src={message.fileUrl} />
                              </audio>
                            )}
                            {message.messageType === 'file' && (
                              <a
                                href={message.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center space-x-2 text-blue-500 hover:text-blue-600"
                              >
                                <FileText className="w-4 h-4" />
                                <span>{message.fileName || 'File'}</span>
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    ) : null}
                    {message.isDeleted ? (
                      <div className="flex items-center space-x-2">
                        <X className="w-4 h-4" />
                        <span className="text-sm">This message was deleted</span>
                      </div>
                    ) : editingMessageId === message._id ? (
                      <div className="space-y-2">
                        <textarea
                          ref={editInputRef}
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSaveEdit(message._id);
                            } else if (e.key === 'Escape') {
                              handleCancelEdit();
                            }
                          }}
                          className="w-full px-2 py-1 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                          rows={2}
                        />
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleSaveEdit(message._id)}
                            className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                          >
                            Save
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : message.content ? (
                      <p className="whitespace-pre-wrap break-words">{message.content}</p>
                    ) : null}
                  </div>
                  {showTime && (
                    <div className={`flex items-center space-x-1 mt-1 text-xs ${message.isDeleted ? 'text-gray-400' : 'text-gray-500'} ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      <span>{formatTime(message.createdAt)}</span>
                      {message.isEdited && !message.isDeleted && (
                        <span className="italic text-gray-400" title={`Edited at ${formatTime(message.editedAt)}`}>
                          Edited
                        </span>
                      )}
                      {isOwn && !message.isDeleted && (
                        <span>
                          {message.isRead ? (
                            <CheckCheck className="w-4 h-4 text-blue-500" />
                          ) : (
                            <Check className="w-4 h-4 text-gray-400" />
                          )}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}

        {/* Typing Indicator */}
        <AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center space-x-2"
            >
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-semibold">
                {typingUser?.charAt(0) || 'U'}
              </div>
              <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-2 border border-gray-200">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="px-6 py-2 bg-gray-100 border-t border-gray-200">
          <div className="flex space-x-2 overflow-x-auto">
            {attachments.map((att, index) => (
              <div key={index} className="relative flex-shrink-0">
                {att.type === 'image' && att.preview && (
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden">
                    <img src={att.preview} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      onClick={() => removeAttachment(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                {att.type === 'audio' && (
                  <div className="relative w-48 bg-white rounded-lg p-2 border border-gray-200">
                    <audio controls className="w-full">
                      <source src={att.preview} />
                    </audio>
                    <button
                      onClick={() => removeAttachment(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Call Incoming Modal */}
      <AnimatePresence>
        {isCallIncoming && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-white rounded-2xl p-8 text-center max-w-md"
            >
              <h3 className="text-2xl font-bold mb-2">Incoming Call</h3>
              <p className="text-gray-600 mb-6">{otherUser?.name || 'User'}</p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={rejectCall}
                  className="p-4 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <PhoneOff className="w-6 h-6" />
                </button>
                <button
                  onClick={acceptCall}
                  className="p-4 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
                >
                  <Phone className="w-6 h-6" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Call UI */}
      {isCallActive && callStatus === 'connected' && (
        <div className="bg-blue-500 text-white px-6 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span>Call in progress with {otherUser?.name || 'User'}</span>
          </div>
          <button
            onClick={endCall}
            className="p-2 bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
          >
            <PhoneOff className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Audio elements for WebRTC */}
      {remoteStream && (
        <audio
          ref={audioRef}
          autoPlay
          playsInline
          srcObject={remoteStream}
        />
      )}

      {/* Input Area */}
      <form onSubmit={handleSend} className="bg-white border-t border-gray-200 px-6 py-4">
        <div className="flex items-end space-x-2">
          <div className="flex space-x-1">
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Upload image"
            >
              <FileText className="w-5 h-5 text-gray-600" />
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Upload file"
            >
              <Paperclip className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          <input
            ref={imageInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => handleFileSelect(e, 'image')}
            className="hidden"
          />
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.txt"
            onChange={(e) => handleFileSelect(e, 'file')}
            className="hidden"
          />
          <input
            ref={audioInputRef}
            type="file"
            accept="audio/*"
            onChange={(e) => handleFileSelect(e, 'audio')}
            className="hidden"
          />
          
          <div className="flex-1 relative">
            <textarea
              value={inputMessage}
              onChange={(e) => {
                setInputMessage(e.target.value);
                handleTypingStart();
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e);
                }
              }}
              placeholder="Type a message..."
              className="w-full px-4 py-3 pr-20 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={1}
              style={{ minHeight: '48px', maxHeight: '120px' }}
            />
            <div className="absolute right-2 bottom-2 flex items-center space-x-1">
              {isRecording ? (
                <button
                  type="button"
                  onClick={stopRecording}
                  className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={startRecording}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Mic className="w-5 h-5 text-gray-600" />
                </button>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={(!inputMessage.trim() && attachments.length === 0) || isUploading}
            className="p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isUploading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface;

