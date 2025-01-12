import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

function Home() {
  const [socket, setSocket] = useState(null);
  const [sensorData, setSensorData] = useState(null);
  const [calibrationData, setCalibrationData] = useState(null);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [prediction, setPrediction] = useState(null);

  useEffect(() => {
    // Connect to the WebSocket server
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to server');
    });

    // Listen for sensor data
    newSocket.on('sensor_data', (data) => {
      console.log('Sensor Data:', data);
      setSensorData(data);

      // Send sensor data to the backend for prediction
      fetch('http://localhost:5000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data), // Send the raw sensor data
      })
        .then((response) => response.json())
        .then((result) => {
          console.log('Prediction:', result);
          setPrediction(result.workout_type); // Display the predicted workout type
        })
        .catch((error) => console.error('Error fetching prediction:', error));
    });

    // Listen for calibration updates
    newSocket.on('calibration_update', (data) => {
      console.log('Calibration Data:', data);
      setCalibrationData(data);
    });

    return () => {
      // Disconnect the socket when the component unmounts
      newSocket.disconnect();
    };
  }, []);

  const startCalibration = () => {
    if (socket) {
      setIsCalibrating(true);
      socket.emit('start_calibration', (response) => {
        console.log('Calibration complete:', response);
        setIsCalibrating(false);
        setCalibrationData(response); // Set calibration data from server response
      });
    }
  };

  const startMonitoring = () => {
    if (socket) {
      socket.emit('start_monitoring');
      console.log('Monitoring started');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold mb-4">Motion Monitor</h1>
          
          {/* Calibration and Monitoring Controls */}
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

          {/* Display Calibration Data */}
          {calibrationData && (
            <div className="mb-4">
              <h2 className="text-xl font-semibold mb-2">Calibration Data:</h2>
              <pre className="bg-gray-100 p-4 rounded">
                {JSON.stringify(calibrationData, null, 2)}
              </pre>
            </div>
          )}

          {/* Display Sensor Data */}
          {sensorData && (
            <div>
              <h2 className="text-xl font-semibold mb-2">Sensor Data:</h2>
              <div className="bg-gray-100 p-4 rounded">
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>X: {sensorData.x.toFixed(2)}</div>
                  <div>Y: {sensorData.y.toFixed(2)}</div>
                  <div>Z: {sensorData.z.toFixed(2)}</div>
                </div>
              </div>
            </div>
          )}

          {/* Display Prediction */}
          {prediction && (
            <div className="mt-4">
              <h2 className="text-xl font-semibold mb-2">Workout Prediction:</h2>
              <p className="text-lg text-blue-600">{prediction}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;
