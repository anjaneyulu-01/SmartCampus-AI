from mongo_connect import get_mongo_db

# Get the database and collection
collection = get_mongo_db()["test_collection"]

# Insert dummy data
dummy_data = {"name": "Test User", "status": "success", "timestamp": "2026-01-06T00:00:00Z"}
result = collection.insert_one(dummy_data)

print(f"Inserted document ID: {result.inserted_id}")
