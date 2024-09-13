import os
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables from .env file
load_dotenv()

# Retrieve URL and Key from environment variables
url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")

# Initialize Supabase client
supabase: Client = create_client(url, key)

# Fetch all users (employees) from the Employee table
response = supabase.from_('Request').select('*, Employee!Request_Approver_ID_fkey(*), RequestLog(*)').execute()

# Check if the request was successful
if response:
    employees = response
    for employee in employees:
        print(employee)
else:
    print(f"Error fetching data: {response.status_code}")
