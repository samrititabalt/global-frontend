import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Edit2, Save, X } from 'lucide-react';
import api from '../../utils/axios';
import { useLocation } from 'react-router-dom';

/**
 * EditableContent Component
 * Makes any text content editable for admin users
 * 
 * @param {string} blockId - Unique identifier for this content block
 * @param {string} blockType - Type of content (heading, paragraph, text, etc.)
 * @param {string} children - The text content to display/edit
 * @param {string} className - Additional CSS classes
 * @param {string} tag - HTML tag to render (h1, h2, p, span, etc.)
 * @param {object} metadata - Additional metadata for the content block
 */
const EditableContent = ({ 
  blockId, 
  blockType = 'text', 
  children, 
  className = '', 
  tag = 'span',
  metadata = {},
  ...props 
}) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(children || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const textareaRef = useRef(null);
  const isAdmin = isAuthenticated && user?.role === 'admin';

  // Update content when children prop changes
  useEffect(() => {
    setContent(children || '');
  }, [children]);

  // Focus textarea when editing starts
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  const handleEdit = () => {
    setIsEditing(true);
    setError(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setContent(children || '');
    setError(null);
  };

  const handleSave = async () => {
    if (!isAdmin) {
      setError('Only admins can edit content');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // Get current page path
      const pagePath = location.pathname === '/' ? 'home' : location.pathname.replace(/^\//, '');
      
      // Get existing content for this page
      const existingResponse = await api.get(`/page-content/${pagePath}`);
      const existingContent = existingResponse.data.content;
      
      // Prepare content blocks
      let contentBlocks = existingContent?.contentBlocks || [];
      
      // Find if this block already exists
      const blockIndex = contentBlocks.findIndex(block => block.blockId === blockId);
      
      const blockData = {
        blockId,
        blockType,
        content: content.trim(),
        htmlContent: content,
        metadata: {
          ...metadata,
          tag,
          className,
        },
      };

      if (blockIndex >= 0) {
        // Update existing block
        contentBlocks[blockIndex] = blockData;
      } else {
        // Add new block
        contentBlocks.push(blockData);
      }

      // Save to backend
      const response = await api.put(`/page-content/${pagePath}`, {
        contentBlocks,
      });

      if (response.data.success) {
        setIsEditing(false);
        // Optionally trigger a page refresh or update parent component
        window.dispatchEvent(new CustomEvent('contentUpdated', { 
          detail: { blockId, content: content.trim() } 
        }));
      } else {
        setError(response.data.message || 'Failed to save content');
      }
    } catch (err) {
      console.error('Error saving content:', err);
      setError(err.response?.data?.message || 'Failed to save content. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Don't show edit controls for non-admin users
  if (!isAdmin) {
    const Tag = tag;
    return <Tag className={className} {...props}>{content}</Tag>;
  }

  const Tag = tag;

  if (isEditing) {
    return (
      <div className={`editable-content-wrapper ${className}`} style={{ position: 'relative' }}>
        <Tag className={className} {...props} style={{ display: 'none' }}>
          {content}
        </Tag>
        <div className="editable-content-editor" style={{ 
          position: 'relative',
          zIndex: 1000,
          backgroundColor: 'white',
          border: '2px solid #3b82f6',
          borderRadius: '4px',
          padding: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        }}>
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full min-h-[60px] p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ 
              fontFamily: 'inherit',
              fontSize: 'inherit',
              lineHeight: 'inherit',
              resize: 'vertical',
            }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                handleCancel();
              } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                handleSave();
              }
            }}
          />
          <div className="flex items-center justify-end gap-2 mt-2">
            <button
              onClick={handleCancel}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1"
              disabled={saving}
            >
              <X size={14} />
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !content.trim()}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={14} />
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
          {error && (
            <div className="mt-2 text-sm text-red-600">{error}</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <span 
      className={`editable-content ${className}`}
      style={{ 
        position: 'relative',
        cursor: isAdmin ? 'pointer' : 'default',
      }}
      onMouseEnter={(e) => {
        if (isAdmin) {
          e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
        }
      }}
      onMouseLeave={(e) => {
        if (isAdmin) {
          e.currentTarget.style.backgroundColor = 'transparent';
        }
      }}
    >
      <Tag className={className} {...props}>
        {content}
      </Tag>
      {isAdmin && (
        <button
          onClick={handleEdit}
          className="edit-button"
          style={{
            position: 'absolute',
            top: '-8px',
            right: '-8px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            opacity: 0,
            transition: 'opacity 0.2s',
            zIndex: 10,
            fontSize: '12px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '1';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '0';
          }}
          title="Click to edit"
        >
          <Edit2 size={12} />
        </button>
      )}
    </span>
  );
};

export default EditableContent;
