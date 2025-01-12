import React, { useEffect, useState } from 'react';

const SensorData = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8765');

    ws.onmessage = (event) => {
      const sensorData = JSON.parse(event.data);
      setData(sensorData);
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed.');
    };

    return () => ws.close();
  }, []);

  return (
    <div>
      <h1>Accelerometer Data</h1>
      {data ? (
        <div>
          <p>X: {data.x}</p>
          <p>Y: {data.y}</p>
          <p>Z: {data.z}</p>
          <p>Status: {data.status}</p>
        </div>
      ) : (
        <p>Waiting for data...</p>
      )}
    </div>
  );
};

export default SensorData;
