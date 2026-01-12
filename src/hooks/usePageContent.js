import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../utils/axios';

/**
 * Custom hook to fetch and manage page content
 * @returns {object} { content, loading, error, refresh }
 */
export const usePageContent = () => {
  const location = useLocation();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchContent = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const pagePath = location.pathname === '/' ? 'home' : location.pathname.replace(/^\//, '');
      const response = await api.get(`/page-content/${pagePath}`);
      
      if (response.data.success) {
        setContent(response.data.content);
      } else {
        setContent(null);
      }
    } catch (err) {
      console.error('Error fetching page content:', err);
      setError(err.response?.data?.message || 'Failed to load page content');
      setContent(null);
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
  }, [location.pathname]);

  return { content, loading, error, refresh: fetchContent };
};

/**
 * Get content for a specific block
 * @param {object} pageContent - The page content object
 * @param {string} blockId - The block ID to retrieve
 * @returns {string|null} The content for the block or null if not found
 */
export const getBlockContent = (pageContent, blockId) => {
  if (!pageContent || !pageContent.contentBlocks) {
    return null;
  }
  
  const block = pageContent.contentBlocks.find(b => b.blockId === blockId);
  return block ? block.content : null;
};
