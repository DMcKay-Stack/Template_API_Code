import logging
import requests
import time

# Required Functions
def delay(n):
    time.sleep(n)

# Set Global Variables
error_counter = 0
url = "enter the url here for the API endpoint"

async def api_call(json_body, report_name):
    global error_counter
    api_check = 0

    while api_check == 0:
        try:
            response = requests.post(url, json=json_body, headers={"content-type": "application/json;charset=utf-8"})

            if response.status_code != 200:
                error_counter += 1
                logging.info(f"\n\n\nError in API Call for {report_name}\n\nResponse:     STATUS CODE: {response.status_code}\nSTATUS DESCRIPTION: {response.reason}\n\nJSON Body: \n\t{json_body}\n\n\Pausing for delay(100) then Re-running")
                delay(100)
                api_check = 0
                logging.info(f"Re-establishing API Endpoint connection and Re-running previous API call for {json_body}")

                if error_counter == 2:
                    logging.error(f"API Process Terminated.\nSTATUS CODE: {response.status_code}\nSTATUS DESCRIPTION: {response.reason}\n\n  JSON Body: {json_body}")
                    return

            elif response.status_code == 503:
                logging.error(f"503 Error in API Call for {report_name}\n\nResponse:     STATUS CODE: {response.status_code}\nSTATUS DESCRIPTION: {response.reason}\n\nJSON Body: \n\t{json_body}")
                return

            else:
                api_check = 1
                result = response.json()
                return result

        except Exception as err:
            logging.error(f"THERE WAS AN ERROR IN THE API CALL: {err} \n{json_body}")

    error_counter = 0