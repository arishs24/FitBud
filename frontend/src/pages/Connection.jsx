import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const Connection = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Connect to Flask-SocketIO server
    const socket = io('http://localhost:5000', {
      transports: ['websocket', 'polling'], // Use fallback transports for compatibility
    });

    // Handle connection event
    socket.on('connect', () => {
      console.log('Connected to Flask-SocketIO server');
    });

    // Listen for updates from the server
    socket.on('data_update', (update) => {
      console.log('Received update:', update);
      setData(update);
    });

    // Handle connection errors
    socket.on('connect_error', (err) => {
      console.error('Connection error:', err);
      setError('Failed to connect to the server.');
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    // Clean up the connection when the component unmounts
    return () => {
      socket.disconnect();
      console.log('Socket disconnected');
    };
  }, []);

  return (
    <div>
      <h1>Real-Time Updates</h1>
      {error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : data ? (
        <p>
          Sensor: {data.sensor}, Value: {data.value}
        </p>
      ) : (
        <p>Waiting for updates...</p>
      )}
    </div>
  );
};

export default Connection;
