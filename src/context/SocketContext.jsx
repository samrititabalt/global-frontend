import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { API_CONFIG } from '../config/api';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const socketRef = useRef(null);

  useEffect(() => {
    // Only connect if user is authenticated
    if (!isAuthenticated || !user) {
      // Clean up existing socket
      if (socketRef.current) {
        console.log('Disconnecting socket: User not authenticated');
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    // Get socket URL from centralized config
    const socketUrl = API_CONFIG.SOCKET_URL;
    
    console.log('🔌 Connecting to socket:', socketUrl);
    console.log('📡 API URL:', API_CONFIG.API_URL);

    // Create new socket connection
    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: Infinity,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      forceNew: true,
    });

    // Connection successful
    newSocket.on('connect', () => {
      console.log('✅ Socket connected:', newSocket.id);
      setIsConnected(true);
      
      const userId = user._id || user.id;
      if (userId) {
        const token = localStorage.getItem('token');
        console.log('👤 Joining socket room for user:', userId);
        
        newSocket.emit('join', {
          userId: userId,
          token: token
        });
        
        // Store userId on socket for backend access
        newSocket.userId = userId;
      }
    });

    // Connection error
    newSocket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error.message);
      console.error('Socket URL attempted:', socketUrl);
      setIsConnected(false);
    });

    // Disconnected
    newSocket.on('disconnect', (reason) => {
      console.log('🔌 Socket disconnected:', reason);
      setIsConnected(false);
      
      // If disconnect was not intentional, try to reconnect
      if (reason === 'io server disconnect') {
        // Server disconnected the socket, reconnect manually
        newSocket.connect();
      }
    });

    // Reconnection attempt
    newSocket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`🔄 Reconnection attempt #${attemptNumber}`);
    });

    // Reconnection successful
    newSocket.on('reconnect', (attemptNumber) => {
      console.log(`✅ Reconnected after ${attemptNumber} attempts`);
      setIsConnected(true);
      
      // Re-join after reconnection
      const userId = user._id || user.id;
      if (userId) {
        const token = localStorage.getItem('token');
        newSocket.emit('join', {
          userId: userId,
          token: token
        });
      }
    });

    // Reconnection failed
    newSocket.on('reconnect_failed', () => {
      console.error('❌ Socket reconnection failed');
      setIsConnected(false);
    });

    // Socket error
    newSocket.on('error', (error) => {
      console.error('❌ Socket error:', error);
    });

    // Store socket reference
    socketRef.current = newSocket;
    setSocket(newSocket);

    // Cleanup function
    return () => {
      console.log('🧹 Cleaning up socket connection');
      if (socketRef.current) {
        socketRef.current.removeAllListeners();
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setSocket(null);
      setIsConnected(false);
    };
  }, [isAuthenticated, user]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

