import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../utils/axios';

/**
 * Custom hook to fetch and manage page content
 * @returns {object} { content, loading, error, refresh }
 */
export const usePageContent = (pageOverride = null) => {
  const location = useLocation();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchContent = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const pagePath = pageOverride || (location.pathname === '/' ? 'home' : location.pathname.replace(/^\//, '').replace(/\//g, '-'));
      const response = await api.get(`/text-content/page/${pagePath}`);

      if (response.data.success) {
        setContent(response.data.content || []);
      } else {
        setContent([]);
      }
    } catch (err) {
      console.error('Error fetching page content:', err);
      setError(err.response?.data?.message || 'Failed to load page content');
      setContent([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
    
    // Listen for content updates
    const handleContentUpdate = () => {
      fetchContent();
    };
    
    window.addEventListener('contentUpdated', handleContentUpdate);
    
    return () => {
      window.removeEventListener('contentUpdated', handleContentUpdate);
    };
  }, [location.pathname, pageOverride]);

  return { content, loading, error, refresh: fetchContent };
};

/**
 * Get content for a specific block
 * @param {object} pageContent - The page content object
 * @param {string} blockId - The block ID to retrieve
 * @returns {string|null} The content for the block or null if not found
 */
export const getBlockContent = (pageContent, blockId) => {
  if (!pageContent || !Array.isArray(pageContent)) {
    return null;
  }

  const block = pageContent.find((b) => b.contentKey === blockId || b.blockId === blockId);
  return block ? (block.textValue ?? block.content) : null;
};
