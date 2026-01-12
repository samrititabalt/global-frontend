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

const HeroVideoSection = () => {
  const [videoUrl, setVideoUrl] = useState(null);
  const [videoExists, setVideoExists] = useState(false);
  const [checkingVideo, setCheckingVideo] = useState(true);

  useEffect(() => {
    // Check if video exists via public API endpoint
    const checkVideoExists = async () => {
      try {
        setCheckingVideo(true);
        const response = await fetch(`${API_CONFIG.API_URL}/public/homepage-video`);
        const data = await response.json();
        
        if (data.success && data.exists && data.videoUrl) {
          setVideoExists(true);
          setVideoUrl(data.videoUrl);
        } else {
          setVideoExists(false);
          setVideoUrl(null);
        }
      } catch (error) {
        console.error('Error checking video existence:', error);
        setVideoExists(false);
        setVideoUrl(null);
      } finally {
        setCheckingVideo(false);
      }
    };
    
    checkVideoExists();
  }, []);

  return (
    <section className="relative w-full h-screen overflow-hidden">
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
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-medium text-white mb-6 leading-tight tracking-tight">
            Building Tomorrow of UK Small Businesses
          </h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-white font-light leading-relaxed"
          >
            Sam Studios is the automation unit of Tabalt Ltd.
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroVideoSection;
