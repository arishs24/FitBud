import time
from collections import deque
import serial
import joblib  # For loading a pre-trained ML model
import pandas as pd

# Initialize serial connection
ser = serial.Serial('COM3', 9600, timeout=1)
time.sleep(2)

# Load the trained ML model
model = joblib.load('trained_model.pkl')  # Replace with your actual model file

# Calibration variables
calibration_mode = True
calibration_timeout = 15
calibration_start_time = None
x_min, x_max, y_min, y_max, z_min, z_max = None, None, None, None, None, None

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
    ser.write(b'R\n')
    line = ser.readline().decode('utf-8').strip()
    try:
        if line:
            data = line.split(',')
            x = float(data[0].split(':')[1].strip())
            y = float(data[1].split(':')[1].strip())
            z = float(data[2].split(':')[1].strip())
            x, y, z = smooth_data(x, y, z)
            return x, y, z
    except Exception as e:
        print(f"Error parsing line: {line} | Error: {e}")
        return None, None, None

def calibrate():
    """Calibrate the accelerometer for bicep curls."""
    global x_min, x_max, y_min, y_max, z_min, z_max
    print("Starting Calibration Mode. Perform a few bicep curls...")
    
    calibration_start_time = time.time()
    calibration_data = {"x": [], "y": [], "z": []}
    
    while time.time() - calibration_start_time < calibration_timeout:
        x, y, z = read_sensor_data()
        if x is None or y is None or z is None:
            continue
        calibration_data["x"].append(x)
        calibration_data["y"].append(y)
        calibration_data["z"].append(z)
        print(f"Calibrating... X: {x:.3f}, Y: {y:.3f}, Z: {z:.3f}")

    # Determine calibration bounds
    x_min, x_max = min(calibration_data["x"]), max(calibration_data["x"])
    y_min, y_max = min(calibration_data["y"]), max(calibration_data["y"])
    z_min, z_max = min(calibration_data["z"]), max(calibration_data["z"])
    
    print("Calibration Complete!")
    print(f"X Min: {x_min:.3f}, X Max: {x_max:.3f}")
    print(f"Y Min: {y_min:.3f}, Y Max: {y_max:.3f}")
    print(f"Z Min: {z_min:.3f}, Z Max: {z_max:.3f}")

def classify_motion(x, y, z):
    """Classify the activity using the ML model."""
    try:
        # Prepare the data with feature names as a pandas DataFrame
        input_data = pd.DataFrame([[x, y, z]], columns=["x", "y", "z"])
        
        # Use the model to make a prediction
        prediction = model.predict(input_data)[0]
        return prediction
    except Exception as e:
        print(f"Error in ML classification: {e}")
        return None

def monitor():
    """Monitor accelerometer readings and classify activities."""
    print("Starting Monitoring Mode...")
    while True:
        x, y, z = read_sensor_data()
        if x is None or y is None or z is None:
            continue

        # Classify the motion
        activity = classify_motion(x, y, z)
        
        if activity == "bicep_curl":
            # Check if the motion is within the calibrated range
            if not (x_min <= x <= x_max):
                print("Incorrect form: Too far to the right, stay within range!")
            elif not (y_min <= y <= y_max):
                print("Incorrect form: Too Low!")
            elif not (z_min <= z <= z_max):
                print("Incorrect form: Fix Alignment")
            else:
                print("Good form! Bicep curl detected.")
        else:
            print(f"Detected Activity: {activity}")

        time.sleep(0.1)

if __name__ == "__main__":
    try:
        calibrate()  # Perform calibration first
        monitor()  # Start monitoring after calibration
    except KeyboardInterrupt:
        print("Exiting...")
    finally:
        ser.close()
