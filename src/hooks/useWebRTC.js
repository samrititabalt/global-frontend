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

  useEffect(() => {
    if (!socket || !chatSessionId) return;

    const handleOffer = async (data) => {
      if (data.from === currentUserId) return;
      
      console.log('Received call offer from:', data.from);
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

      // Handle ICE connection state
      pc.oniceconnectionstatechange = () => {
        console.log('ICE connection state:', pc.iceConnectionState);
        if (pc.iceConnectionState === 'failed' || pc.iceConnectionState === 'disconnected') {
          console.warn('ICE connection failed or disconnected');
        }
      };

      // Handle connection state changes
      pc.onconnectionstatechange = () => {
        console.log('Peer connection state:', pc.connectionState);
        if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
          console.warn('Connection failed or disconnected');
          // Don't auto-end, let user handle it
        } else if (pc.connectionState === 'connected') {
          setCallStatus('connected');
          setIsCallIncoming(false);
          setIsCallOutgoing(false);
          setCallStartTime(Date.now());
          // Start call duration timer
          if (callDurationIntervalRef.current) {
            clearInterval(callDurationIntervalRef.current);
          }
          callDurationIntervalRef.current = setInterval(() => {
            if (callStartTime) {
              setCallDuration(Math.floor((Date.now() - callStartTime) / 1000));
            }
          }, 1000);
          console.log('Call connected successfully');
        }
      };

      // Handle ICE connection state for better status tracking
      pc.oniceconnectionstatechange = () => {
        console.log('ICE connection state:', pc.iceConnectionState);
        if (pc.iceConnectionState === 'checking' && callStatus === 'calling') {
          setCallStatus('ringing');
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
      if (!peerConnectionRef.current) {
        console.error('No peer connection available');
        return;
      }

      // Get screen share stream
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: 'always',
          displaySurface: 'monitor'
        },
        audio: false
      });

      screenShareStreamRef.current = stream;
      setScreenShareStream(stream);
      setIsScreenSharing(true);

      // Add video track to peer connection
      stream.getVideoTracks().forEach((track) => {
        track.onended = () => {
          stopScreenShare();
        };
        if (peerConnectionRef.current) {
          // Find existing video sender or add new track
          const sender = peerConnectionRef.current.getSenders().find(s => 
            s.track && s.track.kind === 'video'
          );
          
          if (sender) {
            sender.replaceTrack(track).catch(err => {
              console.error('Error replacing video track:', err);
            });
          } else {
            peerConnectionRef.current.addTrack(track, stream);
          }
        }
      });

      console.log('Screen share started');
    } catch (error) {
      console.error('Error starting screen share:', error);
      if (error.name !== 'NotAllowedError' && error.name !== 'AbortError') {
        alert('Failed to start screen share. Please check permissions.');
      }
    }
  };

  const stopScreenShare = () => {
    if (screenShareStreamRef.current) {
      screenShareStreamRef.current.getTracks().forEach((track) => track.stop());
      screenShareStreamRef.current = null;
    }
    
    // Remove video track from peer connection
    if (peerConnectionRef.current) {
      const sender = peerConnectionRef.current.getSenders().find(s => 
        s.track && s.track.kind === 'video'
      );
      if (sender) {
        sender.replaceTrack(null).catch(err => {
          console.error('Error removing video track:', err);
        });
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

    // Notify other party with call duration
    if (socket && chatSessionId && finalDuration > 0) {
      socket.emit('callEnded', { 
        chatSessionId, 
        duration: finalDuration,
        initiator: callInitiatorRef.current,
        currentUser: currentUserId
      });
    } else if (socket && chatSessionId) {
      socket.emit('callEnded', { chatSessionId });
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
