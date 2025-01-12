import React, { useState, useEffect } from 'react';

function Connection() {
    const [sensorData, setSensorData] = useState({ x: 0, y: 0, z: 0 });
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // Create WebSocket connection
        const socket = new WebSocket('ws://localhost:8765');

        // Event listener for when the connection is open
        socket.onopen = () => {
            console.log('Connected to WebSocket server');
            setIsConnected(true);
        };

        // Event listener for receiving messages
        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);  // assuming the backend sends JSON
            setSensorData(data);
        };

        // Event listener for when the connection is closed
        socket.onclose = () => {
            console.log('Disconnected from WebSocket server');
            setIsConnected(false);
        };

        // Clean up on unmount
        return () => {
            socket.close();
        };
    }, []);

    return (
        <div>
            <h2>Sensor Data:</h2>
            <p>X: {sensorData.x}</p>
            <p>Y: {sensorData.y}</p>
            <p>Z: {sensorData.z}</p>
            <p>Status: {isConnected ? 'Connected' : 'Disconnected'}</p>
        </div>
    );
}

export default Connection;
