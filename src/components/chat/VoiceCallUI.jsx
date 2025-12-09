import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX, Monitor, Minimize2, Maximize2, X } from 'lucide-react';

const VoiceCallUI = ({
  isCallActive,
  isCallIncoming,
  isCallOutgoing,
  callStatus,
  remoteStream,
  localStream,
  screenShareStream,
  remoteScreenShareStream,
  isScreenSharing,
  isCallMinimized,
  otherUser,
  currentUser,
  otherUserOnline,
  onAccept,
  onReject,
  onEnd,
  onToggleMute,
  onToggleSpeaker,
  onStartScreenShare,
  onStopScreenShare,
  onToggleMinimize,
}) => {
  const remoteAudioRef = useRef(null);
  const localAudioRef = useRef(null);
  const ringtoneRef = useRef(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true); // true = speaker, false = earpiece
  const [callDuration, setCallDuration] = useState(0);
  const [availableAudioOutputs, setAvailableAudioOutputs] = useState([]);
  const [earpieceDeviceId, setEarpieceDeviceId] = useState(null);
  const [speakerDeviceId, setSpeakerDeviceId] = useState(null);
  const [isScreenShareMinimized, setIsScreenShareMinimized] = useState(false);
  const screenShareVideoRef = useRef(null);
  const remoteScreenShareVideoRef = useRef(null);

  // Get available audio outputs (for speaker/earpiece)
  useEffect(() => {
    const enumerateDevices = async () => {
      try {
        // Request permission to enumerate devices
        await navigator.mediaDevices.getUserMedia({ audio: true });
        
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioOutputs = devices.filter(device => device.kind === 'audiooutput');
        setAvailableAudioOutputs(audioOutputs);
        
        // Find earpiece (usually first device or device with 'earpiece' in label)
        const earpiece = audioOutputs.find(device => 
          device.label.toLowerCase().includes('earpiece') || 
          device.label.toLowerCase().includes('receiver') ||
          device.label.toLowerCase().includes('phone')
        ) || audioOutputs[0];
        
        // Find speaker (usually default or device with 'speaker' in label)
        const speaker = audioOutputs.find(device => 
          device.label.toLowerCase().includes('speaker') ||
          device.deviceId === 'default'
        ) || audioOutputs[audioOutputs.length - 1] || null;
        
        if (earpiece) setEarpieceDeviceId(earpiece.deviceId);
        if (speaker) setSpeakerDeviceId(speaker.deviceId);
        
        console.log('Available audio outputs:', audioOutputs);
        console.log('Earpiece device:', earpiece);
        console.log('Speaker device:', speaker);
      } catch (err) {
        console.error('Error enumerating devices:', err);
      }
    };
    
    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      enumerateDevices();
    }
  }, []);

  // Update remote audio when stream changes - CRITICAL for mobile
  useEffect(() => {
    if (remoteAudioRef.current && remoteStream) {
      console.log('Setting remote audio stream:', remoteStream);
      const audioElement = remoteAudioRef.current;
      
      // Set the stream
      audioElement.srcObject = remoteStream;
      
      // For mobile: ensure proper playback
      audioElement.setAttribute('playsinline', 'true');
      audioElement.setAttribute('webkit-playsinline', 'true');
      
      // Set initial audio output based on speaker state
      if (audioElement.setSinkId) {
        if (isSpeakerOn && speakerDeviceId) {
          audioElement.setSinkId(speakerDeviceId).catch(err => {
            console.log('Error setting initial speaker:', err);
          });
        } else if (!isSpeakerOn && earpieceDeviceId) {
          audioElement.setSinkId(earpieceDeviceId).catch(err => {
            console.log('Error setting initial earpiece:', err);
          });
        }
      }
      
      // Play with error handling
      const playPromise = audioElement.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log('Remote audio playing successfully');
            // Set volume
            audioElement.volume = 1.0;
          })
          .catch(err => {
            console.error('Error playing remote audio:', err);
            // Try again after user interaction
            setTimeout(() => {
              audioElement.play().catch(e => console.error('Retry failed:', e));
            }, 1000);
          });
      }
    }
  }, [remoteStream, isSpeakerOn, speakerDeviceId, earpieceDeviceId]);

  // Update local audio when stream changes (for echo cancellation testing)
  useEffect(() => {
    if (localAudioRef.current && localStream) {
      localAudioRef.current.srcObject = localStream;
      // Don't auto-play local audio to avoid feedback
      // localAudioRef.current.volume = 0; // Mute local audio
    }
  }, [localStream]);

  // Update screen share video when stream changes
  useEffect(() => {
    if (screenShareVideoRef.current && screenShareStream) {
      screenShareVideoRef.current.srcObject = screenShareStream;
      screenShareVideoRef.current.play().catch(err => {
        console.error('Error playing screen share:', err);
      });
    }
  }, [screenShareStream]);

  // Update remote screen share video when stream changes
  useEffect(() => {
    if (remoteScreenShareVideoRef.current && remoteScreenShareStream) {
      remoteScreenShareVideoRef.current.srcObject = remoteScreenShareStream;
      remoteScreenShareVideoRef.current.play().catch(err => {
        console.error('Error playing remote screen share:', err);
      });
    }
  }, [remoteScreenShareStream]);

  // Call duration timer - ONLY start when connected
  useEffect(() => {
    let interval = null;
    if (callStatus === 'connected' && remoteStream) {
      // Only start timer when call is actually connected
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [callStatus, remoteStream]);

  // Generate simple ringtone using Web Audio API (fallback)
  const generateRingtone = () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800; // Hz
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
      
      return audioContext;
    } catch (err) {
      console.error('Error generating ringtone:', err);
      return null;
    }
  };

  // Ringtone management
  useEffect(() => {
    const ringtone = ringtoneRef.current;
    let ringtoneInterval = null;
    let audioContext = null;

    // Play ringtone for incoming calls
    if (isCallIncoming && callStatus === 'ringing') {
      if (ringtone && ringtone.src) {
        // Try to play file-based ringtone
        ringtone.loop = true;
        ringtone.volume = 0.7;
        ringtone.play().catch(err => {
          console.log('File ringtone failed, using generated tone:', err);
          // Fallback to generated tone
          ringtoneInterval = setInterval(() => {
            audioContext = generateRingtone();
          }, 500);
        });
      } else {
        // Use generated tone
        ringtoneInterval = setInterval(() => {
          audioContext = generateRingtone();
        }, 500);
      }
    }
    // Play ringtone for outgoing calls (ringing status)
    else if (isCallOutgoing && callStatus === 'ringing') {
      if (ringtone && ringtone.src) {
        ringtone.loop = true;
        ringtone.volume = 0.5;
        ringtone.play().catch(err => {
          console.log('File ringtone failed, using generated tone:', err);
          ringtoneInterval = setInterval(() => {
            audioContext = generateRingtone();
          }, 500);
        });
      } else {
        ringtoneInterval = setInterval(() => {
          audioContext = generateRingtone();
        }, 500);
      }
    }
    // Stop ringtone when call is accepted, rejected, or ended
    else {
      if (ringtone) {
        ringtone.pause();
        ringtone.currentTime = 0;
      }
      if (ringtoneInterval) {
        clearInterval(ringtoneInterval);
      }
      if (audioContext) {
        audioContext.close();
      }
    }

    return () => {
      if (ringtone) {
        ringtone.pause();
        ringtone.currentTime = 0;
      }
      if (ringtoneInterval) {
        clearInterval(ringtoneInterval);
      }
      if (audioContext) {
        audioContext.close();
      }
    };
  }, [isCallIncoming, isCallOutgoing, callStatus]);

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

  const handleToggleSpeaker = async () => {
    const audioElement = remoteAudioRef.current;
    if (!audioElement) return;

    const newSpeakerState = !isSpeakerOn; // true = speaker, false = earpiece
    
    try {
      // For mobile devices: use setSinkId for proper speaker/earpiece switching
      if (audioElement.setSinkId) {
        if (newSpeakerState) {
          // Turn ON speaker - use speaker device or default
          if (speakerDeviceId) {
            await audioElement.setSinkId(speakerDeviceId);
          } else {
            // Use default (usually speaker)
            await audioElement.setSinkId('');
          }
          console.log('Audio output: Speaker');
        } else {
          // Turn OFF speaker = use EARPIECE
          if (earpieceDeviceId) {
            await audioElement.setSinkId(earpieceDeviceId);
          } else if (availableAudioOutputs.length > 0) {
            // Fallback to first device (usually earpiece on mobile)
            await audioElement.setSinkId(availableAudioOutputs[0].deviceId);
          }
          console.log('Audio output: Earpiece');
        }
      } else {
        // Fallback: use volume control for desktop/browsers without setSinkId
        audioElement.volume = newSpeakerState ? 1.0 : 0.7;
        console.log('Using volume fallback:', newSpeakerState ? 'Speaker' : 'Earpiece');
      }
    } catch (err) {
      console.error('Error setting audio sink:', err);
      // Fallback to volume control
      audioElement.volume = newSpeakerState ? 1.0 : 0.7;
    }

    setIsSpeakerOn(newSpeakerState);
    if (onToggleSpeaker) onToggleSpeaker(newSpeakerState);
  };

  // Removed black screen feature as per user request

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
          {/* Hidden audio elements - CRITICAL for mobile */}
          <audio 
            ref={remoteAudioRef} 
            autoPlay 
            playsInline
            webkit-playsinline="true"
            controls={false}
            style={{ display: 'none' }}
          />
          <audio 
            ref={localAudioRef} 
            autoPlay 
            playsInline 
            muted
            webkit-playsinline="true"
            controls={false}
            style={{ display: 'none' }}
          />

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
            <p className="text-green-100 text-lg mb-2">Incoming voice call</p>
            {/* Status based on online/offline */}
            <p className="text-green-200 text-sm mb-8">
              {otherUserOnline ? 'Ringing...' : 'Calling...'}
            </p>
            
            {/* Hidden ringtone */}
            <audio
              ref={ringtoneRef}
              src="/ringtone.mp3"
              preload="auto"
              loop
            />

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

  // Minimized call UI (floating window like WhatsApp)
  if (isCallMinimized && isCallActive && callStatus === 'connected') {
    return (
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-4 right-4 z-50 bg-blue-500 rounded-lg shadow-2xl p-3 flex items-center space-x-3"
      >
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-semibold">
          {otherUser?.name?.charAt(0)?.toUpperCase() || 'U'}
        </div>
        <div className="text-white">
          <p className="text-sm font-semibold">{otherUser?.name || 'User'}</p>
          <p className="text-xs opacity-80">{formatDuration(callDuration)}</p>
        </div>
        <button
          onClick={onToggleMinimize}
          className="p-1.5 hover:bg-white/20 rounded transition-colors"
        >
          <Maximize2 className="w-4 h-4 text-white" />
        </button>
        <button
          onClick={onEnd}
          className="p-1.5 bg-red-500 hover:bg-red-600 rounded transition-colors"
        >
          <PhoneOff className="w-4 h-4 text-white" />
        </button>
      </motion.div>
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
          className="fixed inset-0 z-50 flex flex-col bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700"
        >
          {/* Hidden audio elements - CRITICAL for mobile */}
          <audio 
            ref={remoteAudioRef} 
            autoPlay 
            playsInline
            controls={false}
            style={{ display: 'none' }}
          />
          <audio 
            ref={localAudioRef} 
            autoPlay 
            playsInline 
            muted
            controls={false}
            style={{ display: 'none' }}
          />

          {/* Screen Share Display - Mobile layout (takes 60-70% of screen) */}
          {(isScreenSharing || remoteScreenShareStream) && !isScreenShareMinimized && (
            <div className="flex-1 relative bg-black overflow-hidden min-h-0" style={{ flex: '0 0 70%' }}>
              {/* Screen Share Video */}
              <video
                ref={remoteScreenShareVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-contain"
                style={{ display: remoteScreenShareStream ? 'block' : 'none' }}
              />
              <video
                ref={screenShareVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-contain"
                style={{ display: screenShareStream ? 'block' : 'none' }}
              />
              
              {/* Screen Share Controls - Top Right */}
              <div className="absolute top-2 right-2 flex items-center space-x-1 z-10">
                <button
                  onClick={() => setIsScreenShareMinimized(true)}
                  className="p-1.5 bg-black/60 hover:bg-black/80 rounded transition-colors"
                  title="Minimize"
                >
                  <Minimize2 className="w-3.5 h-3.5 text-white" />
                </button>
                {isScreenSharing && (
                  <button
                    onClick={onStopScreenShare}
                    className="p-1.5 bg-red-500 hover:bg-red-600 rounded transition-colors"
                    title="Stop"
                  >
                    <X className="w-3.5 h-3.5 text-white" />
                  </button>
                )}
              </div>

              {/* Screen Share Label - Top Left */}
              <div className="absolute top-2 left-2 bg-black/60 px-2 py-1 rounded">
                <p className="text-white text-xs font-medium">Screen Share</p>
              </div>
            </div>
          )}

          {/* Minimized Screen Share (small floating window) */}
          {(isScreenSharing || remoteScreenShareStream) && isScreenShareMinimized && (
            <div className="absolute top-16 right-4 w-40 h-28 sm:w-48 sm:h-32 bg-black rounded-lg overflow-hidden shadow-2xl z-10 border-2 border-white/20">
              <video
                ref={remoteScreenShareVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-contain"
                style={{ display: remoteScreenShareStream ? 'block' : 'none' }}
              />
              <video
                ref={screenShareVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-contain"
                style={{ display: screenShareStream ? 'block' : 'none' }}
              />
              <div className="absolute top-1 right-1 flex items-center space-x-0.5">
                <button
                  onClick={() => setIsScreenShareMinimized(false)}
                  className="p-1 bg-black/60 hover:bg-black/80 rounded transition-colors"
                  title="Maximize"
                >
                  <Maximize2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
                </button>
                {isScreenSharing && (
                  <button
                    onClick={onStopScreenShare}
                    className="p-1 bg-red-500 hover:bg-red-600 rounded transition-colors"
                    title="Stop"
                  >
                    <X className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Call Info - Only show when screen share is minimized or not active */}
          <div className={`text-center px-6 w-full max-w-md flex-1 flex flex-col justify-center ${(isScreenSharing || remoteScreenShareStream) && !isScreenShareMinimized ? 'hidden' : 'flex'}`}>
            {/* Avatar - Only show when speaker is ON */}
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

            {/* Name - Only show when speaker is ON */}
            <h2 className="text-3xl font-bold mb-2 text-white">{otherUser?.name || 'Unknown'}</h2>
            
            {/* Call Status */}
            <div className="mb-8">
              {callStatus === 'calling' ? (
                <p className="text-blue-100 text-lg">
                  {otherUserOnline ? 'Ringing...' : 'Calling...'}
                </p>
              ) : callStatus === 'ringing' ? (
                <p className="text-blue-100 text-lg">Ringing...</p>
              ) : callStatus === 'connected' ? (
                <p className="text-blue-100 text-lg font-mono">{formatDuration(callDuration)}</p>
              ) : (
                <p className="text-blue-100 text-lg">{callStatus}</p>
              )}
            </div>
            
            {/* Hidden ringtone */}
            <audio
              ref={ringtoneRef}
              src="/ringtone.mp3"
              preload="auto"
              loop
            />

            {/* Control Buttons Bar - Always visible at bottom (like WhatsApp) */}
            <div className="absolute bottom-0 left-0 right-0 bg-blue-600/95 backdrop-blur-sm px-4 py-3 flex justify-center items-center space-x-3 sm:space-x-4 z-50">
              {/* Mute/Unmute */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleToggleMute}
                className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shadow-lg transition-colors ${
                  isMuted 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white'
                }`}
              >
                {isMuted ? <MicOff className="w-5 h-5 sm:w-6 sm:h-6" /> : <Mic className="w-5 h-5 sm:w-6 sm:h-6" />}
              </motion.button>

              {/* Speaker/Earpiece Toggle - WhatsApp style */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleToggleSpeaker}
                className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shadow-lg transition-all text-white ${
                  isSpeakerOn 
                    ? 'bg-white/40 hover:bg-white/50 backdrop-blur-sm ring-2 ring-white/50'
                    : 'bg-white/15 hover:bg-white/25 backdrop-blur-sm'
                }`}
                title={isSpeakerOn ? 'Speaker' : 'Earpiece'}
              >
                <Volume2 className="w-5 h-5 sm:w-6 sm:h-6" />
              </motion.button>

              {/* Screen Share Button - Only when connected */}
              {callStatus === 'connected' && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={isScreenSharing ? onStopScreenShare : onStartScreenShare}
                  className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shadow-lg transition-colors text-white ${
                    isScreenSharing
                      ? 'bg-green-500 hover:bg-green-600'
                      : 'bg-white/20 hover:bg-white/30 backdrop-blur-sm'
                  }`}
                  title={isScreenSharing ? 'Stop screen share' : 'Start screen share'}
                >
                  <Monitor className="w-5 h-5 sm:w-6 sm:h-6" />
                </motion.button>
              )}

              {/* Minimize Call Button */}
              {callStatus === 'connected' && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onToggleMinimize}
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shadow-lg transition-colors bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white"
                  title="Minimize call"
                >
                  <Minimize2 className="w-5 h-5 sm:w-6 sm:h-6" />
                </motion.button>
              )}

              {/* End Call */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onEnd}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-red-500 flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors text-white"
              >
                <PhoneOff className="w-6 h-6 sm:w-8 sm:h-8" />
              </motion.button>
            </div>

            {/* Status indicators */}
            <div className="flex justify-center space-x-2 mt-4">
              {isMuted && (
                <span className="text-xs bg-red-500/50 px-3 py-1 rounded-full text-white">Muted</span>
              )}
              {callStatus === 'connected' && remoteStream && (
                <span className="text-xs bg-green-500/50 px-3 py-1 rounded-full text-white">Connected</span>
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

export default VoiceCallUI;
