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
      
      setIsCallIncoming(true);
      setIsCallActive(true);
      setCallStatus('ringing');
      callInitiatorRef.current = data.from;

      try {
        await createPeerConnection();
        await setLocalStream();
        
        await peerConnectionRef.current.setRemoteDescription(
          new RTCSessionDescription(data.offer)
        );

        const answer = await peerConnectionRef.current.createAnswer();
        await peerConnectionRef.current.setLocalDescription(answer);

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
        await peerConnectionRef.current.setRemoteDescription(
          new RTCSessionDescription(data.answer)
        );
        setCallStatus('connected');
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

      // Handle remote stream
      pc.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
          remoteStreamRef.current = event.streams[0];
          setRemoteStream(event.streams[0]);
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

      // Handle connection state changes
      pc.onconnectionstatechange = () => {
        console.log('Connection state:', pc.connectionState);
        if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
          endCall();
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
        audio: true,
        video: false,
      });

      localStreamRef.current = stream;

      // Add tracks to peer connection
      stream.getTracks().forEach((track) => {
        if (peerConnectionRef.current) {
          peerConnectionRef.current.addTrack(track, stream);
        }
      });

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

      await createPeerConnection();
      await setLocalStream();

      const offer = await peerConnectionRef.current.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: false,
      });

      await peerConnectionRef.current.setLocalDescription(offer);

      socket.emit('offer', {
        chatSessionId,
        offer,
      });

      // Set timeout for call
      setTimeout(() => {
        if (callStatus === 'calling' || callStatus === 'ringing') {
          endCall();
        }
      }, 30000); // 30 seconds timeout
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
