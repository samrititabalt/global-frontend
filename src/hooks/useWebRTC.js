import { useRef, useState, useEffect } from 'react';

/**
 * WebRTC Hook for Voice Calls
 */
export const useWebRTC = (socket, chatSessionId, currentUserId) => {
  const [isCallActive, setIsCallActive] = useState(false);
  const [isCallIncoming, setIsCallIncoming] = useState(false);
  const [isCallOutgoing, setIsCallOutgoing] = useState(false);
  const [callStatus, setCallStatus] = useState('idle'); // idle, calling, ringing, connected, ended
  const [remoteStream, setRemoteStream] = useState(null);
  const [isCallMinimized, setIsCallMinimized] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [callStartTime, setCallStartTime] = useState(null);
  
  // Track if answer was received (for status updates)
  const answerReceivedRef = useRef(false);
  const isCleaningUpRef = useRef(false);
  
  const localStreamRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const callInitiatorRef = useRef(null);
  const callDurationIntervalRef = useRef(null);
  const iceStateTimeoutRef = useRef(null);
  const connectionStateTimeoutRef = useRef(null);

  // WebRTC Configuration
  const rtcConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ],
  };

  // Handle tab close/unload - end call automatically
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isCallActive) {
        // End call when tab is closing
        if (socket && chatSessionId) {
          const finalDuration = callStartTime ? Math.floor((Date.now() - callStartTime) / 1000) : callDuration;
          socket.emit('callEnded', { 
            chatSessionId, 
            duration: finalDuration,
            initiator: callInitiatorRef.current,
            currentUser: currentUserId
          });
        }
        // Cleanup
        if (localStreamRef.current) {
          localStreamRef.current.getTracks().forEach(track => track.stop());
        }
        if (peerConnectionRef.current) {
          peerConnectionRef.current.close();
        }
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden && isCallActive) {
        // Tab is hidden but call continues
        console.log('Tab hidden, call continues');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('unload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('unload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isCallActive, socket, chatSessionId, callStartTime, callDuration, currentUserId]);

  // Handle network disconnection
  useEffect(() => {
    const handleOnline = () => {
      console.log('Network reconnected');
    };

    const handleOffline = () => {
      console.log('Network disconnected');
      if (isCallActive) {
        // End call if network disconnects
        endCall();
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isCallActive]);

  useEffect(() => {
    if (!socket || !chatSessionId) return;

    const handleOffer = async (data) => {
      if (data.from === currentUserId) return;
      
      console.log('Received call offer from:', data.from);
      
      // Regular call offer
      // Guard: Don't process if call is already active (prevents re-calling)
      if (isCallActive && callStatus !== 'idle') {
        console.warn('Call offer received but call already active, ignoring');
        return;
      }
      
      setIsCallIncoming(true);
      setIsCallActive(true);
      setCallStatus('ringing');
      callInitiatorRef.current = data.from;

      // Store the offer for when user accepts
      // Don't auto-accept - wait for user to pick up
      try {
        // Create peer connection but don't send answer yet
        await createPeerConnection();
        
        // Store the offer
        if (peerConnectionRef.current) {
          await peerConnectionRef.current.setRemoteDescription(
            new RTCSessionDescription(data.offer)
          );
        }
      } catch (error) {
        console.error('Error handling offer:', error);
        endCall();
      }
    };

    const handleAnswer = async (data) => {
      if (data.from === currentUserId) return;

      try {
        // Guard: Don't process if call is already connected (prevents duplicate processing)
        if (callStatus === 'connected' && isCallActive) {
          console.warn('Answer received but call already connected, ignoring');
          return;
        }
        
        answerReceivedRef.current = true;
        await peerConnectionRef.current.setRemoteDescription(
          new RTCSessionDescription(data.answer)
        );
        // Status will be updated when connection state changes to 'connected'
        console.log('Answer received, waiting for connection...');
      } catch (error) {
        console.error('Error handling answer:', error);
        endCall();
      }
    };

    const handleIceCandidate = async (data) => {
      if (data.from === currentUserId) return;

      try {
        if (data.candidate) {
          await peerConnectionRef.current.addIceCandidate(
            new RTCIceCandidate(data.candidate)
          );
        }
      } catch (error) {
        console.error('Error handling ICE candidate:', error);
      }
    };

    const handleCallEnded = (data) => {
      // If other party ended the call, use their duration if provided
      const duration = data?.duration || null;
      endCall(duration);
    };

    socket.on('offer', handleOffer);
    socket.on('answer', handleAnswer);
    socket.on('ice-candidate', handleIceCandidate);
    socket.on('callEnded', handleCallEnded);

    return () => {
      socket.off('offer', handleOffer);
      socket.off('answer', handleAnswer);
      socket.off('ice-candidate', handleIceCandidate);
      socket.off('callEnded', handleCallEnded);
    };
  }, [socket, chatSessionId, currentUserId]);

  const createPeerConnection = async () => {
    try {
      const pc = new RTCPeerConnection(rtcConfiguration);

      // Handle remote stream - CRITICAL for audio
      pc.ontrack = (event) => {
        console.log('Received remote track:', event.track.kind);
        if (event.streams && event.streams[0]) {
          const stream = event.streams[0];
          remoteStreamRef.current = stream;
          setRemoteStream(stream);
          console.log('Remote stream set:', stream.getAudioTracks().length, 'audio tracks');
        } else if (event.track) {
          // Fallback: create stream from track
          const stream = new MediaStream([event.track]);
          remoteStreamRef.current = stream;
          setRemoteStream(stream);
          console.log('Remote stream created from track');
        }
      };

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate && socket) {
          socket.emit('ice-candidate', {
            chatSessionId,
            candidate: event.candidate,
          });
        }
      };

      // Handle ICE connection state - with edge case handling
      pc.oniceconnectionstatechange = () => {
        console.log('ICE connection state:', pc.iceConnectionState);
        
        // Clear any existing timeout
        if (iceStateTimeoutRef.current) {
          clearTimeout(iceStateTimeoutRef.current);
          iceStateTimeoutRef.current = null;
        }
        
        if (pc.iceConnectionState === 'failed') {
          console.warn('ICE connection failed - attempting to reconnect');
          // Try to restart ICE
          if (peerConnectionRef.current && peerConnectionRef.current.restartIce) {
            peerConnectionRef.current.restartIce();
          }
        } else if (pc.iceConnectionState === 'disconnected') {
          console.warn('ICE connection disconnected - waiting for reconnection');
          // Wait a bit before ending call in case it reconnects
          iceStateTimeoutRef.current = setTimeout(() => {
            if (peerConnectionRef.current && 
                peerConnectionRef.current.iceConnectionState === 'disconnected') {
              console.log('ICE still disconnected after timeout, ending call');
              endCall();
            }
            iceStateTimeoutRef.current = null;
          }, 5000); // Wait 5 seconds
        } else if (pc.iceConnectionState === 'closed') {
          console.log('ICE connection closed');
          endCall();
        } else if (pc.iceConnectionState === 'checking' && callStatus === 'calling') {
          setCallStatus('ringing');
        } else if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
          // Clear timeout if connection is restored
          if (iceStateTimeoutRef.current) {
            clearTimeout(iceStateTimeoutRef.current);
            iceStateTimeoutRef.current = null;
          }
        }
      };

      // Handle connection state changes - with edge case handling
      pc.onconnectionstatechange = () => {
        console.log('Peer connection state:', pc.connectionState);
        
        // Clear any existing connection state timeout
        if (connectionStateTimeoutRef.current) {
          clearTimeout(connectionStateTimeoutRef.current);
          connectionStateTimeoutRef.current = null;
        }
        
        if (pc.connectionState === 'failed') {
          console.warn('Connection failed - attempting to reconnect');
          // Try to reconnect by creating new offer/answer
          connectionStateTimeoutRef.current = setTimeout(() => {
            if (peerConnectionRef.current && 
                peerConnectionRef.current.connectionState === 'failed') {
              console.log('Connection still failed, ending call');
              endCall();
            }
            connectionStateTimeoutRef.current = null;
          }, 3000);
        } else if (pc.connectionState === 'disconnected') {
          console.warn('Connection disconnected - waiting for reconnection');
          // Wait before ending call
          connectionStateTimeoutRef.current = setTimeout(() => {
            if (peerConnectionRef.current && 
                peerConnectionRef.current.connectionState === 'disconnected') {
              console.log('Connection still disconnected, ending call');
              endCall();
            }
            connectionStateTimeoutRef.current = null;
          }, 5000);
        } else if (pc.connectionState === 'closed') {
          console.log('Connection closed');
          endCall();
        } else if (pc.connectionState === 'connected') {
          // Clear timeout if connection is restored
          if (connectionStateTimeoutRef.current) {
            clearTimeout(connectionStateTimeoutRef.current);
            connectionStateTimeoutRef.current = null;
          }
          setCallStatus('connected');
          setIsCallIncoming(false);
          setIsCallOutgoing(false);
          const startTime = Date.now();
          setCallStartTime(startTime);
          // Start call duration timer
          if (callDurationIntervalRef.current) {
            clearInterval(callDurationIntervalRef.current);
          }
          callDurationIntervalRef.current = setInterval(() => {
            setCallDuration(Math.floor((Date.now() - startTime) / 1000));
          }, 1000);
          console.log('Call connected successfully');
        }
      };

      peerConnectionRef.current = pc;
      return pc;
    } catch (error) {
      console.error('Error creating peer connection:', error);
      throw error;
    }
  };

  const setLocalStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000,
        },
        video: false,
      });

      localStreamRef.current = stream;
      console.log('Local stream obtained:', stream.getAudioTracks().length, 'audio tracks');

      // Add tracks to peer connection - CRITICAL for audio transfer
      if (peerConnectionRef.current) {
        stream.getAudioTracks().forEach((track) => {
          console.log('Adding local track:', track.kind, track.id);
          peerConnectionRef.current.addTrack(track, stream);
        });
        console.log('Local tracks added to peer connection');
      }

      return stream;
    } catch (error) {
      console.error('Error getting user media:', error);
      throw error;
    }
  };

  const startCall = async () => {
    if (!socket || !chatSessionId) {
      alert('Socket not connected');
      return;
    }

    // Prevent starting a new call if one is already active or cleaning up
    if (isCallActive || isCleaningUpRef.current) {
      console.log('Call already active or cleanup in progress');
      return;
    }

    try {
      // Reset any previous state
      setIsCallOutgoing(true);
      setIsCallActive(true);
      setCallStatus('calling');
      setCallDuration(0);
      setCallStartTime(null);
      callInitiatorRef.current = currentUserId;
      answerReceivedRef.current = false;

      // Create peer connection first
      await createPeerConnection();
      
      // Get local stream and add tracks
      await setLocalStream();

      // Create offer with audio only
      const offer = await peerConnectionRef.current.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: false,
      });

      // Set codec preferences for better audio quality
      if (offer.sdp) {
        // Prefer Opus codec for better quality
        offer.sdp = offer.sdp.replace(/a=rtpmap:(\d+) opus\/48000\/2/g, 'a=rtpmap:$1 opus/48000/2');
      }

      await peerConnectionRef.current.setLocalDescription(offer);

      socket.emit('offer', {
        chatSessionId,
        offer,
      });

      console.log('Call offer sent, waiting for answer...');
      
      // Set timeout for call (60 seconds)
      setTimeout(() => {
        if (callStatus === 'calling' || callStatus === 'ringing') {
          console.log('Call timeout, ending call');
          endCall();
        }
      }, 60000); // 60 seconds timeout
    } catch (error) {
      console.error('Error starting call:', error);
      alert('Failed to start call. Please check microphone permissions.');
      endCall();
    }
  };

  const acceptCall = async () => {
    try {
      if (!peerConnectionRef.current || !socket || !chatSessionId) {
        console.error('Cannot accept call: missing peer connection or socket');
        return;
      }

      setIsCallIncoming(false);
      setCallStatus('ringing'); // Will change to connected when answer is sent
      
      // Get local stream if not already set
      if (!localStreamRef.current) {
        await setLocalStream();
      }
      
      // Create and send answer
      const answer = await peerConnectionRef.current.createAnswer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: false,
      });

      // Set codec preferences
      if (answer.sdp) {
        answer.sdp = answer.sdp.replace(/a=rtpmap:(\d+) opus\/48000\/2/g, 'a=rtpmap:$1 opus/48000/2');
      }

      await peerConnectionRef.current.setLocalDescription(answer);

      console.log('Sending answer - call accepted');
      socket.emit('answer', {
        chatSessionId,
        answer,
      });
      
      // Status will change to 'connected' when connection state changes
    } catch (error) {
      console.error('Error accepting call:', error);
      endCall();
    }
  };

  const rejectCall = () => {
    if (socket && chatSessionId) {
      socket.emit('callEnded', { chatSessionId });
    }
    endCall();
  };

  const toggleCallMinimize = () => {
    setIsCallMinimized(prev => !prev);
  };

  const endCall = async (duration = null) => {
    // Prevent multiple cleanup calls
    if (isCleaningUpRef.current) {
      console.log('Cleanup already in progress');
      return;
    }
    isCleaningUpRef.current = true;

    // Clear all timers
    if (callDurationIntervalRef.current) {
      clearInterval(callDurationIntervalRef.current);
      callDurationIntervalRef.current = null;
    }
    if (iceStateTimeoutRef.current) {
      clearTimeout(iceStateTimeoutRef.current);
      iceStateTimeoutRef.current = null;
    }
    if (connectionStateTimeoutRef.current) {
      clearTimeout(connectionStateTimeoutRef.current);
      connectionStateTimeoutRef.current = null;
    }

    // Calculate final call duration
    const finalDuration = duration !== null ? duration : (callStartTime ? Math.floor((Date.now() - callStartTime) / 1000) : callDuration);
    
    // Stop local stream
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        track.stop();
        track.enabled = false;
      });
      localStreamRef.current = null;
    }

    // Close peer connection properly
    if (peerConnectionRef.current) {
      try {
        // Remove all tracks
        peerConnectionRef.current.getSenders().forEach(sender => {
          if (sender.track) {
            sender.track.stop();
          }
        });
        // Close connection
        peerConnectionRef.current.close();
      } catch (error) {
        console.error('Error closing peer connection:', error);
      }
      peerConnectionRef.current = null;
    }

    // Notify other party with call duration - ALWAYS send initiator info
    if (socket && chatSessionId) {
      const initiator = callInitiatorRef.current || currentUserId;
      socket.emit('callEnded', { 
        chatSessionId, 
        duration: finalDuration || 0,
        initiator: initiator,
        currentUser: currentUserId
      });
      console.log('Call ended event sent:', { duration: finalDuration, initiator, currentUser: currentUserId });
    }

    // Reset state after a small delay to ensure cleanup
    setTimeout(() => {
      setIsCallActive(false);
      setIsCallIncoming(false);
      setIsCallOutgoing(false);
      setCallStatus('idle');
      setRemoteStream(null);
      setIsCallMinimized(false);
      setCallDuration(0);
      setCallStartTime(null);
      remoteStreamRef.current = null;
      callInitiatorRef.current = null;
      answerReceivedRef.current = false;
      isCleaningUpRef.current = false;
      console.log('Call state fully reset, ready for new call');
    }, 200); // Increased delay to ensure proper cleanup
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clear all timers
      if (callDurationIntervalRef.current) {
        clearInterval(callDurationIntervalRef.current);
        callDurationIntervalRef.current = null;
      }
      if (iceStateTimeoutRef.current) {
        clearTimeout(iceStateTimeoutRef.current);
        iceStateTimeoutRef.current = null;
      }
      if (connectionStateTimeoutRef.current) {
        clearTimeout(connectionStateTimeoutRef.current);
        connectionStateTimeoutRef.current = null;
      }
      // Stop all media tracks
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => {
          track.stop();
          track.enabled = false;
        });
        localStreamRef.current = null;
      }
      // Close peer connection
      if (peerConnectionRef.current) {
        try {
          peerConnectionRef.current.getSenders().forEach(sender => {
            if (sender.track) {
              sender.track.stop();
            }
          });
          peerConnectionRef.current.close();
        } catch (error) {
          console.error('Error closing peer connection on unmount:', error);
        }
        peerConnectionRef.current = null;
      }
      // Clear remote stream ref
      remoteStreamRef.current = null;
    };
  }, []);

  return {
    isCallActive,
    isCallIncoming,
    isCallOutgoing,
    callStatus,
    remoteStream,
    localStream: localStreamRef.current,
    isCallMinimized,
    callDuration,
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleCallMinimize,
  };
};
