import time
from collections import deque
import serial

# Initialize serial connection
ser = serial.Serial('COM3', 9600, timeout=1)
time.sleep(2)

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

# Speed detection variables
prev_x, prev_y, prev_z = None, None, None
dynamic_speed_threshold = 0.5  # Default threshold

def adjust_speed_threshold():
    """Dynamically adjust speed threshold based on calibrated range."""
    global dynamic_speed_threshold
    dynamic_speed_threshold = (x_max - x_min + y_max - y_min + z_max - z_min) / 20  # Increase divisor for larger margin
    print(f"Adjusted speed threshold: {dynamic_speed_threshold:.3f}")

def check_motion_speed(x, y, z):
    """Check the speed of motion and detect overly fast movements."""
    global prev_x, prev_y, prev_z
    if prev_x is not None:
        speed_x = abs(x - prev_x)
        speed_y = abs(y - prev_y)
        speed_z = abs(z - prev_z)
        # Use a larger margin for speed thresholds
        if speed_x > dynamic_speed_threshold * 1.5 or speed_y > dynamic_speed_threshold * 1.5 or speed_z > dynamic_speed_threshold * 1.5:
            print("Too fast! Adjust your speed.")
    prev_x, prev_y, prev_z = x, y, z

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
    """Calibrate the accelerometer by finding min/max values for X, Y, Z."""
    global calibration_mode, calibration_start_time
    global x_min, x_max, y_min, y_max, z_min, z_max
    print("Starting Calibration Mode. Perform one repetition...")

    calibration_start_time = time.time()
    calibration_data = {"x": [], "y": [], "z": []}

    while calibration_mode:
        x, y, z = read_sensor_data()
        if x is None or y is None or z is None:
            continue
        calibration_data["x"].append(x)
        calibration_data["y"].append(y)
        calibration_data["z"].append(z)
        print(f"Calibrating... X: {x:.3f}, Y: {y:.3f}, Z: {z:.3f}")
        if time.time() - calibration_start_time > calibration_timeout:
            print("Calibration timeout reached.")
            calibration_mode = False

    x_min, x_max = min(calibration_data["x"]), max(calibration_data["x"])
    y_min, y_max = min(calibration_data["y"]), max(calibration_data["y"])
    z_min, z_max = min(calibration_data["z"]), max(calibration_data["z"])
    print("Calibration Complete!")
    print(f"X Min: {x_min:.3f}, X Max: {x_max:.3f}")
    print(f"Y Min: {y_min:.3f}, Y Max: {y_max:.3f}")
    print(f"Z Min: {z_min:.3f}, Z Max: {z_max:.3f}")

    adjust_speed_threshold()

def monitor():
    """Monitor accelerometer readings and check for improper motion."""
    print("Starting Monitoring Mode...")
    while True:
        x, y, z = read_sensor_data()
        if x is None or y is None or z is None:
            continue

        # Check for improper motion with realistic feedback
        if x < x_min:
            print("Motion too far left!")
        elif x > x_max:
            print("Motion too far right!")
        elif y < y_min:
            print("Motion too low!")
        elif y > y_max:
            print("Motion too high!")
        elif z < z_min:
            print("Motion not forward enough!")
        elif z > z_max:
            print("Motion too far forward!")
        else:
            print("Good form!")

        # Check for speed
        check_motion_speed(x, y, z)
        time.sleep(0.1)

if __name__ == "__main__":
    try:
        calibrate()
        monitor()
    except KeyboardInterrupt:
        print("Exiting...")
    finally:
        ser.close()
