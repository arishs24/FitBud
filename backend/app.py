import asyncio
import websockets
import json
import time
from collections import deque
import serial

# Serial connection setup
ser = serial.Serial('COM3', 9600, timeout=1)
time.sleep(2)

# Calibration variables and setup
calibration_mode = True
calibration_timeout = 15
x_min, x_max, y_min, y_max, z_min, z_max = float('inf'), float('-inf'), float('inf'), float('-inf'), float('inf'), float('-inf')

# Moving average filter
window_size = 5
x_values = deque(maxlen=window_size)
y_values = deque(maxlen=window_size)
z_values = deque(maxlen=window_size)

def smooth_data(new_x, new_y, new_z):
    """Smooth data using a moving average."""
    x_values.append(new_x)
    y_values.append(new_y)
    z_values.append(new_z)
    smoothed_x = sum(x_values) / len(x_values)
    smoothed_y = sum(y_values) / len(y_values)
    smoothed_z = sum(z_values) / len(z_values)
    return smoothed_x, smoothed_y, smoothed_z

def read_sensor_data():
    """Read and parse accelerometer data from serial."""
    try:
        ser.write(b'R\n')
        line = ser.readline().decode('utf-8').strip()
        if line:
            data = line.split(',')
            x = float(data[0].split(':')[1].strip())
            y = float(data[1].split(':')[1].strip())
            z = float(data[2].split(':')[1].strip())
            return smooth_data(x, y, z)
    except Exception as e:
        print(f"Error parsing line: {line} | Error: {e}")
        return None, None, None

def calibrate():
    """Calibrate the accelerometer by finding min/max values for X, Y, Z."""
    global x_min, x_max, y_min, y_max, z_min, z_max
    print("Starting Calibration Mode. Perform one repetition...")
    calibration_start_time = time.time()
    calibration_data = {"x": [], "y": [], "z": []}

    while time.time() - calibration_start_time < calibration_timeout:
        x, y, z = read_sensor_data()
        if x is None or y is None or z is None:
            continue
        calibration_data["x"].append(x)
        calibration_data["y"].append(y)
        calibration_data["z"].append(z)

    x_min, x_max = min(calibration_data["x"]), max(calibration_data["x"])
    y_min, y_max = min(calibration_data["y"]), max(calibration_data["y"])
    z_min, z_max = min(calibration_data["z"]), max(calibration_data["z"])
    print("Calibration Complete!")
    print(f"X Min: {x_min}, X Max: {x_max}")
    print(f"Y Min: {y_min}, Y Max: {y_max}")
    print(f"Z Min: {z_min}, Z Max: {z_max}")

async def sensor_data(websocket, path):
    """Send accelerometer data over WebSocket."""
    try:
        calibrate()  # Perform calibration once before starting
        while True:
            x, y, z = read_sensor_data()
            if x is None or y is None or z is None:
                continue
            data = {"x": x, "y": y, "z": z, "status": "monitoring"}
            await websocket.send(json.dumps(data))
            await asyncio.sleep(0.1)
    except websockets.exceptions.ConnectionClosed as e:
        print(f"Connection closed: {e}")
    finally:
        ser.close()
        print("Serial connection closed.")

async def main():
    """Main coroutine to start the WebSocket server."""
    server = await websockets.serve(sensor_data, "localhost", 8765)
    print("WebSocket server started on ws://localhost:8765")
    await server.wait_closed()

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("Server shutting down...")
        ser.close()
        print("Serial connection closed.")
