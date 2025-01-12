import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import joblib

# Load the dataset
data = pd.read_csv('workout_data.csv')  # Ensure the dataset is in the same directory
X = data[['x', 'y', 'z']]  # Features: accelerometer data
y = data['label']          # Labels: workout types

# Train-test split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train the model
model = RandomForestClassifier()
model.fit(X_train, y_train)

# Evaluate the model
predictions = model.predict(X_test)
print("Accuracy:", accuracy_score(y_test, predictions))

# Save the trained model to a file
joblib.dump(model, 'trained_model.pkl')
print("Model saved as 'trained_model.pkl'")
