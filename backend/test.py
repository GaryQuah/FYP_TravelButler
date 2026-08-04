import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import app.config as config


async def main():
    print("Connecting to MongoDB...")

    client = AsyncIOMotorClient(
        config.MONGO_URL,
        serverSelectionTimeoutMS=10000,
    )

    try:
        result = await client.admin.command("ping")
        print("SUCCESS:", result)
    except Exception as e:
        print("FAILED:", repr(e))
    finally:
        client.close()


asyncio.run(main())