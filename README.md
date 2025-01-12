# Getting Started with BetEd

## To Get Started

### `git clone`

First thing you want to do is enter the path you want to run this project in your command/powershell and git clone this repository.

### `cd into src/frontend directory`,

Simply cd

### `create a new virtual environment`,

Create it by typing 'python -m venv name_of_environment'
Then start environment by typing './name_of_environment/scripts/activate'

### `pip install -r requirements.txt`

Install necessary packages as well as other packages:
- 'pip install bs4'

### Generate json key from Firebase and store it in frontend directory

- Navigate to your Firebase project
- Navigate to Project Settings and then Service Accounts
- Generate new private key and store it in src/frontend directory
- Enable Authentication on Firebase console through Email/Password

### .env setup for Snowflake and Mistral AI connection

In your Snowflake account find the necessary parameters and save it in an .env file in src/frontend/backend directory:
- SNOWFLAKE_ACCOUNT
- SNOWFLAKE_USER
- SNOWFLAKE_PASSWORD
- SNOWFLAKE_DATABASE
- SNOWFLAKE_SCHEMA
- SNOWFLAKE_WAREHOUSE

In your MistralAI account, find your API key and save it in the same .env file as MISTRAL_API_KEY

Google Custom search API setup and Programmable Search Engine Setup:
- Navigate to your project in your Google Cloud Console
- Enable the Custom Search API
- Navigate to the Credentials tab under API & Services for your project and copy your API key onto the same .env file as YOUR_GOOGLE_API_KEY

If your desire to use your own programmable search engine (not required):
- Navigate to your Google Programmable Engine Screen and add a new search engine
- Navigate to your seach engine after creation and copy its search engine ID as the value for the cx variable in the scr/frontend/backend/extract.py file

### `name_of_environment\scripts\python -m streamlit run app.py`,

Start running it

# If it doesn't work, install a few things:

