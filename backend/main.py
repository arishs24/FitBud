# Flask backend (app.py)
from flask import Flask
from flask_socketio import SocketIO
from functions.parsing import calibrate, monitor, close_serial

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

@socketio.on('connect')
def handle_connect():
    print('Client connected')

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')
    close_serial()

@socketio.on('request_calibration')
def handle_calibration():
    calibrate()
    return {'message': 'Calibration complete!'}

def emit_sensor_data():
    while True:
        result = monitor()
        if result:
            socketio.emit('data_update', result)
        socketio.sleep(1)

@socketio.on('start_monitoring')
def handle_start_monitoring():
    socketio.start_background_task(emit_sensor_data)

if __name__ == '__main__':
    try:
        socketio.run(app, debug=True)
    except KeyboardInterrupt:
        close_serial()
