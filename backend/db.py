import motor.motor_asyncio

MONGO_URI = "mongodb+srv://smartpix_admin:avDogq6slrzBGgne@smartpix.1ouedcq.mongodb.net/?retryWrites=true&w=majority"
client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URI)
db = client.smartpix
users_collection = db.users
