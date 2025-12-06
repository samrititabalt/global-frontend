import React from 'react';
import { motion } from 'framer-motion';
import { X, Check, Edit, Trash2, Reply, MoreVertical, FileText, CheckCheck } from 'lucide-react';
import { useSwipe } from '../../hooks/useSwipe';
import { useLongPress } from '../../hooks/useLongPress';
import VoiceNote from './VoiceNote';

const MessageItem = ({
  message,
  isOwn,
  isSelected,
  isSelectionMode,
  editContent,
  setEditContent,
  onDelete,
  onReply,
  onSelect,
  onLongPress,
  currentUser,
  editingMessageId,
  handleSaveEdit,
  handleCancelEdit,
  onReplyClick, // New prop for handling reply click
}) => {
  const swipeRef = useSwipe(
    null, // left swipe
    () => !isSelectionMode && !message.isDeleted && onReply(message), // right swipe to reply
    50
  );

  const longPressHandlers = useLongPress(
    () => !isSelectionMode && onLongPress(message),
    300
  );

  return (
    <div
      ref={swipeRef}
      {...longPressHandlers}
      onClick={() => {
        if (isSelectionMode) {
          onSelect(message._id);
        }
      }}
      className={`rounded-2xl px-4 py-2 transition-all relative ${
        isSelected
          ? 'ring-2 ring-blue-500 bg-blue-50'
          : message.isDeleted
          ? 'bg-gray-200 text-gray-500 italic'
          : isOwn
          ? 'bg-blue-500 text-white rounded-br-sm'
          : 'bg-white text-gray-900 rounded-bl-sm border border-gray-200'
      } ${isSelectionMode ? 'cursor-pointer' : ''}`}
    >
      {/* Reply Preview - Clickable to scroll to original message */}
      {message.replyTo && !message.isDeleted && (
        <div 
          onClick={(e) => {
            e.stopPropagation();
            if (onReplyClick && typeof message.replyTo === 'object' && message.replyTo._id) {
              onReplyClick(message.replyTo._id);
            }
          }}
          className={`mb-2 pb-2 border-l-2 ${
            isOwn ? 'border-white/50' : 'border-blue-500'
          } pl-2 cursor-pointer hover:opacity-80 transition-opacity`}
          title="Click to view original message"
        >
          <div className={`text-xs font-semibold mb-1 ${
            isOwn ? 'text-white/80' : 'text-blue-600'
          }`}>
            {typeof message.replyTo === 'object' && message.replyTo.sender
              ? (message.replyTo.sender._id?.toString() === currentUser?._id?.toString()
                  ? 'You'
                  : message.replyTo.sender.name || 'User')
              : 'Replying to'}
          </div>
          <div className={`text-xs truncate ${
            isOwn ? 'text-white/70' : 'text-gray-600'
          }`}>
            {message.replyTo.content || 
             (message.replyTo.attachments?.[0]?.type === 'image' ? '📷 Image' :
              message.replyTo.attachments?.[0]?.type === 'audio' ? '🎤 Audio' :
              message.replyTo.attachments?.[0]?.type === 'file' ? '📎 File' :
              message.replyTo.fileUrl ? '📎 Attachment' : 'Message')}
          </div>
        </div>
      )}

      {/* Selection Checkbox */}
      {isSelectionMode && (
        <div className="absolute -left-8 top-1/2 -translate-y-1/2">
          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
            isSelected
              ? 'bg-blue-500 border-blue-500'
              : 'border-gray-300'
          }`}>
            {isSelected && (
              <Check className="w-3 h-3 text-white" />
            )}
          </div>
        </div>
      )}

      {/* Attachments */}
      {!message.isDeleted && ((message.attachments && message.attachments.length > 0) || message.fileUrl) && (
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
                <VoiceNote 
                  url={att.url} 
                  isOwn={isOwn}
                  duration={att.duration}
                />
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
                <VoiceNote 
                  url={message.fileUrl} 
                  isOwn={isOwn}
                />
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
      )}

      {/* Message Content */}
      {message.isDeleted ? (
        <div className="flex items-center space-x-2">
          <X className="w-4 h-4" />
          <span className="text-sm">This message was deleted</span>
        </div>
      ) : editingMessageId === message._id ? (
        <div className="space-y-2">
          <textarea
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

      {/* Message Footer: Time, Status Ticks, and Labels */}
      <div className={`flex items-center justify-end mt-1 space-x-1 text-xs ${isOwn ? 'text-white/70' : 'text-gray-500'}`}>
        {/* Edited Label */}
        {message.isEdited && !message.isDeleted && (
          <span className="italic">
            Edited
          </span>
        )}
        
        {/* Message Status Ticks (WhatsApp style) - Only for own messages */}
        {isOwn && !message.isDeleted && (
          <div className="flex items-center ml-1">
            {message.isRead ? (
              // Double blue tick - Message read (light blue on blue background)
              <CheckCheck className="w-4 h-4 text-blue-200" fill="currentColor" />
            ) : (
              // Double gray tick - Message delivered but not read (white/60 on blue background)
              <CheckCheck className="w-4 h-4 text-white/60" />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageItem;
