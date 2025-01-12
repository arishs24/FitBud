import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import Header from '../components/Header';

function Home() {
  const [socket, setSocket] = useState(null);
  const [sensorData, setSensorData] = useState(null);
  const [calibrationData, setCalibrationData] = useState(null);
  const [isCalibrating, setIsCalibrating] = useState(false);

  useEffect(() => {
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to server');
    });

    newSocket.on('motion_data', (data) => {
      setSensorData(data);
    });

    newSocket.on('calibration_update', (data) => {
      setCalibrationData(data);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const startCalibration = () => {
    setIsCalibrating(true);
    socket.emit('start_calibration', (response) => {
      console.log('Calibration complete:', response);
      setIsCalibrating(false);
    });
  };

  const startMonitoring = () => {
    socket.emit('start_monitoring');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold mb-4">Motion Monitor</h1>
          
          <div className="space-x-4 mb-6">
            <button
              onClick={startCalibration}
              className="bg-blue-500 text-white px-4 py-2 rounded"
              disabled={isCalibrating}
            >
              {isCalibrating ? 'Calibrating...' : 'Start Calibration'}
            </button>
            
            <button
              onClick={startMonitoring}
              className="bg-green-500 text-white px-4 py-2 rounded"
            >
              Start Monitoring
            </button>
          </div>

          {calibrationData && (
            <div className="mb-4">
              <h2 className="text-xl font-semibold mb-2">Calibration Data:</h2>
              <pre className="bg-gray-100 p-4 rounded">
                {JSON.stringify(calibrationData, null, 2)}
              </pre>
            </div>
          )}

          {sensorData && (
            <div>
              <h2 className="text-xl font-semibold mb-2">Sensor Data:</h2>
              <div className="bg-gray-100 p-4 rounded">
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>X: {sensorData.sensor.x.toFixed(2)}</div>
                  <div>Y: {sensorData.sensor.y.toFixed(2)}</div>
                  <div>Z: {sensorData.sensor.z.toFixed(2)}</div>
                </div>
                <div className="mt-4">
                  <h3 className="font-semibold mb-2">Feedback:</h3>
                  <ul className="list-disc pl-4">
                    {sensorData.feedback.map((msg, index) => (
                      <li
                        key={index}
                        className={msg.includes('Good form') ? 'text-green-600' : 'text-red-600'}
                      >
                        {msg}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;