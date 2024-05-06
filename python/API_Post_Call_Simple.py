#REQUIRED PACKAGES
import os
from dotenv import load_dotenv
import requests

load_dotenv(dotenv_path="../.env")

#Python Code
import logging

logging.basicConfig(
    filename="error_log.log",
    level=logging.ERROR,
    format="%(asctime)s %(levelname)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
logger = logging.getLogger(__name__)


#Required Functions
import time

def delay(n):
    time.sleep(n)


#Set Global Variables
api_endpoint_url = 'https://enter_url_here_for_api_endpoint'


#Call Function
async def api_post_call_simple(json_body):
    try:
        #Set Up Configuration
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {os.getenv("API_TOKEN_FOR_POST_CALL")}'
        }

        #Send POST Request
        response = requests.post(api_endpoint_url, json=json_body, headers=headers)
        response.raise_for_status()

        #Process POST Response
        result = response.json()
        print(result)
        return result

    except Exception as err:
        logger.error(f"There was an error in the api_post_call_simple function: {err}")


#api_post_call_simple()
