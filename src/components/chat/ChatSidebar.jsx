import React, { useState } from 'react';
import { Search, MessageSquare, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ChatSidebar = ({ chatSessions, currentChatId, onNewChat }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const filteredChats = chatSessions.filter(chat => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      chat.service?.name?.toLowerCase().includes(query) ||
      chat.customer?.name?.toLowerCase().includes(query) ||
      chat.agent?.name?.toLowerCase().includes(query) ||
      chat.lastMessage?.content?.toLowerCase().includes(query)
    );
  });

  const formatTime = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m`;
    if (d.toDateString() === now.toDateString()) {
      return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    }
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getChatTitle = (chat) => {
    return chat.service?.name || chat.customer?.name || 'New Chat';
  };

  const getChatPreview = (chat) => {
    if (chat.lastMessage) {
      // Check for audio messages (voice notes)
      const hasAudio = chat.lastMessage.attachments?.some(att => att.type === 'audio') || 
                       chat.lastMessage.messageType === 'audio';
      
      if (hasAudio) {
        return '🎤 Voice chat';
      }
      
      // Check for other attachments
      if (chat.lastMessage.attachments && chat.lastMessage.attachments.length > 0) {
        const attachmentType = chat.lastMessage.attachments[0].type;
        if (attachmentType === 'image') {
          return '📷 Image';
        } else if (attachmentType === 'file') {
          return '📎 File';
        }
        return '📎 Attachment';
      }
      
      // Check for fileUrl (legacy attachment format)
      if (chat.lastMessage.fileUrl) {
        if (chat.lastMessage.messageType === 'image') {
          return '📷 Image';
        } else if (chat.lastMessage.messageType === 'audio') {
          return '🎤 Voice chat';
        } else if (chat.lastMessage.messageType === 'file') {
          return '📎 File';
        }
        return '📎 Attachment';
      }
      
      // Show message content if available
      if (chat.lastMessage.content) {
        // Truncate long messages
        return chat.lastMessage.content.length > 50 
          ? chat.lastMessage.content.substring(0, 50) + '...'
          : chat.lastMessage.content;
      }
      
      return 'No message';
    }
    return 'No messages yet';
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Chats</h2>
          <button
            onClick={onNewChat}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="New Chat"
          >
            <Plus className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {filteredChats.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No chats found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredChats.map((chat) => {
              const isActive = chat._id === currentChatId;
              const unreadCount = chat.unreadCount || 0;

              return (
                <button
                  key={chat._id}
                  onClick={() => navigate(`/customer/chat/${chat._id}`)}
                  className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                    isActive ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                        {getChatTitle(chat).charAt(0)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className={`font-semibold truncate ${
                          isActive ? 'text-blue-600' : 'text-gray-900'
                        }`}>
                          {getChatTitle(chat)}
                        </h3>
                        <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                          {formatTime(chat.updatedAt || chat.createdAt)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600 truncate">
                          {getChatPreview(chat)}
                        </p>
                        {unreadCount > 0 && (
                          <span className="bg-blue-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ml-2">
                            {unreadCount}
                          </span>
                        )}
                      </div>
                      {chat.status && (
                        <div className="mt-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            chat.status === 'active' ? 'bg-green-100 text-green-800' :
                            chat.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {chat.status}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;

