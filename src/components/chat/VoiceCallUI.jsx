import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';

const VoiceCallUI = ({
  isCallActive,
  isCallIncoming,
  isCallOutgoing,
  callStatus,
  remoteStream,
  localStream,
  otherUser,
  currentUser,
  onAccept,
  onReject,
  onEnd,
  onToggleMute,
  onToggleSpeaker,
}) => {
  const remoteAudioRef = useRef(null);
  const localAudioRef = useRef(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);

  // Update remote audio when stream changes
  useEffect(() => {
    if (remoteAudioRef.current && remoteStream) {
      console.log('Setting remote audio stream:', remoteStream);
      remoteAudioRef.current.srcObject = remoteStream;
      remoteAudioRef.current.play().catch(err => {
        console.error('Error playing remote audio:', err);
      });
    }
  }, [remoteStream]);

  // Update local audio when stream changes (for echo cancellation testing)
  useEffect(() => {
    if (localAudioRef.current && localStream) {
      localAudioRef.current.srcObject = localStream;
      // Don't auto-play local audio to avoid feedback
      // localAudioRef.current.volume = 0; // Mute local audio
    }
  }, [localStream]);

  // Call duration timer
  useEffect(() => {
    let interval = null;
    if (callStatus === 'connected') {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [callStatus]);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleToggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = isMuted;
      });
      setIsMuted(!isMuted);
      if (onToggleMute) onToggleMute(!isMuted);
    }
  };

  const handleToggleSpeaker = () => {
    if (remoteAudioRef.current) {
      remoteAudioRef.current.volume = isSpeakerOn ? 0.5 : 1.0;
      setIsSpeakerOn(!isSpeakerOn);
      if (onToggleSpeaker) onToggleSpeaker(!isSpeakerOn);
    }
  };

  // Incoming call UI
  if (isCallIncoming) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-gradient-to-br from-green-500 via-green-600 to-green-700 z-50 flex items-center justify-center"
        >
          {/* Hidden audio elements */}
          <audio ref={remoteAudioRef} autoPlay playsInline />
          <audio ref={localAudioRef} autoPlay playsInline muted />

          <div className="text-center text-white px-6">
            {/* Avatar */}
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="mb-8"
            >
              <div className="w-32 h-32 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-4xl font-bold mx-auto mb-4 ring-4 ring-white/30">
                {otherUser?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute inset-0 w-32 h-32 rounded-full bg-white/10 mx-auto"
                style={{ marginTop: '-8rem' }}
              />
            </motion.div>

            {/* Name */}
            <h2 className="text-3xl font-bold mb-2">{otherUser?.name || 'Unknown'}</h2>
            <p className="text-green-100 text-lg mb-8">Incoming voice call</p>

            {/* Action Buttons */}
            <div className="flex justify-center space-x-6">
              {/* Reject */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onReject}
                className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
              >
                <PhoneOff className="w-8 h-8" />
              </motion.button>

              {/* Accept */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onAccept}
                className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-lg hover:bg-green-50 transition-colors"
              >
                <Phone className="w-8 h-8 text-green-600" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // Active call UI (outgoing or connected)
  if (isCallActive && (isCallOutgoing || callStatus === 'connected')) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 z-50 flex items-center justify-center"
        >
          {/* Hidden audio elements */}
          <audio 
            ref={remoteAudioRef} 
            autoPlay 
            playsInline 
            volume={isSpeakerOn ? 1.0 : 0.5}
          />
          <audio ref={localAudioRef} autoPlay playsInline muted />

          <div className="text-center text-white px-6 w-full max-w-md">
            {/* Avatar */}
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 3 }}
              className="mb-8 relative"
            >
              <div className="w-40 h-40 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-5xl font-bold mx-auto mb-4 ring-4 ring-white/30">
                {otherUser?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              {/* Pulsing rings */}
              <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute inset-0 w-40 h-40 rounded-full bg-white/20 mx-auto"
                style={{ marginTop: '-10rem', marginLeft: '50%', transform: 'translateX(-50%)' }}
              />
            </motion.div>

            {/* Name */}
            <h2 className="text-3xl font-bold mb-2">{otherUser?.name || 'Unknown'}</h2>
            
            {/* Call Status */}
            <div className="mb-8">
              {callStatus === 'calling' || callStatus === 'ringing' ? (
                <p className="text-blue-100 text-lg">Calling...</p>
              ) : callStatus === 'connected' ? (
                <p className="text-blue-100 text-lg font-mono">{formatDuration(callDuration)}</p>
              ) : (
                <p className="text-blue-100 text-lg">{callStatus}</p>
              )}
            </div>

            {/* Control Buttons */}
            <div className="flex justify-center items-center space-x-4 mb-6">
              {/* Mute/Unmute */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleToggleMute}
                className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-colors ${
                  isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-white/20 hover:bg-white/30 backdrop-blur-sm'
                }`}
              >
                {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              </motion.button>

              {/* Speaker */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleToggleSpeaker}
                className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-colors ${
                  isSpeakerOn ? 'bg-white/20 hover:bg-white/30 backdrop-blur-sm' : 'bg-white/10 hover:bg-white/20 backdrop-blur-sm'
                }`}
              >
                {isSpeakerOn ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
              </motion.button>

              {/* End Call */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onEnd}
                className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
              >
                <PhoneOff className="w-8 h-8" />
              </motion.button>
            </div>

            {/* Status indicators */}
            <div className="flex justify-center space-x-2 mt-4">
              {isMuted && (
                <span className="text-xs bg-red-500/50 px-3 py-1 rounded-full">Muted</span>
              )}
              {callStatus === 'connected' && remoteStream && (
                <span className="text-xs bg-green-500/50 px-3 py-1 rounded-full">Connected</span>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  return null;
};

export default VoiceCallUI;
