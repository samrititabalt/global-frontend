import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useEditMode } from './EditModeToggle';
import { Edit2, Save, X } from 'lucide-react';
import api from '../../utils/axios';
import { useLocation } from 'react-router-dom';

/**
 * EditableContent Component
 * Makes any text content editable for admin users
 * 
 * @param {string} blockId - Unique identifier for this content block (legacy alias for contentKey)
 * @param {string} contentKey - Unique identifier for this content block
 * @param {string} blockType - Type of content (heading, paragraph, text, etc.)
 * @param {string} children - The text content to display/edit
 * @param {string} className - Additional CSS classes
 * @param {string} tag - HTML tag to render (h1, h2, p, span, etc.)
 * @param {object} metadata - Additional metadata for the content block
 */
const EditableContent = ({ 
  blockId,
  contentKey,
  page,
  section = '',
  blockType = 'text', 
  children, 
  className = '', 
  tag = 'span',
  enableFormatting = false,
  allowBullets = false,
  fontSizeOptions = ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', '7xl', '8xl', '9xl', '10xl'],
  defaultFontSize = 'base',
  metadata = {},
  ...props 
}) => {
  const { user, isAuthenticated } = useAuth();
  const { isEditMode } = useEditMode();
  const location = useLocation();
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(children || '');
  const [fontSize, setFontSize] = useState(defaultFontSize);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const textareaRef = useRef(null);
  const isAdmin = isAuthenticated && user?.role === 'admin';

  // Update content when children prop changes
  const parseSizeMarker = (rawText) => {
    if (!enableFormatting || typeof rawText !== 'string') {
      return { text: rawText || '', size: defaultFontSize };
    }
    const match = rawText.match(/^\[size=(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl|10xl)\]\s*/i);
    if (match) {
      return {
        text: rawText.replace(match[0], ''),
        size: match[1].toLowerCase(),
      };
    }
    return { text: rawText || '', size: defaultFontSize };
  };

  useEffect(() => {
    const { text, size } = parseSizeMarker(children || '');
    setContent(text);
    setFontSize(size);
  }, [children, enableFormatting, defaultFontSize]);

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

    const resolvedContentKey = contentKey || blockId;
    if (!resolvedContentKey) {
      setError('Missing content key');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // Get current page path
      const pagePath = page || (location.pathname === '/' ? 'home' : location.pathname.replace(/^\//, '').replace(/\//g, '-'));

      const resolvedTextValue = enableFormatting
        ? `[size=${fontSize}] ${content.trim()}`
        : content.trim();

      const response = await api.put('/text-content', {
        contentKey: resolvedContentKey,
        page: pagePath,
        section: section || metadata.section || '',
        textValue: resolvedTextValue,
        blockType,
        metadata: {
          ...metadata,
          tag,
          className,
        },
      });

      if (response.data.success) {
        setIsEditing(false);
        // Optionally trigger a page refresh or update parent component
        window.dispatchEvent(new CustomEvent('contentUpdated', { 
          detail: { blockId: resolvedContentKey, content: content.trim() } 
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

  // Don't show edit controls for non-admin users or when not in edit mode
  if (!isAdmin || !isEditMode) {
    const Tag = tag;
    const fontSizeMap = {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
      '6xl': '3.75rem',
      '7xl': '4.5rem',
      '8xl': '6rem',
      '9xl': '8rem',
      '10xl': '10rem',
    };
    const formattedClassName = allowBullets
      ? `${className} whitespace-pre-line`
      : className;
    const formattedStyle = enableFormatting
      ? { ...(props.style || {}), fontSize: fontSizeMap[fontSize] || fontSizeMap.base }
      : props.style;
    return (
      <Tag className={formattedClassName} {...props} style={formattedStyle}>
        {content}
      </Tag>
    );
  }

  const Tag = tag;

  if (isEditing) {
    const applyBullets = () => {
      const lines = String(content)
        .split(/\r?\n/)
        .map((line) => line.replace(/^[-•]\s*/, '').trim())
        .filter(Boolean);
      if (!lines.length) {
        return;
      }
      setContent(lines.map((line) => `• ${line}`).join('\n'));
    };

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
          {enableFormatting && (
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <label className="text-xs font-semibold text-gray-600">
                Font size:
                <select
                  value={fontSize}
                  onChange={(e) => setFontSize(e.target.value)}
                  className="ml-2 text-xs border border-gray-300 rounded px-2 py-1"
                >
                  {fontSizeOptions.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </label>
              {allowBullets && (
                <button
                  type="button"
                  onClick={applyBullets}
                  className="text-xs px-2 py-1 rounded border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Add bullets
                </button>
              )}
            </div>
          )}
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

  // Handle click on the content itself when in edit mode
  const handleContentClick = (e) => {
    if (isAdmin && isEditMode && !isEditing) {
      e.preventDefault();
      e.stopPropagation();
      // Don't trigger if clicking the edit button
      if (!e.target.closest('.edit-button')) {
        handleEdit();
      }
    }
  };

  return (
    <span 
      className={`editable-content ${className}`}
      style={{ 
        position: 'relative',
        cursor: isAdmin && isEditMode ? 'pointer' : 'default',
        userSelect: isAdmin && isEditMode ? 'none' : 'auto',
        outline: isAdmin && isEditMode ? '2px dashed rgba(59, 130, 246, 0.3)' : 'none',
        outlineOffset: isAdmin && isEditMode ? '2px' : '0',
        borderRadius: isAdmin && isEditMode ? '4px' : '0',
        padding: isAdmin && isEditMode ? '2px' : '0',
        display: 'inline-block',
      }}
      onClick={handleContentClick}
      onMouseEnter={(e) => {
        if (isAdmin && isEditMode) {
          e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
          e.currentTarget.style.outlineColor = 'rgba(59, 130, 246, 0.5)';
        }
      }}
      onMouseLeave={(e) => {
        if (isAdmin && isEditMode) {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.outlineColor = 'rgba(59, 130, 246, 0.3)';
        }
      }}
    >
      <Tag className={className} {...props}>
        {content}
      </Tag>
      {isAdmin && isEditMode && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            handleEdit();
          }}
          className="edit-button"
          style={{
            position: 'absolute',
            top: '-10px',
            right: '-10px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: '2px solid white',
            borderRadius: '50%',
            width: '28px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            opacity: 1,
            transition: 'all 0.2s',
            zIndex: 1000,
            fontSize: '12px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.backgroundColor = '#2563eb';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.backgroundColor = '#3b82f6';
          }}
          title="Click to edit"
        >
          <Edit2 size={14} />
        </button>
      )}
    </span>
  );
};

export default EditableContent;
