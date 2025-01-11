from flask import Flask
from flask_cors import CORS
import logging
import sys
import os

print("Hello world")

app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('app.log')
    ]
)
logger = logging.getLogger(__name__)

# Ensure all Flask logging also goes to our handlers
for handler in logging.getLogger().handlers:
    app.logger.addHandler(handler)

@app.route('/')
def home():
    return "Hello, World!"

if __name__ == '__main__':
    # Add a test log message to verify logging is working
    logger.info("Starting Flask application...")
    
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
