import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import ChatInterface from '../../components/chat/ChatInterface';
import ChatSidebar from '../../components/chat/ChatSidebar';
import api from '../../utils/axios';

const AgentChat = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket } = useSocket();
  const [chatSession, setChatSession] = useState(null);
  const [chatSessions, setChatSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  // #region debug log
  useEffect(() => {
    fetch('http://127.0.0.1:7242/ingest/2f137257-445b-4027-94f4-f63f4a70e66e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AgentChat.jsx:18',message:'AgentChat component mounted',data:{chatId,hasUser:!!user,hasSocket:!!socket,userId:user?._id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
  }, []);
  // #endregion

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
      const response = await api.get('/agent/dashboard');
      const dashboard = response.data.dashboard;
      // Combine pending and active chats
      const allChats = [
        ...(dashboard.activeChats || []),
        ...(dashboard.pendingRequests || []),
        ...(dashboard.completedCases || [])
      ];
      setChatSessions(allChats);
    } catch (error) {
      console.error('Error loading chat sessions:', error);
    }
  };

  const loadChatSession = async () => {
    // #region debug log
    fetch('http://127.0.0.1:7242/ingest/2f137257-445b-4027-94f4-f63f4a70e66e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AgentChat.jsx:50',message:'loadChatSession called',data:{chatId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    try {
      setLoading(true);
      const response = await api.get(`/agent/chat-session/${chatId}`);
      
      // #region debug log
      fetch('http://127.0.0.1:7242/ingest/2f137257-445b-4027-94f4-f63f4a70e66e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AgentChat.jsx:54',message:'API response received',data:{success:response.data.success,hasChatSession:!!response.data.chatSession,chatSessionId:response.data.chatSession?._id,hasCustomer:!!response.data.chatSession?.customer,hasAgent:!!response.data.chatSession?.agent},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      
      if (response.data.success && response.data.chatSession) {
        // #region debug log
        fetch('http://127.0.0.1:7242/ingest/2f137257-445b-4027-94f4-f63f4a70e66e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AgentChat.jsx:56',message:'Setting chatSession state',data:{chatSessionId:response.data.chatSession._id,customerId:response.data.chatSession.customer?._id,agentId:response.data.chatSession.agent?._id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        setChatSession(response.data.chatSession);
      } else {
        // #region debug log
        fetch('http://127.0.0.1:7242/ingest/2f137257-445b-4027-94f4-f63f4a70e66e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AgentChat.jsx:58',message:'Chat session invalid, navigating',data:{success:response.data.success,hasChatSession:!!response.data.chatSession},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        console.error('Chat session not found or invalid');
        navigate('/agent/dashboard');
      }
    } catch (error) {
      // #region debug log
      fetch('http://127.0.0.1:7242/ingest/2f137257-445b-4027-94f4-f63f4a70e66e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AgentChat.jsx:62',message:'Error loading chat session',data:{error:error.message,status:error.response?.status,statusText:error.response?.statusText},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      console.error('Error loading chat session:', error);
      // Only navigate if it's a 404 or 403, not for other errors
      if (error.response?.status === 404 || error.response?.status === 403) {
        navigate('/agent/dashboard');
      } else {
        // For other errors, show error but don't navigate
        setChatSession(null);
      }
    } finally {
      setLoading(false);
      // #region debug log
      fetch('http://127.0.0.1:7242/ingest/2f137257-445b-4027-94f4-f63f4a70e66e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AgentChat.jsx:71',message:'loadChatSession finished',data:{loading:false,hasChatSession:!!chatSession},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
    }
  };

  const handleChatUpdate = (data) => {
    if (data.chatSessionId === chatId) {
      loadChatSession();
    }
    loadChatSessions();
  };

  const handleNewChat = () => {
    navigate('/agent/dashboard');
  };

  if (loading && chatId) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
      </div>
    );
  }

  if (!chatId && chatSessions.length > 0) {
    navigate(`/agent/chat/${chatSessions[0]._id}`);
    return null;
  }

  if (!chatId) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No chats available</p>
          <button
            onClick={() => navigate('/agent/dashboard')}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Show error state if chat session failed to load and we're not loading
  if (!loading && !chatSession) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Unable to load chat session</p>
          <button
            onClick={() => navigate('/agent/dashboard')}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // #region debug log
  useEffect(() => {
    fetch('http://127.0.0.1:7242/ingest/2f137257-445b-4027-94f4-f63f4a70e66e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AgentChat.jsx:132',message:'Rendering AgentChat return',data:{loading,chatId,hasChatSession:!!chatSession,chatSessionId:chatSession?._id,hasUser:!!user,hasSocket:!!socket},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
  }, [loading, chatId, chatSession, user, socket]);
  // #endregion

  return (
    <div className="h-screen flex bg-gray-50">
      <ChatSidebar
        chatSessions={chatSessions}
        currentChatId={chatId}
        onNewChat={handleNewChat}
        currentUser={user}
      />
      <div className="flex-1 flex flex-col">
        {chatSession && chatSession._id ? (
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

export default AgentChat;

