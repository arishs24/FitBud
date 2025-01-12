import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

const Connection = () => {
    const [data, setData] = useState(null);
    const [calibrationData, setCalibrationData] = useState(null);
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const newSocket = io('http://localhost:5000');
        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('Connected to server');
            newSocket.emit('start_monitoring');
        });

        newSocket.on('data_update', (update) => {
            console.log('Received update:', update);
            setData(update);
        });

        return () => {
            newSocket.disconnect();
        };
    }, []);

    const handleCalibrate = () => {
        if (socket) {
            socket.emit('request_calibration', (response) => {
                console.log('Calibration response:', response);
                setCalibrationData(response);
            });
        }
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Exercise Form Monitor</h1>
            <button 
                onClick={handleCalibrate}
                className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
            >
                Calibrate
            </button>

            {calibrationData && (
                <div className="mb-4">
                    <h2 className="text-xl font-semibold mb-2">Calibration Results:</h2>
                    <pre className="bg-gray-100 p-2 rounded">
                        {JSON.stringify(calibrationData, null, 2)}
                    </pre>
                </div>
            )}

            {data && (
                <div>
                    <h2 className="text-xl font-semibold mb-2">Current Reading:</h2>
                    <div className="bg-gray-100 p-4 rounded">
                        <h3 className="font-semibold">Sensor Data:</h3>
                        <p>X: {data.sensor_data.x.toFixed(2)}</p>
                        <p>Y: {data.sensor_data.y.toFixed(2)}</p>
                        <p>Z: {data.sensor_data.z.toFixed(2)}</p>
                        
                        <h3 className="font-semibold mt-2">Feedback:</h3>
                        <ul className="list-disc pl-4">
                            {data.feedback.map((msg, index) => (
                                <li key={index} className={msg.includes('Good form') ? 'text-green-600' : 'text-red-600'}>
                                    {msg}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Connection;