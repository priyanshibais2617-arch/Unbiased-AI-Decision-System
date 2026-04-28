import os
from motor.motor_asyncio import AsyncIOMotorClient
import asyncio
from dotenv import load_dotenv

async def test_conn():
    load_dotenv(dotenv_path='c:/Users/ASUS/Downloads/Unbiased AI Decision System/backend-project/app/.env')
    url = os.getenv("DATABASE_URL")
    print(f"Testing connection to: {url[:20]}...")
    try:
        client = AsyncIOMotorClient(url, serverSelectionTimeoutMS=5000)
        await client.admin.command('ping')
        print("SUCCESS: Connected to MongoDB")
    except Exception as e:
        print(f"ERROR: Connection failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_conn())
