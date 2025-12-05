import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import ChatInterface from '../../components/chat/ChatInterface';
import ChatSidebar from '../../components/chat/ChatSidebar';
import api from '../../utils/axios';

const CustomerChat = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket } = useSocket();
  const [chatSession, setChatSession] = useState(null);
  const [chatSessions, setChatSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChatSessions();
    if (chatId) {
      loadChatSession();
    }
  }, [chatId]);

  useEffect(() => {
    if (socket) {
      socket.on('chatUpdated', handleChatUpdate);
      return () => {
        socket.off('chatUpdated');
      };
    }
  }, [socket, chatId]);

  const loadChatSessions = async () => {
    try {
      const response = await api.get('/customer/chat-sessions');
      setChatSessions(response.data.chatSessions || []);
    } catch (error) {
      console.error('Error loading chat sessions:', error);
    }
  };

  const loadChatSession = async () => {
    try {
      const response = await api.get(`/customer/chat-session/${chatId}`);
      setChatSession(response.data.chatSession);
    } catch (error) {
      console.error('Error loading chat session:', error);
      navigate('/customer/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleChatUpdate = (data) => {
    if (data.chatSessionId === chatId) {
      loadChatSession();
    }
    loadChatSessions();
  };

  const handleNewChat = () => {
    navigate('/customer/dashboard');
  };

  if (loading && chatId) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
      </div>
    );
  }

  if (!chatId && chatSessions.length > 0) {
    navigate(`/customer/chat/${chatSessions[0]._id}`);
    return null;
  }

  if (!chatId) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No chats available</p>
          <button
            onClick={() => navigate('/customer/dashboard')}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Start New Chat
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-gray-50">
      <ChatSidebar
        chatSessions={chatSessions}
        currentChatId={chatId}
        onNewChat={handleNewChat}
      />
      <div className="flex-1 flex flex-col">
        {chatSession ? (
          <ChatInterface
            chatSession={chatSession}
            currentUser={user}
            socket={socket}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerChat;
