import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { FiSend, FiImage, FiPaperclip, FiMic, FiPhone, FiVideo } from 'react-icons/fi';
import InfiniteScroll from 'react-infinite-scroll-component';
import api from '../utils/axios';

const ChatInterface = ({ chatSessionId, chatSession, onMessageSent }) => {
  const { socket, isConnected } = useSocket();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [isCalling, setIsCalling] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const audioInputRef = useRef(null);
  const localStreamRef = useRef(null);
  const peerConnectionRef = useRef(null);

  useEffect(() => {
    loadMessages();
  }, [chatSessionId]);

  useEffect(() => {
    if (!socket) return;

    socket.emit('joinChat', chatSessionId);

    socket.on('newMessage', (message) => {
      setMessages(prev => [...prev, message]);
      scrollToBottom();
    });

    socket.on('typing', (data) => {
      if (data.userId !== user.id) {
        setTypingUsers(prev => {
          if (data.isTyping && !prev.includes(data.userId)) {
            return [...prev, data.userId];
          } else if (!data.isTyping) {
            return prev.filter(id => id !== data.userId);
          }
          return prev;
        });
      }
    });

    socket.on('messageRead', (data) => {
      setMessages(prev =>
        prev.map(msg =>
          msg._id === data.messageId ? { ...msg, isRead: true } : msg
        )
      );
    });

    socket.on('agentReassigned', (data) => {
      // Handle agent reassignment
      console.log('Agent reassigned:', data);
    });

    return () => {
      socket.emit('leaveChat', chatSessionId);
      socket.off('newMessage');
      socket.off('typing');
      socket.off('messageRead');
      socket.off('agentReassigned');
    };
  }, [socket, chatSessionId, user.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async () => {
    try {
      const endpoint = user.role === 'customer' 
        ? `/customer/chat-session/${chatSessionId}`
        : `/agent/chat-session/${chatSessionId}`;
      
      const response = await api.get(endpoint);
      const loadedMessages = response.data.messages || [];
      
      setMessages(loadedMessages);
      setHasMore(loadedMessages.length >= 20);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const loadMoreMessages = async () => {
    // Implement pagination if needed
    setHasMore(false);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    if (socket) {
      socket.emit('sendMessage', {
        chatSessionId,
        content: newMessage,
        messageType: 'text'
      });
      setNewMessage('');
      setIsTyping(false);
      if (onMessageSent) onMessageSent();
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    if (!isTyping) {
      setIsTyping(true);
      if (socket) {
        socket.emit('typing', { chatSessionId, isTyping: true });
      }
    }

    clearTimeout(handleTyping.timeout);
    handleTyping.timeout = setTimeout(() => {
      setIsTyping(false);
      if (socket) {
        socket.emit('typing', { chatSessionId, isTyping: false });
      }
    }, 1000);
  };

  const handleFileUpload = async (type) => {
    const input = type === 'image' ? imageInputRef.current :
                  type === 'file' ? fileInputRef.current :
                  audioInputRef.current;
    
    if (input) {
      input.click();
    }
  };

  const handleFileChange = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('chatSessionId', chatSessionId);
    
    if (type === 'image') {
      formData.append('image', file);
    } else if (type === 'file') {
      formData.append('file', file);
    } else if (type === 'audio') {
      formData.append('audio', file);
    }

    try {
      const response = await api.post('/chat/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (socket && response.data.message) {
        socket.emit('sendMessage', {
          chatSessionId,
          messageType: response.data.message.messageType,
          fileUrl: response.data.message.fileUrl,
          fileName: response.data.message.fileName
        });
        if (onMessageSent) onMessageSent();
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert(error.response?.data?.message || 'Upload failed');
    }
  };

  const handleAudioCall = () => {
    setIsCalling(true);
    // WebRTC implementation would go here
    // This is a placeholder
  };

  const markAsRead = (messageId) => {
    if (socket) {
      socket.emit('markRead', { messageId });
    }
  };

  const isMyMessage = (message) => {
    return message.sender?._id === user.id || message.senderRole === user.role;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] bg-white rounded-lg shadow-lg">
      {/* Chat Header */}
      <div className="p-4 border-b bg-primary-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">
              {user.role === 'customer' 
                ? chatSession?.agent?.name || 'Waiting for agent...'
                : chatSession?.customer?.name}
            </h3>
            <p className="text-sm text-gray-600">
              {chatSession?.service?.name} {chatSession?.subService && `- ${chatSession.subService}`}
            </p>
          </div>
          {user.role === 'customer' && chatSession?.agent && (
            <button
              onClick={handleAudioCall}
              className="p-2 rounded-full bg-primary-600 text-white hover:bg-primary-700"
            >
              <FiPhone className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div 
        id="scrollableDiv"
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        <InfiniteScroll
          dataLength={messages.length}
          next={loadMoreMessages}
          hasMore={hasMore}
          loader={<div className="text-center py-4">Loading...</div>}
          inverse={true}
          scrollableTarget="scrollableDiv"
        >
          {messages.map((message) => (
            <div
              key={message._id}
              className={`flex ${isMyMessage(message) ? 'justify-end' : 'justify-start'}`}
              onMouseEnter={() => {
                if (!isMyMessage(message) && !message.isRead) {
                  markAsRead(message._id);
                }
              }}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  isMyMessage(message)
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-900'
                }`}
              >
                {message.messageType === 'image' && message.fileUrl && (
                  <img
                    src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${message.fileUrl}`}
                    alt="Shared"
                    className="max-w-full rounded mb-2"
                  />
                )}
                {message.messageType === 'file' && (
                  <a
                    href={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${message.fileUrl}`}
                    download
                    className="flex items-center space-x-2 text-blue-400 hover:text-blue-300"
                  >
                    <FiPaperclip />
                    <span>{message.fileName}</span>
                  </a>
                )}
                {message.messageType === 'audio' && (
                  <audio controls className="w-full">
                    <source src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${message.fileUrl}`} />
                  </audio>
                )}
                {message.content && (
                  <p className="text-sm">{message.content}</p>
                )}
                <div className="flex items-center justify-end mt-1 space-x-2">
                  <span className="text-xs opacity-75">
                    {format(new Date(message.createdAt), 'HH:mm')}
                  </span>
                  {isMyMessage(message) && (
                    <span className="text-xs">
                      {message.isRead ? '✓✓' : '✓'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
          {typingUsers.length > 0 && (
            <div className="flex justify-start">
              <div className="bg-gray-200 px-4 py-2 rounded-lg">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
        </InfiniteScroll>
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t bg-gray-50">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleFileUpload('image')}
            className="p-2 text-gray-600 hover:text-gray-900"
          >
            <FiImage className="h-5 w-5" />
          </button>
          <button
            onClick={() => handleFileUpload('file')}
            className="p-2 text-gray-600 hover:text-gray-900"
          >
            <FiPaperclip className="h-5 w-5" />
          </button>
          <button
            onClick={() => handleFileUpload('audio')}
            className="p-2 text-gray-600 hover:text-gray-900"
          >
            <FiMic className="h-5 w-5" />
          </button>
          <input
            type="text"
            value={newMessage}
            onChange={handleTyping}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSendMessage();
              }
            }}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <button
            onClick={handleSendMessage}
            className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <FiSend className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Hidden file inputs */}
      <input
        type="file"
        ref={imageInputRef}
        accept="image/*"
        onChange={(e) => handleFileChange(e, 'image')}
        className="hidden"
      />
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => handleFileChange(e, 'file')}
        className="hidden"
      />
      <input
        type="file"
        ref={audioInputRef}
        accept="audio/*"
        onChange={(e) => handleFileChange(e, 'audio')}
        className="hidden"
      />
    </div>
  );
};

export default ChatInterface;

