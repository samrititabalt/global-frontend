import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Mic } from 'lucide-react';
import { motion } from 'framer-motion';

const VoiceNote = ({ url, isOwn, duration }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(duration || 0);
  const audioRef = useRef(null);
  const progressIntervalRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => {
      setCurrentTime(audio.currentTime);
      setTotalDuration(audio.duration || duration || 0);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };

    const handleLoadedMetadata = () => {
      setTotalDuration(audio.duration || duration || 0);
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [duration]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    } else {
      audio.play();
      setIsPlaying(true);
    }
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds) || seconds === 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Auto-play prevention
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.addEventListener('play', () => setIsPlaying(true));
      audio.addEventListener('pause', () => setIsPlaying(false));
    }
    return () => {
      if (audio) {
        audio.removeEventListener('play', () => setIsPlaying(true));
        audio.removeEventListener('pause', () => setIsPlaying(false));
      }
    };
  }, []);

  const progress = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;

  return (
    <div className={`flex items-center space-x-3 py-1 ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
      {/* Hidden audio element */}
      <audio 
        ref={audioRef} 
        src={url} 
        preload="metadata"
        onLoadedMetadata={(e) => {
          if (e.target.duration && !totalDuration) {
            setTotalDuration(e.target.duration);
          }
        }}
      />

      {/* Play/Pause Button */}
      <button
        onClick={togglePlay}
        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
          isOwn
            ? 'bg-white/20 hover:bg-white/30 text-white'
            : 'bg-blue-500 hover:bg-blue-600 text-white'
        }`}
      >
        {isPlaying ? (
          <Pause className="w-5 h-5" fill="currentColor" />
        ) : (
          <Play className="w-5 h-5 ml-0.5" fill="currentColor" />
        )}
      </button>

      {/* Waveform and Progress */}
      <div className="flex-1 min-w-0">
        {/* Waveform Visualization */}
        <div className={`relative h-14 rounded-lg overflow-hidden ${
          isOwn ? 'bg-white/10' : 'bg-gray-100'
        }`}>
          {/* Animated Waveform Bars */}
          <div className="absolute inset-0 flex items-center justify-center space-x-0.5 px-2">
            {Array.from({ length: 50 }).map((_, i) => {
              const baseHeight = 8;
              const variation = isPlaying ? Math.random() * 20 : Math.sin(i * 0.3) * 8;
              const barHeight = baseHeight + variation;
              const delay = i * 0.03;
              const opacity = isPlaying 
                ? 0.5 + Math.random() * 0.5 
                : 0.3 + Math.sin(i * 0.2) * 0.2;
              
              return (
                <motion.div
                  key={i}
                  className={`w-1 rounded-full ${
                    isOwn ? 'bg-white' : 'bg-blue-500'
                  }`}
                  animate={
                    isPlaying
                      ? {
                          height: `${barHeight}px`,
                          opacity: opacity,
                        }
                      : {
                          height: `${barHeight}px`,
                          opacity: Math.max(0.2, opacity * 0.7),
                        }
                  }
                  transition={{
                    duration: 0.2,
                    delay: delay,
                    repeat: isPlaying ? Infinity : 0,
                    repeatType: 'reverse',
                    ease: 'easeInOut',
                  }}
                  style={{ 
                    height: `${barHeight}px`,
                    minHeight: '4px'
                  }}
                />
              );
            })}
          </div>

          {/* Progress Bar Overlay */}
          <div
            className={`absolute bottom-0 left-0 h-full transition-all duration-100 ${
              isOwn ? 'bg-white/20' : 'bg-blue-500/20'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Time Display */}
        <div className={`flex items-center justify-between mt-1.5 text-xs font-medium ${
          isOwn ? 'text-white/90' : 'text-gray-600'
        }`}>
          <span>{formatTime(currentTime || 0)}</span>
          <span className="opacity-70">/ {formatTime(totalDuration || duration || 0)}</span>
        </div>
      </div>

      {/* Voice Note Icon */}
      <div className={`flex-shrink-0 ${isOwn ? 'text-white/60' : 'text-blue-500'}`}>
        <Mic className="w-5 h-5" />
      </div>
    </div>
  );
};

export default VoiceNote;
