import requests
from snowflake.snowpark import Session
from dotenv import load_dotenv
import os
import json

# Load environment variables
load_dotenv()

connection_params = {
    "account": os.getenv("SNOWFLAKE_ACCOUNT"),
    "user": os.getenv("SNOWFLAKE_USER"),
    "password": os.getenv("SNOWFLAKE_PASSWORD"),
    "database": os.getenv("SNOWFLAKE_DATABASE"),
    "schema": os.getenv("SNOWFLAKE_SCHEMA"),
    "warehouse": os.getenv("SNOWFLAKE_WAREHOUSE"),
}

def fetch_medical_information(condition):
    """
    Fetches medical information using Google's Custom Search API
    """
    try:
        # Google API credentials
        api_key = os.getenv("GOOGLE_API_KEY")
        cx = os.getenv("b059ef4aee6c54124")  # Your custom search engine ID
        
        if not api_key or not cx:
            raise ValueError("Google API key or Search Engine ID not found in environment variables")

        # Construct the search query
        search_query = f"{condition} medical condition site:mayoclinic.org OR site:medlineplus.gov"
        url = f"https://www.googleapis.com/customsearch/v1"
        
        # Parameters for the API request
        params = {
            'q': search_query,
            'key': api_key,
            'cx': cx,
            'num': 3  # Number of results to return
        }
        
        response = requests.get(url, params=params)
        response.raise_for_status()
        
        results = response.json()
        
        if 'items' in results:
            # Extract snippets from the search results
            information = " ".join(item.get('snippet', '') for item in results['items'])
            return information
        else:
            return "No information found for this condition."

    except requests.RequestException as e:
        print(f"Network error while fetching medical information: {e}")
        return "Unable to fetch information due to network error."
    except Exception as e:
        print(f"Error fetching medical information: {e}")
        return "Unable to process medical information at this time."

# Rest of your code remains the same...

def store_medical_information(condition, information):
    """
    Stores the fetched medical information in a Snowflake database.
    """
    try:
        session = Session.builder.configs(connection_params).create()
        print("Connected to Snowflake successfully!")

        # Define the database table
        database_name = connection_params["database"]
        schema_name = connection_params["schema"]
        table_name = "Medical_Conditions"

        # Create table if it doesn't exist
        create_table_query = f"""
        CREATE TABLE IF NOT EXISTS {database_name}.{schema_name}.{table_name} (
            condition STRING,
            information STRING
        );
        """
        session.sql(create_table_query).collect()

        # Insert the data
        insert_query = f"""
        INSERT INTO {database_name}.{schema_name}.{table_name} (condition, information)
        VALUES ('{condition}', '{information}');
        """
        session.sql(insert_query).collect()
        print(f"Stored information for {condition} in the database.")
    except Exception as e:
        print(f"Error storing medical information: {e}")
