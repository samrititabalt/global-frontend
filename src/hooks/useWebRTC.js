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
  const [screenShareStream, setScreenShareStream] = useState(null);
  const [remoteScreenShareStream, setRemoteScreenShareStream] = useState(null);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isCallMinimized, setIsCallMinimized] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [callStartTime, setCallStartTime] = useState(null);
  
  // Track if answer was received (for status updates)
  const answerReceivedRef = useRef(false);
  const isCleaningUpRef = useRef(false);
  
  const localStreamRef = useRef(null);
  const screenShareStreamRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const callInitiatorRef = useRef(null);
  const callDurationIntervalRef = useRef(null);

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
        if (screenShareStreamRef.current) {
          screenShareStreamRef.current.getTracks().forEach(track => track.stop());
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
      
      console.log('Received offer from:', data.from, 'isRenegotiation:', data.isRenegotiation);
      
      // CRITICAL: Handle renegotiation FIRST (for screen share) - DO NOT change call state
      if (data.isRenegotiation) {
        // STRICT GUARD: Only process renegotiation if call is already connected
        // This prevents any state changes during screen share
        if (!peerConnectionRef.current || callStatus !== 'connected' || !isCallActive) {
          console.warn('Renegotiation offer received but call not connected, ignoring');
          return; // Ignore renegotiation if call isn't connected
        }
        
        try {
          console.log('Processing screen share renegotiation offer - NO state change');
          // Set remote description for renegotiation
          await peerConnectionRef.current.setRemoteDescription(
            new RTCSessionDescription(data.offer)
          );
          
          // Create and send answer for renegotiation
          const answer = await peerConnectionRef.current.createAnswer({
            offerToReceiveAudio: true,
            offerToReceiveVideo: true,
          });
          
          await peerConnectionRef.current.setLocalDescription(answer);
          
          // Send renegotiation answer with flag
          socket.emit('answer', {
            chatSessionId,
            answer,
            isRenegotiation: true // CRITICAL: Prevents state change on sender side
          });
          
          console.log('Renegotiation answer sent - screen share will be visible');
          return; // Exit early - do NOT change ANY call state
        } catch (error) {
          console.error('Error handling renegotiation offer:', error);
          // Don't end call on renegotiation error, just log it
          return;
        }
      }
      
      // Regular call offer - only process if NOT a renegotiation
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
        // CRITICAL: Handle renegotiation answer FIRST (for screen share) - DO NOT change call state
        if (data.isRenegotiation) {
          // STRICT GUARD: Only process if call is already connected
          if (!peerConnectionRef.current || callStatus !== 'connected' || !isCallActive) {
            console.warn('Renegotiation answer received but call not connected, ignoring');
            return;
          }
          
          // Set remote description for renegotiation - NO state changes
          await peerConnectionRef.current.setRemoteDescription(
            new RTCSessionDescription(data.answer)
          );
          console.log('Renegotiation answer received and set - screen share active, NO state change');
          return; // Exit early - do NOT change ANY call state
        }
        
        // Regular answer - only process if NOT a renegotiation and call is not connected
        if (!data.isRenegotiation) {
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
        }
      } catch (error) {
        console.error('Error handling answer:', error);
        // Only end call if it's NOT a renegotiation
        if (!data.isRenegotiation) {
          endCall();
        }
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

      // Handle remote stream - CRITICAL for audio and screen share
      pc.ontrack = (event) => {
        console.log('Received remote track:', event.track.kind, event.track.id);
        if (event.streams && event.streams[0]) {
          const stream = event.streams[0];
          
          // Check if it's a video track (screen share) or audio track
          if (event.track.kind === 'video') {
            // This is screen share
            setRemoteScreenShareStream(stream);
            console.log('Remote screen share stream received');
          } else if (event.track.kind === 'audio') {
            // This is audio
            remoteStreamRef.current = stream;
            setRemoteStream(stream);
            console.log('Remote audio stream set:', stream.getAudioTracks().length, 'audio tracks');
          }
        } else if (event.track) {
          // Fallback: create stream from track
          const stream = new MediaStream([event.track]);
          if (event.track.kind === 'video') {
            setRemoteScreenShareStream(stream);
          } else {
            remoteStreamRef.current = stream;
            setRemoteStream(stream);
          }
          console.log('Remote stream created from track:', event.track.kind);
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
      let iceStateTimeout = null;
      pc.oniceconnectionstatechange = () => {
        console.log('ICE connection state:', pc.iceConnectionState);
        
        // Clear any existing timeout
        if (iceStateTimeout) {
          clearTimeout(iceStateTimeout);
          iceStateTimeout = null;
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
          iceStateTimeout = setTimeout(() => {
            if (peerConnectionRef.current && 
                peerConnectionRef.current.iceConnectionState === 'disconnected') {
              console.log('ICE still disconnected after timeout, ending call');
              endCall();
            }
          }, 5000); // Wait 5 seconds
        } else if (pc.iceConnectionState === 'closed') {
          console.log('ICE connection closed');
          endCall();
        } else if (pc.iceConnectionState === 'checking' && callStatus === 'calling') {
          setCallStatus('ringing');
        } else if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
          // Clear timeout if connection is restored
          if (iceStateTimeout) {
            clearTimeout(iceStateTimeout);
            iceStateTimeout = null;
          }
        }
      };

      // Handle connection state changes - with edge case handling
      pc.onconnectionstatechange = () => {
        console.log('Peer connection state:', pc.connectionState);
        if (pc.connectionState === 'failed') {
          console.warn('Connection failed - attempting to reconnect');
          // Try to reconnect by creating new offer/answer
          setTimeout(() => {
            if (peerConnectionRef.current && 
                peerConnectionRef.current.connectionState === 'failed') {
              console.log('Connection still failed, ending call');
              endCall();
            }
          }, 3000);
        } else if (pc.connectionState === 'disconnected') {
          console.warn('Connection disconnected - waiting for reconnection');
          // Wait before ending call
          setTimeout(() => {
            if (peerConnectionRef.current && 
                peerConnectionRef.current.connectionState === 'disconnected') {
              console.log('Connection still disconnected, ending call');
              endCall();
            }
          }, 5000);
        } else if (pc.connectionState === 'closed') {
          console.log('Connection closed');
          endCall();
        } else if (pc.connectionState === 'connected') {
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

      // Add video transceiver upfront to make screen sharing smoother
      // This ensures video track can be replaced later without renegotiation issues
      const existingVideoTransceiver = peerConnectionRef.current.getTransceivers().find(
        t => t.sender && t.sender.track && t.sender.track.kind === 'video'
      );
      if (!existingVideoTransceiver) {
        peerConnectionRef.current.addTransceiver('video', { direction: 'sendrecv' });
        console.log('Video transceiver added for future screen sharing');
      }

      // Create offer with audio and video support (video for screen sharing)
      const offer = await peerConnectionRef.current.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true, // Allow video for screen sharing
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
      
      // Create and send answer (allow video for screen sharing)
      // Add video transceiver upfront to make screen sharing smoother
      if (peerConnectionRef.current.getTransceivers().length === 0) {
        peerConnectionRef.current.addTransceiver('video', { direction: 'sendrecv' });
      }
      
      const answer = await peerConnectionRef.current.createAnswer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true, // Allow video for screen sharing
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

  const startScreenShare = async () => {
    try {
      // Guard: Only allow screen share if call is connected
      if (!peerConnectionRef.current || callStatus !== 'connected' || !isCallActive) {
        console.error('Cannot start screen share: call not connected');
        alert('Please wait for the call to connect before sharing your screen.');
        return;
      }

      // Get screen share stream
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: 'always',
          displaySurface: 'monitor',
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 }
        },
        audio: false
      });

      screenShareStreamRef.current = stream;
      setScreenShareStream(stream);
      setIsScreenSharing(true);

      // Add video track to peer connection using replaceTrack() - CRITICAL for stable renegotiation
      const videoTrack = stream.getVideoTracks()[0];
      if (!videoTrack) {
        console.error('No video track in screen share stream');
        setIsScreenSharing(false);
        return;
      }

      // Handle when user stops sharing from browser
      videoTrack.onended = () => {
        console.log('Screen share track ended by user');
        stopScreenShare();
      };

      // Find existing video sender or transceiver - use transceiver for better control
      let sender = null;
      let videoTransceiver = peerConnectionRef.current.getTransceivers().find(t => 
        t.sender && (!t.sender.track || t.sender.track.kind === 'video')
      );
      
      if (videoTransceiver && videoTransceiver.sender) {
        sender = videoTransceiver.sender;
      } else {
        // Fallback: find sender directly
        sender = peerConnectionRef.current.getSenders().find(s => 
          s.track && s.track.kind === 'video'
        );
      }
      
      if (sender) {
        // Replace existing video track with screen share - this is the correct approach
        try {
          await sender.replaceTrack(videoTrack);
          console.log('Screen share track replaced successfully via replaceTrack()');
          
          // Create offer for renegotiation - this updates SDP without creating new call
          const offer = await peerConnectionRef.current.createOffer({
            offerToReceiveAudio: true,
            offerToReceiveVideo: true,
          });
          
          await peerConnectionRef.current.setLocalDescription(offer);
          
          // Send renegotiation offer with flag - remote will NOT trigger call state change
          socket.emit('offer', {
            chatSessionId,
            offer: peerConnectionRef.current.localDescription,
            isRenegotiation: true // CRITICAL: This prevents call state change on remote
          });
          
          console.log('Screen share renegotiation offer sent - remote will NOT see calling state');
        } catch (error) {
          console.error('Error replacing video track:', error);
          setIsScreenSharing(false);
          stream.getTracks().forEach(track => track.stop());
        }
      } else {
        // No existing video sender - add new track via transceiver
        try {
          // Create or get video transceiver
          if (!videoTransceiver) {
            videoTransceiver = peerConnectionRef.current.addTransceiver('video', {
              direction: 'sendrecv',
              streams: [stream]
            });
          } else {
            videoTransceiver.sender.replaceTrack(videoTrack);
          }
          
          console.log('Screen share track added via transceiver');
          
          // Create offer for renegotiation
          const offer = await peerConnectionRef.current.createOffer({
            offerToReceiveAudio: true,
            offerToReceiveVideo: true,
          });
          
          await peerConnectionRef.current.setLocalDescription(offer);
          
          socket.emit('offer', {
            chatSessionId,
            offer: peerConnectionRef.current.localDescription,
            isRenegotiation: true // CRITICAL: This prevents call state change on remote
          });
          
          console.log('Screen share offer sent (new track) - remote will NOT see calling state');
        } catch (error) {
          console.error('Error adding screen share track:', error);
          setIsScreenSharing(false);
          stream.getTracks().forEach(track => track.stop());
        }
      }
    } catch (error) {
      console.error('Error starting screen share:', error);
      if (error.name !== 'NotAllowedError' && error.name !== 'AbortError') {
        alert('Failed to start screen share. Please check permissions.');
      }
      setIsScreenSharing(false);
    }
  };

  const stopScreenShare = async () => {
    if (screenShareStreamRef.current) {
      screenShareStreamRef.current.getTracks().forEach((track) => track.stop());
      screenShareStreamRef.current = null;
    }
    
    // Remove video track from peer connection using replaceTrack(null)
    if (peerConnectionRef.current && callStatus === 'connected') {
      const sender = peerConnectionRef.current.getSenders().find(s => 
        s.track && s.track.kind === 'video'
      );
      if (sender) {
        try {
          // Replace with null to remove video track
          await sender.replaceTrack(null);
          
          // Renegotiate to update SDP (remove video from offer)
          const offer = await peerConnectionRef.current.createOffer({
            offerToReceiveAudio: true,
            offerToReceiveVideo: false, // No video after stopping screen share
          });
          
          await peerConnectionRef.current.setLocalDescription(offer);
          
          // Send renegotiation offer with flag
          socket.emit('offer', {
            chatSessionId,
            offer: peerConnectionRef.current.localDescription,
            isRenegotiation: true // CRITICAL: Prevents call state change
          });
          
          console.log('Screen share stopped, renegotiation sent');
        } catch (err) {
          console.error('Error removing video track:', err);
        }
      }
    }
    
    setScreenShareStream(null);
    setIsScreenSharing(false);
    console.log('Screen share stopped');
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

    // Stop call duration timer
    if (callDurationIntervalRef.current) {
      clearInterval(callDurationIntervalRef.current);
      callDurationIntervalRef.current = null;
    }

    // Calculate final call duration
    const finalDuration = duration !== null ? duration : (callStartTime ? Math.floor((Date.now() - callStartTime) / 1000) : callDuration);
    
    // Stop screen share
    stopScreenShare();
    
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
      setScreenShareStream(null);
      setRemoteScreenShareStream(null);
      setIsScreenSharing(false);
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
      if (callDurationIntervalRef.current) {
        clearInterval(callDurationIntervalRef.current);
      }
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (screenShareStreamRef.current) {
        screenShareStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
    };
  }, []);

  return {
    isCallActive,
    isCallIncoming,
    isCallOutgoing,
    callStatus,
    remoteStream,
    localStream: localStreamRef.current,
    screenShareStream,
    remoteScreenShareStream,
    isScreenSharing,
    isCallMinimized,
    callDuration,
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    startScreenShare,
    stopScreenShare,
    toggleCallMinimize,
  };
};
