from flask import Flask, request, jsonify
import joblib
import numpy as np

app = Flask(__name__)

# Load the trained model
model = joblib.load("workout_model.pkl")

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json  # Expecting {"x": value, "y": value, "z": value}
    x, y, z = data["x"], data["y"], data["z"]
    prediction = model.predict([[x, y, z]])[0]  # Predict workout type
    return jsonify({"workout_type": prediction})

if __name__ == "__main__":
    app.run(debug=True)
