/**
 * HeroVideoSection Component
 * 
 * ISOLATED COMPONENT - DO NOT MODIFY THIS FILE
 * This component is intentionally separated to prevent Cursor from overwriting the video implementation.
 * 
 * The video source is fetched from Cloudinary via the backend API.
 * This ensures the video persists across all Cursor commands.
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { API_CONFIG } from '../../config/api';
import EditableContent from '../admin/EditableContent';
import { usePageContent, getBlockContent } from '../../hooks/usePageContent';

const HeroVideoSection = () => {
  const [videoUrl, setVideoUrl] = useState(null);
  const [videoExists, setVideoExists] = useState(false);
  const [checkingVideo, setCheckingVideo] = useState(true);
  const { content: pageContent } = usePageContent();
  
  // Get editable content for hero text
  const heroTitle = getBlockContent(pageContent, 'hero-title') || 'Building Tomorrow of UK Small Businesses';
  const heroSubtitle = getBlockContent(pageContent, 'hero-subtitle') || 'Sam Studios is the automation unit of Tabalt Ltd.';

  useEffect(() => {
    // Check if video exists via public API endpoint
    const checkVideoExists = async () => {
      try {
        setCheckingVideo(true);
        const response = await fetch(`${API_CONFIG.API_URL}/public/homepage-video`);
        const data = await response.json();
        
        console.log('[HeroVideoSection] API response:', data);
        
        // Check for videoUrl (Cloudinary) or videoPath (local fallback)
        const videoSource = data.videoUrl || data.videoPath;
        
        if (data.success && data.exists && videoSource) {
          setVideoExists(true);
          // If it's a relative path, construct full URL
          if (videoSource.startsWith('/')) {
            const apiUrl = API_CONFIG.API_URL;
            let baseUrl = '';
            if (apiUrl.startsWith('/') || apiUrl.startsWith('http://localhost') || apiUrl.includes('localhost')) {
              baseUrl = '';
            } else {
              baseUrl = apiUrl.replace(/\/api\/?$/, '').replace(/\/$/, '');
            }
            setVideoUrl(`${baseUrl}${videoSource}`);
          } else {
            // Cloudinary URL or full URL
            setVideoUrl(videoSource);
          }
          console.log('[HeroVideoSection] Video URL set:', videoSource);
        } else {
          console.warn('[HeroVideoSection] No video found. Response:', data);
          setVideoExists(false);
          setVideoUrl(null);
        }
      } catch (error) {
        console.error('[HeroVideoSection] Error checking video existence:', error);
        setVideoExists(false);
        setVideoUrl(null);
      } finally {
        setCheckingVideo(false);
      }
    };
    
    checkVideoExists();
  }, []);

  return (
    <section className="relative w-full h-screen overflow-hidden" style={{ marginTop: 0, paddingTop: 0 }}>
      {/* Fallback background image - ONLY shows if video doesn't exist or fails to load after verification */}
      {(!videoExists || !videoUrl) && !checkingVideo && (
        <div 
          className="absolute inset-0 w-full h-full bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1920&h=1080&fit=crop)'
          }}
        />
      )}
      
      {/* Video Background - Uploaded video from Cloudinary - ALWAYS show if exists */}
      {videoExists && videoUrl && (
        <video
          key={videoUrl}
          className="absolute inset-0 w-full h-full object-cover z-[1]"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          style={{ objectFit: 'cover' }}
          onError={(e) => {
            // If video fails to load, hide it and show fallback
            console.error('Video failed to load:', videoUrl);
            setVideoExists(false);
            e.target.style.display = 'none';
          }}
          onLoadedData={() => {
            console.log('Video loaded successfully:', videoUrl);
          }}
        >
          <source src={videoUrl} type="video/mp4" />
          <source src={videoUrl.replace('.mp4', '.mov')} type="video/quicktime" />
          <source src={videoUrl.replace('.mp4', '.webm')} type="video/webm" />
          Your browser does not support the video tag.
        </video>
      )}
      
      {/* Dark Overlay for Text Readability */}
      <div className="absolute inset-0 bg-black/50 z-[2]"></div>
      
      {/* Overlay Text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto"
        >
          <EditableContent
            blockId="hero-title"
            blockType="heading"
            tag="h1"
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-medium text-white mb-6 leading-tight tracking-tight drop-shadow-lg"
          >
            {heroTitle}
          </EditableContent>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <EditableContent
              blockId="hero-subtitle"
              blockType="paragraph"
              tag="p"
              className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-white font-light leading-relaxed drop-shadow-lg"
            >
              {heroSubtitle}
              <span className="inline-flex align-top ml-1">
                <img
                  src="/assets/Tabalt%20SamStudios.png"
                  alt="Tabalt"
                  className="h-4 w-4 object-contain opacity-80"
                />
              </span>
            </EditableContent>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroVideoSection;
