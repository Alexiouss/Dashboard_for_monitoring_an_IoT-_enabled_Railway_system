import time
import random
import numpy as np
import json
import os 
import db
# Function to convert time to minutes
def time_to_minutes(time_str):
    hours, minutes = map(int, time_str.split(':'))
    return hours * 60 + minutes

# Function to simulate real temperature (replace with actual sensor reading)
def get_real_temperature(min,max):
    return random.uniform(min, max)


def get_real_humidity(min,max):
    return random.uniform(min,max)
# Function to control the heating system

# Main loop for continuous temperature control
def main():
    my_db=db.DB()
    file_path_humidity=os.getcwd()+'\\humidity_data.json'
    file_path_temprature=os.getcwd()+'\\temprature_data.json'
    with open(file_path_humidity, "r") as json_file:
        data_humidity = json.load(json_file)
    
    with open(file_path_temprature, "r") as json_file:
        data_temprature = json.load(json_file)
    counter=0
    temp_values = [entry["temprature"] for entry in data_temprature]
    max_temp=max(temp_values)
    min_temp=min(temp_values)
    humidity_values = [entry["humidity"] for entry in data_humidity]
    max_humidity=max(humidity_values)
    min_humidity=min(humidity_values)
    while True:
        real_humidity=get_real_humidity(min_humidity,max_humidity)
        real_temp = get_real_temperature(min_temp,max_temp)
        # Append data to the list
        data_env={
            "real_temp": real_temp,
            "real_humidity":real_humidity
        }
        my_db.insert_to_environment_live('environment_system',data_env)
        
        time.sleep(5)  # Wait for 5 seconds before the next iteration

if __name__ == "__main__":
    main()
