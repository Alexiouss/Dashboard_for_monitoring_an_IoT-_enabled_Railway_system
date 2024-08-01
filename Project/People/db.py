from pymongo import MongoClient
from datetime import datetime
import json


class DB:

    def __init__(self):
        self.client = MongoClient('your_uri')
        self.db=self.client['Railway']
        print("Connection_established...")

    def insert_sensed_people(self,sensed_people,hour,minute,second):

        collection = self.db['People_counting_live']
        data = {"_id":datetime.now(),"hour":hour,"minute":minute,"second":second,"sensed_people": sensed_people}
        collection.insert_one(data)
    
    def clear_collection(self,collection_name):
        collection=self.db[collection_name]
        collection.delete_many({})

    def get_total_people(self):

        # Define the start and end times for the time period
        start_time = datetime(2023, 9, 17, 17, 0, 0)
        end_time = datetime(2023, 9, 17, 18, 0, 0)

        # Define the aggregation pipeline
        pipeline = [
            {
                "$match": {
                    "_id": {
                        "$gte": start_time,
                        "$lt": end_time
                    }
                }
            },
            {
                "$group": {
                    "_id": None,
                    "totalPeople": {"$sum": "$sensed_people"}
                }
            }
        ]
        collection = self.db['People_counting_live']

        # Execute the aggregation query
        result = list(collection.aggregate(pipeline))

        # Print the result
        if result:
            total_people_sensed = result[0]["totalPeople"]
            print(f"Total people sensed between {start_time} and {end_time}: {total_people_sensed}")
        else:
            print("No data found for the specified time period.")
    
    def insert_historic_data(self,collection_name,file_path):
        collection=self.db[collection_name]
        with open(file_path, "r") as json_file:
            json_data = json.load(json_file)

# Insert the JSON data into the collection
        collection.insert_one(json_data)

    def insert_predictions(self,collection_name,output,id):
        collection = self.db[collection_name]
        data = {"_id":id,"prediction":output}
        collection.insert_one(data)
    
    def detect_wheelchair(self,collection_name,data):
        collection = self.db[collection_name]
        collection.insert_one(data)
    
    def get_wheel(self,collection_name):

        # Find the last document in the collection
        last_element = self.db[collection_name].find_one(sort=[("_id", -1)])

        if last_element:
            print("Last element:", last_element)
        else:
            print("Collection is empty.")
    
    def insert_to_historic_end(self,collection_name,id,data):
        collection=self.db[collection_name]
        collection.update_one({"_id": id},{"$set": data},)
    
    def insert_to_env_pred(self,collection_name,id,data_name,data):
        collection=self.db[collection_name]
        collection.insert_one({"_id":id,data_name:data})
    
    def insert_to_environment_live(self,collection_name,data):
        collection=self.db[collection_name]
        collection.insert_one(data)

    def close_db(self):
        self.client.close()

