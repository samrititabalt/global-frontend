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
  
  // Track if answer was received (for status updates)
  const answerReceivedRef = useRef(false);
  
  const localStreamRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const callInitiatorRef = useRef(null);

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

      try {
        // Create peer connection
        await createPeerConnection();
        
        // Get local stream BEFORE setting remote description
        await setLocalStream();
        
        // Set remote description
        await peerConnectionRef.current.setRemoteDescription(
          new RTCSessionDescription(data.offer)
        );

        // Create answer
        const answer = await peerConnectionRef.current.createAnswer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: false,
        });

        // Set codec preferences
        if (answer.sdp) {
          answer.sdp = answer.sdp.replace(/a=rtpmap:(\d+) opus\/48000\/2/g, 'a=rtpmap:$1 opus/48000/2');
        }

        await peerConnectionRef.current.setLocalDescription(answer);

        console.log('Sending answer to offer');
        socket.emit('answer', {
          chatSessionId,
          answer,
        });
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

    const handleCallEnded = () => {
      endCall();
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

    try {
      setIsCallOutgoing(true);
      setIsCallActive(true);
      setCallStatus('calling');
      callInitiatorRef.current = currentUserId;

      // Create peer connection first
      await createPeerConnection();
      
      // Get local stream and add tracks
      await setLocalStream();

      // Create offer with proper audio constraints
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
      setIsCallIncoming(false);
      setCallStatus('connected');
      
      // Ensure local stream is set if not already
      if (!localStreamRef.current && peerConnectionRef.current) {
        await setLocalStream();
      }
      
      console.log('Call accepted, status:', callStatus);
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

  const endCall = () => {
    // Stop local stream
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    // Reset state
    setIsCallActive(false);
    setIsCallIncoming(false);
    setIsCallOutgoing(false);
    setCallStatus('idle');
    setRemoteStream(null);
    remoteStreamRef.current = null;
    callInitiatorRef.current = null;
    answerReceivedRef.current = false;

    // Notify other party
    if (socket && chatSessionId) {
      socket.emit('callEnded', { chatSessionId });
    }
  };

  return {
    isCallActive,
    isCallIncoming,
    isCallOutgoing,
    callStatus,
    remoteStream,
    localStream: localStreamRef.current,
    startCall,
    acceptCall,
    rejectCall,
    endCall,
  };
};
