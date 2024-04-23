# Required Packages
import os
from dotenv import load_dotenv
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

# Load environment variables
load_dotenv(dotenv_path="../.env")

# Import custom logger
from Error_Logger_Template import logger

# Call Synchronous Process
sg = SendGridAPIClient(os.environ.get('SENDGRID_API_KEY'))

message = Mail(
    to='recipient@email_provider.com',
    from_email='sender@company.com',
    subject='Sending Email with Sendgrid is Fun',
    plain_text_content='Test Message from Sendgrid API using Python',
    html_content='<strong>Test Message from Sendgrid API Python HTML Message</strong>'
)

try:
    response = sg.send(message)
    print("Email sent successfully to the recipient")
except Exception as e:
    logger.error(f"There was an error sending this email: {e}")