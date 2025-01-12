from flask import Flask, jsonify
from functions.parsing import calibrate, monitor, close_serial

app = Flask(__name__)

@app.route('/calibrate', methods=['POST'])
def calibrate_route():
    calibrate()
    return jsonify({"message": "Calibration complete!"})

@app.route('/monitor', methods=['GET'])
def monitor_route():
    result = monitor()
    if result:
        return jsonify(result)
    else:
        return jsonify({"error": "Failed to read sensor data"}), 500

@app.route('/close', methods=['POST'])
def close_serial_route():
    close_serial()
    return jsonify({"message": "Serial connection closed."})

if __name__ == "__main__":
    try:
        app.run(debug=True)
    except KeyboardInterrupt:
        close_serial()
