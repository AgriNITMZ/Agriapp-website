import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Initialize socket connection
    // Extract base URL without /api/v1 for Socket.IO
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
    const socketUrl = apiUrl.replace('/api/v1', '');
    
    const socketInstance = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    socketInstance.on('connect', () => {
      console.log('🔌 Socket connected:', socketInstance.id);
      setConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('🔌 Socket disconnected');
      setConnected(false);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('🔌 Socket connection error:', error);
      setConnected(false);
    });

    setSocket(socketInstance);

    // Cleanup on unmount
    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const joinUserRoom = (userId) => {
    if (socket && userId) {
      socket.emit('join-user-room', userId);
      console.log(`👤 Joined user room: ${userId}`);
    }
  };

  const joinSellerRoom = (sellerId) => {
    if (socket && sellerId) {
      socket.emit('join-seller-room', sellerId);
      console.log(`🏪 Joined seller room: ${sellerId}`);
    }
  };

  const value = {
    socket,
    connected,
    joinUserRoom,
    joinSellerRoom
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
