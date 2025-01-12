import requests
from snowflake.snowpark import Session
from dotenv import load_dotenv
import os
import json
import xml.etree.ElementTree as ET
from datetime import datetime

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
    Fetches medical information from PubMed using their E-utilities API
    """
    try:
        # PubMed API base URLs
        esearch_base = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi"
        efetch_base = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi"
        
        # Search parameters for recent, high-quality papers
        search_params = {
            'db': 'pubmed',
            'term': f'{condition}[Title/Abstract] AND ("review"[Publication Type] OR "systematic review"[Publication Type])',
            'retmax': '3',
            'sort': 'relevance'
        }
        
        # Get PubMed IDs
        search_response = requests.get(esearch_base, params=search_params)
        search_response.raise_for_status()
        
        # Parse XML response
        root = ET.fromstring(search_response.text)
        id_list = root.findall('.//Id')
        
        if not id_list:
            return "No PubMed articles found for this condition."
        
        # Get article details
        pmids = ','.join([id_elem.text for id_elem in id_list])
        fetch_params = {
            'db': 'pubmed',
            'id': pmids,
            'rettype': 'abstract'
        }
        
        fetch_response = requests.get(efetch_base, params=fetch_params)
        fetch_response.raise_for_status()
        
        # Parse article details
        articles_root = ET.fromstring(fetch_response.text)
        articles = articles_root.findall('.//PubmedArticle')
        
        information = []
        for article in articles:
            try:
                # Extract title
                title = article.find('.//ArticleTitle').text
                
                # Extract abstract
                abstract_elements = article.findall('.//Abstract/AbstractText')
                abstract = ' '.join([elem.text for elem in abstract_elements if elem.text])
                
                # Extract publication date
                pub_date = article.find('.//PubDate')
                year = pub_date.find('Year').text if pub_date.find('Year') is not None else ''
                
                # Extract journal name
                journal = article.find('.//Journal/Title').text if article.find('.//Journal/Title') is not None else ''
                
                # Format article information
                article_info = f"Title: {title}\nJournal: {journal} ({year})\nAbstract: {abstract}\n"
                information.append(article_info)
                
            except AttributeError as e:
                print(f"Error parsing article: {e}")
                continue
        
        if information:
            return "\n\n".join(information)
        else:
            return "No detailed information available from PubMed for this condition."

    except requests.RequestException as e:
        print(f"Network error while fetching from PubMed: {e}")
        return f"Unable to fetch information: {str(e)}"
    except Exception as e:
        print(f"Error processing medical information: {e}")
        return f"Unable to process information: {str(e)}"

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
        table_name = "Medical_Research_Data"

        # Create table if it doesn't exist
        create_table_query = f"""
        CREATE TABLE IF NOT EXISTS {database_name}.{schema_name}.{table_name} (
            condition STRING,
            information STRING,
            fetch_date TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP()
        );
        """
        session.sql(create_table_query).collect()

        # Create a DataFrame with the data
        data = [{"condition": condition, "information": information, "fetch_date": datetime.now()}]
        df = session.create_dataframe(data)

        # Write to Snowflake using DataFrame API
        df.write.mode("append").save_as_table(f"{database_name}.{schema_name}.{table_name}")
        print(f"Successfully stored research information for {condition} in the database.")

    except Exception as e:
        print(f"Error storing medical information: {e}")
    finally:
        if 'session' in locals():
            session.close()

# Test the functionality
if __name__ == "__main__":
    condition = "insomnia"
    print(f"\nFetching PubMed research for {condition}...")
    info = fetch_medical_information(condition)
    if info and not info.startswith("Unable to process"):
        store_medical_information(condition, info)