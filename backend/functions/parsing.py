import serial
import time
from collections import deque

ser = None
ser = serial.Serial('COM3', 9600, timeout=1)
time.sleep(2)

calibration_mode = True
calibration_timeout = 15
calibration_timeout = 15  
calibration_start_time = None
x_min, x_max = float('inf'), float('-inf')
y_min, y_max = float('inf'), float('-inf')
z_min, z_max = float('inf'), float('-inf')

window_size = 5
window_size = 5  
x_values = deque(maxlen=window_size)
y_values = deque(maxlen=window_size)
z_values = deque(maxlen=window_size)

prev_x, prev_y, prev_z = None, None, None
speed_threshold = 0.5


def initialize_serial(port='COM3', baudrate=9600):
    """Initialize the serial connection."""
    global ser
    ser = serial.Serial(port, baudrate, timeout=1)
    time.sleep(2)


def smooth_data(new_x, new_y, new_z):
    """Smooth data using a moving average."""
    x_values.append(new_x)
    y_values.append(new_y)
    z_values.append(new_z)
    smoothed_x = sum(x_values) / len(x_values)
    smoothed_y = sum(y_values) / len(y_values)
    smoothed_z = sum(z_values) / len(z_values)
    return smoothed_x, smoothed_y, smoothed_z

prev_x, prev_y, prev_z = None, None, None
speed_threshold = 0.5 

def check_motion_speed(x, y, z):
    """Check the speed of motion and detect overly fast movements."""
    global prev_x, prev_y, prev_z
    if prev_x is not None:
        speed_x = abs(x - prev_x)
        speed_y = abs(y - prev_y)
        speed_z = abs(z - prev_z)
        if speed_x > speed_threshold or speed_y > speed_threshold or speed_z > speed_threshold:
            print("Too fast! Adjust your speed.")
    prev_x, prev_y, prev_z = x, y, z


def read_sensor_data():
    """Read and parse accelerometer data from serial."""
    global ser
    ser.write(b'R\n')
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

        print(f"Calibrating... X: {x}, Y: {y}, Z: {z}")

        if time.time() - calibration_start_time > calibration_timeout:
            print("Calibration timeout reached.")
            calibration_mode = False

    x_min, x_max = min(calibration_data["x"]), max(calibration_data["x"])
    y_min, y_max = min(calibration_data["y"]), max(calibration_data["y"])
    z_min, z_max = min(calibration_data["z"]), max(calibration_data["z"])
    x_min = min(calibration_data["x"])
    x_max = max(calibration_data["x"])
    y_min = min(calibration_data["y"])
    y_max = max(calibration_data["y"])
    z_min = min(calibration_data["z"])
    z_max = max(calibration_data["z"])

    print(f"Calibration Complete!\nX Min: {x_min}, X Max: {x_max}")
    print(f"Y Min: {y_min}, Y Max: {y_max}")
    print(f"Z Min: {z_min}, Z Max: {z_max}")


def monitor():
    """Monitor accelerometer readings and check for improper motion."""
    print("Starting Monitoring Mode...")
    while True:
        x, y, z = read_sensor_data()
        if x is None or y is None or z is None:
            continue

        if not (x_min <= x <= x_max):
            print("Improper X-axis motion detected!")
        elif not (y_min <= y <= y_max):
            print("Improper Y-axis motion detected!")
        elif not (z_min <= z <= z_max):
            print("Improper Z-axis motion detected!")
        else:
            print("Good form!")

        check_motion_speed(x, y, z)
        time.sleep(0.1)


def close_serial():
    """Close the serial connection."""
    global ser
    if ser:

        time.sleep(0.1)

if __name__ == "__main__":
    try:
        calibrate()
        monitor()
    except KeyboardInterrupt:
        print("Exiting...")
    finally:
        ser.close()
        print("Serial connection closed.")
