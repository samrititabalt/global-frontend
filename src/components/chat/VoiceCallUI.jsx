import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX, Minimize2 } from 'lucide-react';

const VoiceCallUI = ({
  isCallActive,
  isCallIncoming,
  isCallOutgoing,
  callStatus,
  remoteStream,
  localStream,
  isCallMinimized,
  callDuration = 0,
  otherUser,
  currentUser,
  otherUserOnline,
  onAccept,
  onReject,
  onEnd,
  onToggleMute,
  onToggleSpeaker,
  onToggleMinimize,
  onMuteStateChange,
  onSpeakerStateChange,
  onSpeakerToggleReady, // New prop: callback to expose toggle function
}) => {
  const remoteAudioRef = useRef(null);
  const localAudioRef = useRef(null);
  const ringtoneRef = useRef(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true); // true = speaker, false = earpiece
  const [availableAudioOutputs, setAvailableAudioOutputs] = useState([]);
  const [earpieceDeviceId, setEarpieceDeviceId] = useState(null);
  const [speakerDeviceId, setSpeakerDeviceId] = useState(null);

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

  // Note: callDuration is now managed by useWebRTC hook, not local state

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
      const newMuteState = !isMuted;
      localStream.getAudioTracks().forEach(track => {
        track.enabled = newMuteState;
      });
      setIsMuted(newMuteState);
      if (onToggleMute) onToggleMute(newMuteState);
      if (onMuteStateChange) onMuteStateChange(newMuteState);
    }
  };

  const handleToggleSpeaker = useCallback(async () => {
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
    if (onSpeakerStateChange) onSpeakerStateChange(newSpeakerState);
  }, [isSpeakerOn, speakerDeviceId, earpieceDeviceId, availableAudioOutputs, onToggleSpeaker, onSpeakerStateChange]);

  // Expose toggle function to parent component
  useEffect(() => {
    if (onSpeakerToggleReady) {
      onSpeakerToggleReady(handleToggleSpeaker);
    }
  }, [onSpeakerToggleReady, handleToggleSpeaker]);

  // Removed black screen feature as per user request

  const hiddenAudioLayer = (
    <>
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
      <audio
        ref={ringtoneRef}
        src="/ringtone.mp3"
        preload="auto"
        loop
        style={{ display: 'none' }}
      />
    </>
  );

  const shouldShowIncoming = isCallIncoming && !isCallMinimized;
  const shouldShowActiveOverlay =
    !isCallIncoming &&
    !isCallMinimized &&
    isCallActive &&
    (isCallOutgoing ||
      callStatus === 'ringing' ||
      callStatus === 'calling' ||
      callStatus === 'connected');

  const statusLabel = (() => {
    if (callStatus === 'connected') return 'On call';
    if (callStatus === 'ringing') return otherUserOnline ? 'Ringing...' : 'Calling...';
    if (callStatus === 'calling') return 'Calling...';
    return callStatus || 'Connecting...';
  })();

  const controlButtonBase =
    'w-14 h-14 rounded-2xl flex items-center justify-center border border-white/10 shadow-lg transition-all backdrop-blur-xl';

  return (
    <>
      {hiddenAudioLayer}

      <AnimatePresence>
        {shouldShowIncoming && (
          <motion.div
            key="incoming-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
          >
            <div className="absolute inset-0 bg-[#04070d]">
              <div className="absolute -top-32 -left-10 w-96 h-96 bg-emerald-500/30 blur-[140px]" />
              <div className="absolute -bottom-40 -right-10 w-96 h-96 bg-cyan-500/30 blur-[140px]" />
            </div>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 120, damping: 18 }}
              className="relative z-10 w-full max-w-md px-6"
            >
              <div className="rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-2xl shadow-2xl text-center text-white px-8 py-10 space-y-8">
                <div className="flex flex-col items-center gap-6 relative">
                  <div className="absolute inset-0 -z-10">
                    <div className="w-48 h-48 mx-auto bg-white/5 blur-[120px]" />
                  </div>
                  <div className="relative">
                    <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-emerald-400 to-sky-500 flex items-center justify-center text-4xl font-bold shadow-lg shadow-emerald-500/30">
                      {otherUser?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <motion.span
                      animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.2, 1] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="absolute inset-0 -m-3 rounded-[36px] border border-white/20"
                    />
                  </div>
                  <div>
                    <p className="text-3xl font-semibold">{otherUser?.name || 'Unknown user'}</p>
                    <p className="text-white/70 text-lg mt-1">
                      {otherUserOnline ? 'Ringing on their device' : 'Calling user'}
                    </p>
                    <p className="text-white/50 text-sm mt-2">Incoming voice call</p>
                  </div>
                </div>

                <div className="flex justify-center gap-6">
                  <motion.button
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onReject}
                    className={`${controlButtonBase} bg-red-500/80 hover:bg-red-500 text-white`}
                    title="Decline call"
                  >
                    <PhoneOff className="w-6 h-6" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onAccept}
                    className={`${controlButtonBase} bg-emerald-500 hover:bg-emerald-400 text-white`}
                    title="Answer call"
                  >
                    <Phone className="w-6 h-6" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {shouldShowActiveOverlay && (
          <motion.div
            key="active-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex items-center justify-center overflow-hidden"
          >
            <div className="absolute inset-0 bg-[#03050a]">
              <div className="absolute -top-40 -left-24 w-[28rem] h-[28rem] bg-fuchsia-600/20 blur-[160px]" />
              <div className="absolute -bottom-48 -right-10 w-[25rem] h-[25rem] bg-blue-500/20 blur-[150px]" />
            </div>

            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 120, damping: 18 }}
              className="relative z-10 w-full max-w-xl px-6"
            >
              <div className="rounded-[36px] border border-white/10 bg-white/5 backdrop-blur-3xl shadow-2xl px-10 py-12 text-center text-white space-y-8">
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-sky-500 to-indigo-500 flex items-center justify-center text-4xl font-bold shadow-xl shadow-sky-500/30">
                      {otherUser?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <motion.div
                      animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.2, 0.4] }}
                      transition={{ repeat: Infinity, duration: 3 }}
                      className="absolute inset-0 -m-4 rounded-[40px] border border-white/20"
                    />
                  </div>
                  <div>
                    <p className="text-3xl font-semibold">{otherUser?.name || 'Unknown user'}</p>
                    <p className="text-white/60 text-sm mt-1">
                      {otherUserOnline ? 'Online now' : 'Offline'}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap justify-center gap-3">
                  <span className="px-4 py-1.5 rounded-full border border-white/20 text-white/80 text-sm">
                    {statusLabel}
                  </span>
                  {callStatus === 'connected' && (
                    <span className="px-4 py-1.5 rounded-full border border-white/20 text-white font-mono text-sm">
                      {formatDuration(callDuration)}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap justify-center gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleToggleMute}
                    className={`${controlButtonBase} ${
                      isMuted
                        ? 'bg-red-500/80 text-white border-red-400/40'
                        : 'bg-white/5 hover:bg-white/10 text-white'
                    }`}
                    title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
                  >
                    {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleToggleSpeaker}
                    className={`${controlButtonBase} ${
                      isSpeakerOn
                        ? 'bg-white/20 text-white ring-2 ring-white/30'
                        : 'bg-white/5 hover:bg-white/10 text-white'
                    }`}
                    title={isSpeakerOn ? 'Switch to earpiece' : 'Switch to speaker'}
                  >
                    {isSpeakerOn ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
                  </motion.button>

                  {(callStatus === 'connected' || callStatus === 'ringing') && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={onToggleMinimize}
                      className={`${controlButtonBase} bg-white/5 hover:bg-white/10 text-white`}
                      title="Minimize call"
                    >
                      <Minimize2 className="w-6 h-6" />
                    </motion.button>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onEnd}
                    className={`${controlButtonBase} bg-red-500/80 hover:bg-red-500 text-white border-red-400/40`}
                    title="End call"
                  >
                    <PhoneOff className="w-6 h-6" />
                  </motion.button>
                </div>

                {isMuted && (
                  <p className="text-xs uppercase tracking-[0.2em] text-red-200">
                    Microphone muted
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default VoiceCallUI;
