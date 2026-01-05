# MongoDB Atlas connection for deepface_scan.py
# Place this file in the same directory as deepface_scan.py

from pymongo import MongoClient
import os

# Get MongoDB URI from environment variable or hardcode for testing
MONGO_URI = os.getenv("MONGO_URI", "mongodb+srv://anjaneyuludev01_db_user:4sasZVYx7LKfNEws@cluster0.4x6ysvz.mongodb.net/?appName=Cluster0")

# Connect to MongoDB Atlas
client = MongoClient(MONGO_URI)

def get_mongo_db(db_name="face_recognition"):
    """Return a reference to the MongoDB database."""
    return client[db_name]

# Example usage:
# db = get_mongo_db()
# collection = db["attendance_records"]
# collection.insert_one({"test": "success"})
