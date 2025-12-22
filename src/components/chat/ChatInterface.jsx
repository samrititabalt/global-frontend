import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
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
  Reply,
  CornerDownLeft,
  Maximize2,
  History,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../utils/axios';
import { chatAPI } from '../../services/api';
import { useWebRTC } from '../../hooks/useWebRTC';
import MessageItem from './MessageItem';
import VoiceNote from './VoiceNote';
import VoiceCallUI from './VoiceCallUI';
import CallHistory from './CallHistory';
import MinimizedCallWindow from './MinimizedCallWindow';

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
  // #region debug log
  console.log('[DEBUG] ChatInterface render start', { hasChatSession: !!chatSession, chatSessionId: chatSession?._id, hasCurrentUser: !!currentUser, hasSocket: !!socket });
  fetch('http://127.0.0.1:7242/ingest/2f137257-445b-4027-94f4-f63f4a70e66e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ChatInterface.jsx:46',message:'ChatInterface render start',data:{hasChatSession:!!chatSession,chatSessionId:chatSession?._id,hasCurrentUser:!!currentUser,hasSocket:!!socket},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
  // #endregion

  // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS (React Rules of Hooks)
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [otherUserOnline, setOtherUserOnline] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [openMenuMessageId, setOpenMenuMessageId] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [selectedMessages, setSelectedMessages] = useState(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [showCallHistory, setShowCallHistory] = useState(false);
  const [callMuteState, setCallMuteState] = useState(false);
  const [callSpeakerState, setCallSpeakerState] = useState(true);
  const [isHeaderMenuOpen, setIsHeaderMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAvatarPreviewOpen, setIsAvatarPreviewOpen] = useState(false);
  const speakerToggleRef = useRef(null); // Ref to store speaker toggle function from VoiceCallUI
  const messagesEndRef = useRef(null);
  const menuRef = useRef(null);
  const replyPreviewRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const audioInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chatContainerRef = useRef(null);
  const audioRef = useRef(null);
  const editInputRef = useRef(null);
  const messageRefs = useRef({}); // Store refs for each message to enable scrolling
  const headerMenuRef = useRef(null);

  // #region debug log
  const chatSessionId = chatSession?._id;
  const currentUserId = currentUser?._id || currentUser?.id;
  fetch('http://127.0.0.1:7242/ingest/2f137257-445b-4027-94f4-f63f4a70e66e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ChatInterface.jsx:93',message:'Before useWebRTC call',data:{chatSessionId,currentUserId,hasSocket:!!socket},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
  // #endregion
  
  // WebRTC for voice calls
  const {
    isCallActive,
    isCallIncoming,
    isCallOutgoing,
    callStatus,
    remoteStream,
    localStream,
    isCallMinimized,
    callDuration,
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleCallMinimize,
  } = useWebRTC(socket, chatSessionId, currentUserId);
  
  // #region debug log
  fetch('http://127.0.0.1:7242/ingest/2f137257-445b-4027-94f4-f63f4a70e66e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ChatInterface.jsx:108',message:'After useWebRTC call',data:{isCallActive,isCallIncoming,isCallOutgoing},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
  // #endregion

  const loadMessages = useCallback(async () => {
    // #region debug log
    console.log('[DEBUG] loadMessages called', { chatSessionId: chatSession?._id, hasCurrentUser: !!currentUser });
    fetch('http://127.0.0.1:7242/ingest/2f137257-445b-4027-94f4-f63f4a70e66e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ChatInterface.jsx:127',message:'loadMessages called',data:{chatSessionId:chatSession?._id,hasCurrentUser:!!currentUser,userRole:currentUser?.role},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    if (!chatSession?._id || !currentUser) {
      // #region debug log
      console.log('[DEBUG] loadMessages early return', { hasChatSessionId: !!chatSession?._id, hasCurrentUser: !!currentUser });
      // #endregion
      return;
    }
    try {
      // Use appropriate API based on user role
      const endpoint = currentUser.role === 'customer' 
        ? `/customer/chat-session/${chatSession._id}`
        : `/agent/chat-session/${chatSession._id}`;
      // #region debug log
      console.log('[DEBUG] Loading messages from endpoint', endpoint);
      fetch('http://127.0.0.1:7242/ingest/2f137257-445b-4027-94f4-f63f4a70e66e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ChatInterface.jsx:140',message:'Calling messages API',data:{endpoint},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      const response = await api.get(endpoint);
      // #region debug log
      console.log('[DEBUG] Messages API response', { success: response.data.success, messageCount: response.data.messages?.length });
      fetch('http://127.0.0.1:7242/ingest/2f137257-445b-4027-94f4-f63f4a70e66e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ChatInterface.jsx:147',message:'Messages API response received',data:{success:response.data.success,messageCount:response.data.messages?.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      // Ensure replyTo is populated
      const messagesWithReplies = (response.data.messages || []).map(msg => {
        if (msg.replyTo && typeof msg.replyTo === 'string') {
          // If replyTo is just an ID, find the message in the list
          const repliedMessage = response.data.messages.find(m => m._id === msg.replyTo);
          if (repliedMessage) {
            msg.replyTo = repliedMessage;
          }
        }
        return msg;
      });
      setMessages(messagesWithReplies);
      // #region debug log
      console.log('[DEBUG] Messages set', { count: messagesWithReplies.length });
      // #endregion
    } catch (error) {
      // #region debug log
      console.error('[DEBUG] Error loading messages', error);
      fetch('http://127.0.0.1:7242/ingest/2f137257-445b-4027-94f4-f63f4a70e66e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ChatInterface.jsx:163',message:'Error loading messages',data:{error:error.message,status:error.response?.status},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      console.error('Error loading messages:', error);
      // Try alternative endpoint if first fails
      try {
        const response = await api.get(`/chat/sessions/${chatSession._id}/messages`);
        setMessages(response.data.messages || []);
      } catch (err) {
        console.error('Error loading messages from alternative endpoint:', err);
      }
    }
  }, [chatSession?._id, currentUser]);

  useEffect(() => {
    // Load existing messages via REST
    // #region debug log
    console.log('[DEBUG] useEffect for loadMessages triggered', { chatSessionId: chatSession?._id });
    fetch('http://127.0.0.1:7242/ingest/2f137257-445b-4027-94f4-f63f4a70e66e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ChatInterface.jsx:183',message:'useEffect loadMessages triggered',data:{chatSessionId:chatSession?._id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    loadMessages();
  }, [loadMessages]);

  // Calculate otherUser outside useEffect with null checks
  const otherUser = useMemo(() => {
    // #region debug log
    fetch('http://127.0.0.1:7242/ingest/2f137257-445b-4027-94f4-f63f4a70e66e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ChatInterface.jsx:116',message:'Calculating otherUser',data:{hasChatSession:!!chatSession,hasCustomer:!!chatSession?.customer,hasAgent:!!chatSession?.agent,hasCurrentUser:!!currentUser,customerId:chatSession?.customer?._id?.toString(),currentUserId:currentUser?._id?.toString()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    if (!chatSession || !currentUser) return null;
    
    const customerId = chatSession?.customer?._id?.toString() || chatSession?.customer?.toString();
    const currentUserId = currentUser?._id?.toString() || currentUser?.id?.toString();
    
    if (customerId === currentUserId) {
      const result = chatSession?.agent || null;
      // #region debug log
      fetch('http://127.0.0.1:7242/ingest/2f137257-445b-4027-94f4-f63f4a70e66e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ChatInterface.jsx:123',message:'otherUser calculated (customer match)',data:{otherUserRole:result?.role,otherUserId:result?._id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      return result;
    } else {
      const result = chatSession?.customer || null;
      // #region debug log
      fetch('http://127.0.0.1:7242/ingest/2f137257-445b-4027-94f4-f63f4a70e66e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ChatInterface.jsx:125',message:'otherUser calculated (agent match)',data:{otherUserRole:result?.role,otherUserId:result?._id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      return result;
    }
  }, [chatSession, currentUser]);

  const otherUserRole = useMemo(() => {
    if (otherUser?.role) return otherUser.role;
    if (!currentUser?.role) return '';
    if (currentUser.role === 'customer') return 'agent';
    if (currentUser.role === 'agent') return 'customer';
    return '';
  }, [otherUser, currentUser?.role]);

  const colorPalette = useMemo(
    () => ['bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 'bg-amber-500', 'bg-rose-500', 'bg-sky-500', 'bg-indigo-500'],
    []
  );

  const getColorForUser = useCallback((user) => {
    const key = user?._id || user?.id || user?.email || user?.name || 'default';
    let hash = 0;
    for (let i = 0; i < key.length; i += 1) {
      hash = key.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colorPalette.length;
    return colorPalette[index];
  }, [colorPalette]);

  const renderAvatar = useCallback((user, sizeClasses = 'w-10 h-10', textClasses = 'text-base') => {
    if (user?.avatar) {
      return (
        <img
          src={user.avatar}
          alt={user?.name || 'User'}
          className={`${sizeClasses} rounded-full object-cover`}
        />
      );
    }
    const initial = user?.name?.charAt(0)?.toUpperCase() || 'U';
    return (
      <div className={`${sizeClasses} ${textClasses} ${getColorForUser(user)} rounded-full flex items-center justify-center text-white font-semibold`}>
        {initial}
      </div>
    );
  }, [getColorForUser]);

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

    const handleUserOnline = data => {
      if (!data || !otherUser) return;
      const dataUserId = data.userId?.toString();
      const otherUserId = otherUser._id?.toString();
      if (dataUserId === otherUserId) {
        console.log('✅ User online event received:', data);
        setOtherUserOnline(true);
      }
    };

    const handleUserOffline = data => {
      if (!data || !otherUser) return;
      const dataUserId = data.userId?.toString();
      const otherUserId = otherUser._id?.toString();
      if (dataUserId === otherUserId) {
        console.log('❌ User offline event received:', data);
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
    socket.on('userOnline', handleUserOnline);
    socket.on('userOffline', handleUserOffline);
    socket.on('messageEdited', handleMessageEdited);
    socket.on('messageDeleted', handleMessageDeleted);
    socket.on('error', handleError);
    socket.on('tokenBalanceUpdate', (data) => {
      // Backend event name still uses "token" but represents available service minutes
      console.log('Service minutes updated:', data);
    });

    return () => {
      socket.off('newMessage', handleNewMessage);
      socket.off('typing', handleTypingEvent);
      socket.off('messageRead', handleMessageReadEvent);
      socket.off('agentOnline', handleAgentOnline);
      socket.off('agentOffline', handleAgentOffline);
      socket.off('userOnline', handleUserOnline);
      socket.off('userOffline', handleUserOffline);
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

  // Function to scroll to a specific message
  const scrollToMessage = (messageId) => {
    const messageElement = messageRefs.current[messageId];
    if (messageElement) {
      messageElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center',
        inline: 'nearest'
      });
      // Highlight the message briefly
      messageElement.classList.add('ring-2', 'ring-blue-400', 'ring-opacity-75');
      setTimeout(() => {
        messageElement.classList.remove('ring-2', 'ring-blue-400', 'ring-opacity-75');
      }, 2000);
    }
  };

  const loadMessages = async () => {
    if (!chatSession?._id || !currentUser) return;
    try {
      // Use appropriate API based on user role
      const endpoint = currentUser.role === 'customer' 
        ? `/customer/chat-session/${chatSession._id}`
        : `/agent/chat-session/${chatSession._id}`;
      const response = await api.get(endpoint);
      // Ensure replyTo is populated
      const messagesWithReplies = (response.data.messages || []).map(msg => {
        if (msg.replyTo && typeof msg.replyTo === 'string') {
          // If replyTo is just an ID, find the message in the list
          const repliedMessage = response.data.messages.find(m => m._id === msg.replyTo);
          if (repliedMessage) {
            msg.replyTo = repliedMessage;
          }
        }
        return msg;
      });
      setMessages(messagesWithReplies);
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
          if (replyingTo) {
            formData.append('replyTo', replyingTo._id);
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
        setReplyingTo(null);
      }

      // Send TEXT via Socket.io for real-time
      if (inputMessage.trim() && attachments.length === 0) {
        socket.emit('sendMessage', {
          chatSessionId: chatSession._id,
          content: inputMessage.trim(),
          messageType: 'text',
          replyTo: replyingTo?._id || null,
        });
        setInputMessage('');
        setReplyingTo(null);
        
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
        setReplyingTo(null);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
      setIsUploading(false);
    }
  };

  const handleReply = (message) => {
    setReplyingTo(message);
    setOpenMenuMessageId(null);
    // Scroll to input
    setTimeout(() => {
      replyPreviewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
  };

  const cancelReply = () => {
    setReplyingTo(null);
  };

  const toggleMessageSelection = (messageId) => {
    setSelectedMessages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      if (newSet.size === 0) {
        setIsSelectionMode(false);
      }
      return newSet;
    });
  };

  const handleLongPress = (message) => {
    setIsSelectionMode(true);
    toggleMessageSelection(message._id);
  };

  const exitSelectionMode = () => {
    setIsSelectionMode(false);
    setSelectedMessages(new Set());
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

  const recordingIntervalRef = useRef(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      const chunks = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const audioFile = new File([blob], `voice-${Date.now()}.webm`, { type: 'audio/webm' });
        
        // Get duration from blob
        const audioUrl = URL.createObjectURL(blob);
        const audio = new Audio(audioUrl);
        
        audio.onloadedmetadata = () => {
          setAttachments(prev => [...prev, {
            file: audioFile,
            type: 'audio',
            preview: audioUrl,
            duration: audio.duration || recordingTime,
          }]);
        };
        
        // Fallback if metadata doesn't load quickly
        setTimeout(() => {
          if (audio.duration) {
            // Already handled by onloadedmetadata
          } else {
            setAttachments(prev => {
              // Check if already added
              const exists = prev.some(att => att.preview === audioUrl);
              if (!exists) {
                return [...prev, {
                  file: audioFile,
                  type: 'audio',
                  preview: audioUrl,
                  duration: recordingTime,
                }];
              }
              return prev;
            });
          }
        }, 1000);
        
        stream.getTracks().forEach(track => track.stop());
        setRecordingTime(0);
        if (recordingIntervalRef.current) {
          clearInterval(recordingIntervalRef.current);
          recordingIntervalRef.current = null;
        }
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start recording timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Microphone access denied. Please allow microphone access to record voice notes.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
    }
  };

  const formatRecordingTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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

  const formatDuration = (seconds) => {
    if (!seconds || seconds === 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
    // Initial online state from chatSession if present
    if (otherUser) {
      // Check if user has isOnline property
      if (typeof otherUser.isOnline === 'boolean') {
        setOtherUserOnline(otherUser.isOnline);
        console.log(`Initial online status for ${otherUser.name}:`, otherUser.isOnline);
      } else {
        // Default to false if not set, but try to get from database
        setOtherUserOnline(false);
      }
    } else {
      setOtherUserOnline(false);
    }
  }, [otherUser]);

  // Update online status when socket connects
  useEffect(() => {
    if (socket && socket.connected && otherUser && socket.userId) {
      // When socket connects, check if other user is online
      // The status will be updated via socket events (userOnline/userOffline)
      console.log('Socket connected, waiting for online status updates');
    }
  }, [socket, otherUser]);

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

  useEffect(() => {
    if (!isHeaderMenuOpen) return;

    const handleHeaderMenuOutside = (event) => {
      if (headerMenuRef.current && !headerMenuRef.current.contains(event.target)) {
        setIsHeaderMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleHeaderMenuOutside);
    return () => {
      document.removeEventListener('mousedown', handleHeaderMenuOutside);
    };
  }, [isHeaderMenuOpen]);

  // Guard against null/undefined chatSession - MUST be after all hooks
  if (!chatSession || !chatSession._id) {
    // #region debug log
    console.log('[DEBUG] ChatInterface guard clause triggered');
    fetch('http://127.0.0.1:7242/ingest/2f137257-445b-4027-94f4-f63f4a70e66e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ChatInterface.jsx:820',message:'ChatInterface guard clause triggered',data:{hasChatSession:!!chatSession,chatSessionId:chatSession?._id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Chat session not available</p>
        </div>
      </div>
    );
  }

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
        <button
          type="button"
          onClick={() => setIsProfileModalOpen(true)}
          className="flex items-center space-x-3 text-left hover:bg-gray-50 rounded-xl px-2 py-1 transition-colors"
        >
          <div className="relative">
            {renderAvatar(otherUser)}
            {otherUserOnline && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900">
                {chatSession?.service?.name || 'Service'}
              </h3>
              {otherUserRole === 'agent' && (
                <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold uppercase tracking-wide">
                  Agent
                </span>
              )}
              {otherUserRole === 'customer' && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-xs font-semibold uppercase tracking-wide">
                  Customer
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500">
              {otherUser?.name || (otherUserRole === 'agent' ? 'Agent' : otherUserRole === 'customer' ? 'Customer' : 'User')} • {otherUserOnline ? 'Online' : 'Offline'}
            </p>
          </div>
        </button>
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
          <div className="relative">
            <button
              onClick={() => setIsHeaderMenuOpen((prev) => !prev)}
              className={`p-2 rounded-lg transition-colors ${
                isHeaderMenuOpen ? 'bg-gray-100 text-gray-800' : 'hover:bg-gray-100 text-gray-600'
              }`}
              title="More options"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
            <AnimatePresence>
              {isHeaderMenuOpen && (
                <motion.div
                  ref={headerMenuRef}
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden z-20"
                >
                  <button
                    onClick={() => {
                      setShowCallHistory(true);
                      setIsHeaderMenuOpen(false);
                    }}
                    className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <History className="w-4 h-4 text-gray-500" />
                    <span>Call history</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
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
          const prevMessage = index > 0 ? messages[index - 1] : null;
          const prevSenderId = prevMessage && typeof prevMessage.sender === 'object' 
            ? prevMessage.sender._id 
            : prevMessage?.sender;
          const showAvatar = index === 0 || prevSenderId?.toString() !== senderId?.toString();
          const showTime = index === messages.length - 1 || 
            new Date(messages[index + 1].createdAt) - new Date(message.createdAt) > 300000;
          
          // Get sender info from message
          const sender = typeof message.sender === 'object' ? message.sender : null;
          const senderName = sender?.name || (isOwn ? currentUser?.name : otherUser?.name) || 'User';
          const senderAvatar = sender?.avatar || (isOwn ? currentUser?.avatar : otherUser?.avatar);

          return (
            <motion.div
              key={message._id}
              ref={(el) => {
                if (el) {
                  messageRefs.current[message._id] = el;
                }
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${isOwn ? 'justify-end' : 'justify-start'} ${showAvatar ? 'mt-4' : 'mt-1'} transition-all duration-300`}
              id={`message-${message._id}`}
            >
              <div className={`flex items-end space-x-2 max-w-[70%] ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
                {!isOwn && showAvatar && (
                  <div className="flex-shrink-0">
                    {renderAvatar(sender || otherUser, 'w-8 h-8', 'text-sm')}
                  </div>
                )}
                {isOwn && showAvatar && (
                  <div className="flex-shrink-0">
                    {renderAvatar(currentUser, 'w-8 h-8', 'text-sm')}
                  </div>
                )}
                <div 
                  className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} relative group`}
                >
                  {/* Sender Name - Show for non-own messages */}
                  {!isOwn && showAvatar && senderName && (
                    <span className="text-xs font-medium text-gray-600 mb-1 px-1">
                      {senderName}
                    </span>
                  )}
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
                            handleReply(message);
                          }}
                          className="px-4 py-2.5 text-left hover:bg-gray-50 transition-colors flex items-center space-x-3 text-sm text-gray-700 w-full"
                        >
                          <Reply className="w-4 h-4" />
                          <span>Reply</span>
                        </button>
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
                  <MessageItem
                    message={message}
                    isOwn={isOwn}
                    isSelected={selectedMessages.has(message._id)}
                    isSelectionMode={isSelectionMode}
                    editContent={editContent}
                    setEditContent={setEditContent}
                    onDelete={() => handleDeleteMessage(message._id)}
                    onReply={handleReply}
                    onSelect={toggleMessageSelection}
                    onLongPress={handleLongPress}
                    currentUser={currentUser}
                    editingMessageId={editingMessageId}
                    handleSaveEdit={handleSaveEdit}
                    handleCancelEdit={handleCancelEdit}
                    onReplyClick={scrollToMessage}
                    sender={sender}
                    otherUser={otherUser}
                    isCustomerView={currentUser?.role === 'customer'}
                  />
                  {showTime && (
                    <div className={`flex items-center space-x-1 mt-1 text-xs ${message.isDeleted ? 'text-gray-400' : 'text-gray-500'} ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      <span>{formatTime(message.createdAt)}</span>
                      {message.isEdited && !message.isDeleted && (
                        <span className={`italic ${isOwn ? 'text-white/70' : 'text-gray-400'}`} title={`Edited at ${formatTime(message.editedAt)}`}>
                          Edited
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
              <div className="flex-shrink-0">
                {renderAvatar(otherUser, 'w-8 h-8', 'text-sm')}
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
        <div className="px-6 py-2 bg-gray-50 border-t border-gray-200">
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
                  <div className="relative w-64 bg-white rounded-lg p-3 border border-gray-200">
                    <VoiceNote 
                      url={att.preview} 
                      isOwn={false}
                    />
                    <button
                      onClick={() => removeAttachment(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 z-10"
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

      {/* Call UI (audio controller stays mounted even when minimized) */}
      {isCallActive && (
        <VoiceCallUI
          isCallActive={isCallActive}
          isCallIncoming={isCallIncoming}
          isCallOutgoing={isCallOutgoing}
          callStatus={callStatus}
          remoteStream={remoteStream}
          localStream={localStream}
          isCallMinimized={isCallMinimized}
          callDuration={callDuration}
          otherUser={otherUser}
          currentUser={currentUser}
          otherUserOnline={otherUserOnline}
          onAccept={acceptCall}
          onReject={rejectCall}
          onEnd={endCall}
          onToggleMinimize={toggleCallMinimize}
          onMuteStateChange={setCallMuteState}
          onSpeakerStateChange={setCallSpeakerState}
          onSpeakerToggleReady={(toggleFn) => {
            speakerToggleRef.current = toggleFn;
          }}
        />
      )}
      
      {/* Minimized call floating window - Draggable */}
      <AnimatePresence>
        {isCallMinimized && isCallActive && (callStatus === 'connected' || callStatus === 'ringing' || callStatus === 'calling') && (
          <MinimizedCallWindow
            otherUser={otherUser}
            callDuration={callDuration}
            callStatus={callStatus}
            onMaximize={toggleCallMinimize}
            onEnd={endCall}
            onToggleMute={localStream ? () => {
              const newMuteState = !callMuteState;
              localStream.getAudioTracks().forEach(track => {
                track.enabled = newMuteState;
              });
              setCallMuteState(newMuteState);
            } : undefined}
            onToggleSpeaker={speakerToggleRef.current || undefined}
            isMuted={callMuteState}
            isSpeakerOn={callSpeakerState}
          />
        )}
      </AnimatePresence>

      {/* Call History Panel */}
      <AnimatePresence>
        {showCallHistory && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-40 border-l border-gray-200 overflow-y-auto"
          >
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Call History</h3>
              <button
                onClick={() => setShowCallHistory(false)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div className="p-4">
              <CallHistory 
                chatSessionId={chatSession?._id} 
                currentUser={currentUser}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile Modal */}
      <AnimatePresence>
        {isProfileModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
            onClick={() => {
              setIsProfileModalOpen(false);
              setIsAvatarPreviewOpen(false);
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 180, damping: 20 }}
              className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-md p-8 space-y-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <button
                  type="button"
                  onClick={() => setIsAvatarPreviewOpen(true)}
                  className="relative group focus:outline-none"
                >
                  {renderAvatar(otherUser, 'w-24 h-24 text-2xl')}
                  {otherUserOnline && (
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white bg-green-500"></span>
                  )}
                  <span className="absolute inset-0 rounded-3xl bg-black/0 group-hover:bg-black/10 transition-colors"></span>
                </button>
                <div>
                  <div className="flex items-center justify-center gap-2">
                    <p className="text-2xl font-semibold text-gray-900">{otherUser?.name || 'User'}</p>
                    {otherUserRole === 'agent' && (
                      <span className="px-3 py-0.5 text-xs font-semibold rounded-full bg-blue-50 text-blue-600 uppercase tracking-wide">
                        Agent
                      </span>
                    )}
                    {otherUserRole === 'customer' && (
                      <span className="px-3 py-0.5 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-600 uppercase tracking-wide">
                        Customer
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{otherUserOnline ? 'Online now' : 'Offline'}</p>
                </div>
              </div>

              <div className="grid gap-3">
                {otherUser?.email && (
                  <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
                    <p className="text-xs uppercase tracking-wide text-gray-500">Email</p>
                    <p className="text-sm font-medium text-gray-900 break-all">{otherUser.email}</p>
                  </div>
                )}
                {otherUser?.phone && (
                  <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
                    <p className="text-xs uppercase tracking-wide text-gray-500">Phone</p>
                    <p className="text-sm font-medium text-gray-900 break-all">{otherUser.phone}</p>
                  </div>
                )}
                {otherUser?.country && (
                  <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
                    <p className="text-xs uppercase tracking-wide text-gray-500">Country</p>
                    <p className="text-sm font-medium text-gray-900 break-all">{otherUser.country}</p>
                  </div>
                )}
                {otherUserRole === 'agent' && (
                  <div className="rounded-2xl border border-blue-100 bg-blue-50/60 px-4 py-3">
                    <p className="text-xs uppercase tracking-wide text-blue-600">Service speciality</p>
                    <p className="text-sm font-semibold text-blue-900">
                      {otherUser?.serviceCategory?.name || otherUser?.serviceCategoryName || 'Not assigned'}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileModalOpen(false);
                    setIsAvatarPreviewOpen(false);
                  }}
                  className="px-5 py-2 rounded-2xl bg-gray-900 text-white font-semibold hover:bg-gray-800 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Avatar preview */}
      <AnimatePresence>
        {isAvatarPreviewOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
            onClick={() => setIsAvatarPreviewOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 180, damping: 18 }}
              className="relative max-w-xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setIsAvatarPreviewOpen(false)}
                className="absolute -top-10 right-0 text-white/80 hover:text-white"
              >
                ✕
              </button>
              <div className="bg-white rounded-[32px] overflow-hidden shadow-2xl border border-gray-100">
                {otherUser?.avatar ? (
                  <img
                    src={otherUser.avatar}
                    alt={otherUser?.name || 'User'}
                    className="w-full h-full object-cover max-h-[28rem]"
                  />
                ) : (
                  <div className="w-full h-[28rem] flex items-center justify-center bg-gray-900 text-white text-6xl font-bold">
                    {otherUser?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selection Mode Header */}
      <AnimatePresence>
        {isSelectionMode && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-blue-500 text-white px-6 py-3 flex items-center justify-between"
          >
            <div className="flex items-center space-x-4">
              <button
                onClick={exitSelectionMode}
                className="p-1 hover:bg-blue-600 rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <span className="font-semibold">
                {selectedMessages.size} {selectedMessages.size === 1 ? 'message' : 'messages'} selected
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  // Handle bulk actions
                  exitSelectionMode();
                }}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-sm font-medium"
              >
                Delete
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reply Preview */}
      <AnimatePresence>
        {replyingTo && (
          <motion.div
            ref={replyPreviewRef}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-gray-100 border-t border-gray-200 px-6 py-3"
          >
            <div className="flex items-start space-x-3">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <Reply className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-semibold text-gray-700">
                    Replying to {typeof replyingTo.sender === 'object' 
                      ? (replyingTo.sender._id?.toString() === currentUser?._id?.toString() 
                          ? 'You' 
                          : replyingTo.sender.name || (otherUser?.name || 'User'))
                      : 'User'}
                  </span>
                </div>
                <div className="text-sm text-gray-600 truncate pl-6">
                  {replyingTo.content || 
                   (replyingTo.attachments?.[0]?.type === 'image' ? '📷 Image' :
                    replyingTo.attachments?.[0]?.type === 'audio' ? '🎤 Audio' :
                    replyingTo.attachments?.[0]?.type === 'file' ? '📎 File' :
                    replyingTo.fileUrl ? '📎 Attachment' : 'Message')}
                </div>
              </div>
              <button
                onClick={cancelReply}
                className="p-1 hover:bg-gray-200 rounded transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
            accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.csv"
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
            <div className="absolute right-2 bottom-2 flex items-center space-x-2">
              {isRecording ? (
                <>
                  <div className="flex items-center space-x-2 px-3 py-1.5 bg-red-50 rounded-lg border border-red-200">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-red-600">
                      {formatRecordingTime(recordingTime)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={stopRecording}
                    className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-lg"
                    title="Stop recording"
                  >
                    <div className="w-4 h-4 bg-white rounded-sm"></div>
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={startRecording}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Record voice note"
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

