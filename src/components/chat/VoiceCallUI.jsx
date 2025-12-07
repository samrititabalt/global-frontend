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
  otherUserOnline,
  onAccept,
  onReject,
  onEnd,
  onToggleMute,
  onToggleSpeaker,
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

  // Active call UI (outgoing or connected)
  if (isCallActive && (isCallOutgoing || callStatus === 'connected')) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700"
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

          <div className="text-center px-6 w-full max-w-md">
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

            {/* Control Buttons - Always visible, positioned at bottom */}
            <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 flex justify-center items-center space-x-4 z-50">
              {/* Mute/Unmute */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleToggleMute}
                className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-colors ${
                  isMuted 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white'
                }`}
              >
                {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              </motion.button>

              {/* Speaker/Earpiece Toggle - WhatsApp style (highlighted when speaker ON) */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleToggleSpeaker}
                className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all text-white ${
                  isSpeakerOn 
                    ? 'bg-white/40 hover:bg-white/50 backdrop-blur-sm ring-2 ring-white/50' // Active/highlighted when speaker is ON
                    : 'bg-white/15 hover:bg-white/25 backdrop-blur-sm' // Dimmed when earpiece is ON
                }`}
                title={isSpeakerOn ? 'Speaker (tap for earpiece)' : 'Earpiece (tap for speaker)'}
              >
                <Volume2 className="w-6 h-6" />
              </motion.button>

              {/* End Call */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onEnd}
                className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors text-white"
              >
                <PhoneOff className="w-8 h-8" />
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
