import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PhoneOff, Maximize2, GripVertical, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';

const MinimizedCallWindow = ({ 
  otherUser, 
  callDuration, 
  callStatus, 
  onMaximize, 
  onEnd,
  onToggleMute,
  onToggleSpeaker,
  isMuted,
  isSpeakerOn
}) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const windowRef = useRef(null);
  const containerRef = useRef(null);

  // Initialize position to bottom-right
  useEffect(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setPosition({
        x: window.innerWidth - rect.width - 20,
        y: window.innerHeight - rect.height - 20
      });
    }
  }, []);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleMouseDown = (e) => {
    if (e.target.closest('button')) return; // Don't drag if clicking a button
    
    setIsDragging(true);
    const rect = windowRef.current.getBoundingClientRect();
    setDragStart({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;

    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;

    // Constrain to viewport
    const maxX = window.innerWidth - (windowRef.current?.offsetWidth || 280);
    const maxY = window.innerHeight - (windowRef.current?.offsetHeight || 80);

    setPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY))
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart]);

  // Touch support for mobile
  const handleTouchStart = (e) => {
    if (e.target.closest('button')) return;
    
    setIsDragging(true);
    const touch = e.touches[0];
    const rect = windowRef.current.getBoundingClientRect();
    setDragStart({
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top
    });
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();

    const touch = e.touches[0];
    const newX = touch.clientX - dragStart.x;
    const newY = touch.clientY - dragStart.y;

    const maxX = window.innerWidth - (windowRef.current?.offsetWidth || 280);
    const maxY = window.innerHeight - (windowRef.current?.offsetHeight || 80);

    setPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY))
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
      return () => {
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDragging, dragStart]);

  const getStatusText = () => {
    if (callStatus === 'connected') {
      return formatDuration(callDuration);
    } else if (callStatus === 'ringing') {
      return 'Ringing...';
    } else if (callStatus === 'calling') {
      return 'Calling...';
    }
    return 'Connecting...';
  };

  return (
    <motion.div
      ref={containerRef}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        zIndex: 9999,
        cursor: isDragging ? 'grabbing' : 'grab',
        touchAction: 'none'
      }}
      className="select-none"
    >
      <div
        ref={windowRef}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        className={`
          bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-2xl
          border-2 border-white/20 backdrop-blur-sm
          ${isDragging ? 'shadow-blue-500/50' : ''}
          transition-shadow duration-200
        `}
        style={{
          minWidth: '280px',
          maxWidth: '320px'
        }}
      >
        {/* Header with drag handle */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-white/20">
          <div className="flex items-center space-x-2 flex-1">
            <GripVertical className="w-4 h-4 text-white/60" />
            <div className="flex items-center space-x-2 flex-1 min-w-0">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                {otherUser?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white truncate">
                  {otherUser?.name || 'User'}
                </p>
                <p className="text-xs text-white/80">
                  {getStatusText()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between px-3 py-2.5 bg-white/5 gap-2">
          <button
            onClick={onMaximize}
            className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/20 hover:bg-white/30 transition-colors text-white flex-shrink-0"
            title="Maximize"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          
          {/* Mute button - only show when connected */}
          {callStatus === 'connected' && onToggleMute && (
            <button
              onClick={onToggleMute}
              className={`flex items-center justify-center w-9 h-9 rounded-lg transition-colors text-white flex-shrink-0 ${
                isMuted 
                  ? 'bg-red-500/50 hover:bg-red-500/70' 
                  : 'bg-white/20 hover:bg-white/30'
              }`}
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          )}

          {/* Speaker button - only show when connected */}
          {callStatus === 'connected' && onToggleSpeaker && (
            <button
              onClick={onToggleSpeaker}
              className={`flex items-center justify-center w-9 h-9 rounded-lg transition-colors text-white flex-shrink-0 ${
                isSpeakerOn 
                  ? 'bg-white/40 hover:bg-white/50' 
                  : 'bg-white/20 hover:bg-white/30'
              }`}
              title={isSpeakerOn ? 'Speaker' : 'Earpiece'}
            >
              {isSpeakerOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          )}
          
          {/* Status indicator */}
          <div className="flex items-center space-x-2 flex-1 justify-center">
            {callStatus === 'connected' && (
              <div className="flex items-center space-x-1 px-2 py-1 bg-green-500/30 rounded-full">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-white font-medium">Live</span>
              </div>
            )}
            {callStatus === 'ringing' && (
              <div className="flex items-center space-x-1 px-2 py-1 bg-yellow-500/30 rounded-full">
                <span className="text-xs text-white font-medium">Ringing...</span>
              </div>
            )}
            {callStatus === 'calling' && (
              <div className="flex items-center space-x-1 px-2 py-1 bg-blue-500/30 rounded-full">
                <span className="text-xs text-white font-medium">Calling...</span>
              </div>
            )}
          </div>

          <button
            onClick={onEnd}
            className="flex items-center justify-center w-9 h-9 rounded-lg bg-red-500 hover:bg-red-600 transition-colors text-white shadow-lg flex-shrink-0"
            title="End Call"
          >
            <PhoneOff className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default MinimizedCallWindow;
