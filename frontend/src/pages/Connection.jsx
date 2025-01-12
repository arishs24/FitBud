import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

const Connection = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    // Connect to Flask-SocketIO server
    const socket = io('http://localhost:5000');

    // Listen for updates from the server
    socket.on('data_update', (update) => {
      console.log('Received update:', update);
      setData(update);
    });

    return () => {
      socket.disconnect(); // Clean up connection
    };
  }, []);

  return (
    <div>
      <h1>Real-Time Updates</h1>
      {data ? (
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
