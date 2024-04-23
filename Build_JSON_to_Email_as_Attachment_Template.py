# Required Packages
import json
import os
from dotenv import load_dotenv
import dateutil.parser

# Load environment variables
load_dotenv(dotenv_path="../.env")

# Import required modules
from SQL_Query_Template import query1
from SQL_Query_Template_2 import query2
from SQL_Query_Template_3 import query3
from mailer_template import mailer_call
from JSON_Storage_Mailer_Template import jsonStorage
# from API_Post_Call import post_api_call_simple
from Error_Logger_Template import logger

# Required Functions
import time

def delay(n):
    time.sleep(n)

# Set Date
now = dateutil.parser.parse(os.getenv("NOW"))
as_of_date = now.strftime("%Y-%m-%d")

# Call Function
async def json_build():
    print("Building Combined JSON for 3 SQL Queries")
    try:
        # Pull SQL Query Results (already returned as JSON Objects)
        result_1 = await query1
        result_2 = await query2
        result_3 = await query3

        print(f'Result 1 = {len(result_1)}')
        print(f'Result 2 = {len(result_2)}')
        print(f'Result 3 = {len(result_3)}')

        # Concatenate result_1 and result_2 into 1 file
        result_set_1 = result_1 + result_2
        delay(3)  # Delay the next step in case the first 2 results are very large

        # Concatenate result_set_1 with result_3
        complete_new_set = result_set_1 + result_3

        print(f'Combined List Length = {len(complete_new_set)}')

        # ---------------- TO SEND JSON FILE VIA EMAIL ---------------- #
        date = as_of_date
        fileContent = json.dumps(complete_new_set)
        fileName = 'Enter New Filename Here'

        # Save file as .json format
        jsonSave = await jsonStorage(date, fileContent, fileName)

        # Isolate the .json directory. This are needed to attach the file to the email sent by mailer.mjs
        dir = jsonSave.filedirectory

        # Call mailer.mjs function
        await mailer_call.isExport(dir)

        # ---------------- TO SEND JSON FILE VIA POST API CALL ---------------- #
        # sendJSON = await post_api_call_simple(complete_new_set)

        return as_of_date

    except Exception as err:
        logger.error(f"There was an error in the Build_JSON_to_Email_as_Attachment.mjs: {err}")

json_build()