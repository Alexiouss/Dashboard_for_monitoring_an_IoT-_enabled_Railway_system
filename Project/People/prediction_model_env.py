import os
import json
import numpy as np
from sklearn.tree import DecisionTreeRegressor
import joblib

def time_to_minutes(time_str):
    # Convert a time string in the format "HH:MM" to minutes since midnight
    hours, minutes = map(int, time_str.split(':'))
    return hours * 60 + minutes



def fetch_data_humidity(file_paths):
    outputh_data = []
    inputh_data = []
    

    for file_path in file_paths:
        with open(file_path, 'r') as json_file:
            data = json.load(json_file)

        for date_key, date_data in data.items():
            if date_key != "_id":
                # Extract data from the current date entry
                readings = date_data.get("environment_readings", [])
                # Convert the date_key to a datetime object
                date_parts = date_key.split('-')
                year, month, day = int(date_parts[0]), int(date_parts[1]), int(date_parts[2])

                # Add your input features (time in minutes, month, and date) here
                for reading in readings:
                    time_minutes = time_to_minutes(reading.get("time", "00:00"))
                    input_matrix = [time_minutes, month, day]
                    
                    inputh_data.append(input_matrix)

                    # Extract the output values (temperature in this case)
                    
                    humidity = reading.get("humidity" , 0.0)
                    outputh_data.append(humidity)
                
                    

    return inputh_data, outputh_data



def fetch_data_temp(file_paths):
    output_data = []
    input_data = []
    

    for file_path in file_paths:
        with open(file_path, 'r') as json_file:
            data = json.load(json_file)

        for date_key, date_data in data.items():
            if date_key != "_id":
                # Extract data from the current date entry
                readings = date_data.get("environment_readings", [])
                # Convert the date_key to a datetime object
                date_parts = date_key.split('-')
                year, month, day = int(date_parts[0]), int(date_parts[1]), int(date_parts[2])

                # Add your input features (time in minutes, month, and date) here
                for reading in readings:
                    time_minutes = time_to_minutes(reading.get("time", "00:00"))
                    input_matrix = [time_minutes, month, day]
                    
                    input_data.append(input_matrix)

                    # Extract the output values (temperature in this case)
                    temperature = reading.get("temperature", 0.0)
                    humidity = reading.get("humidity" , 0.0)
                    output_data.append(temperature)
                
                    

    return input_data, output_data



def write_data_to_json(data):
    with open("predictions.json.", "w") as f:
        json.dump(data, f, indent=2)


def heating_system_status(value):
    heating_system = False
    if value >= 20 :
            heating_system = True
            # print(heating_system)
    else : 
            heating_system


    return heating_system 




def main():
    # Specify the paths to your JSON files
    json_file_paths_inside = [
       os.getcwd()+"\\environment_data_2019.json",
        os.getcwd()+"\\environment_data_2020.json",
        os.getcwd()+"\\environment_data_2021.json",
        os.getcwd()+"\\environment_data_2022.json"
        # Add more file paths as needed
    ]

    
   
    # Generate the input and output data
    input_data = []
    output_data = []

    for json_file_path in json_file_paths_inside:
        # Generate the input and output data for each JSON file
        file_input_data, file_output_data = fetch_data_temp([json_file_path])
        
        # Extend the main input and output data lists with data from the current file
        input_data.extend(file_input_data)
        output_data.extend(file_output_data)
    
    # Create datasets
    X, y = input_data, output_data

    # Define the model
    model = DecisionTreeRegressor()

    # Fit the model
    model.fit(X, y)


    inputh_data = []
    outputh_data = []

    for json_file_path in json_file_paths_inside:
        # Generate the input and output data for each JSON file
        file_input_data, file_output_data = fetch_data_humidity([json_file_path])
        
        # Extend the main input and output data lists with data from the current file
        inputh_data.extend(file_input_data)
        outputh_data.extend(file_output_data)
    
    # Create datasets
    Xh, yh = inputh_data, outputh_data

    # Define the model
    model2 = DecisionTreeRegressor()

    # Fit the model
    model2.fit(Xh, yh)

    # Define the date for which you want predictions (modify as needed)
    target_date = "2023-09-27"  # Modify to your desired date

    # Define the time slots for which you want predictions (modify as needed)
    time_slots = [
        "08:59",
        "09:29",
        "09:59",
        "10:29",
        "10:59",
        "11:29",
        "11:59",
        "12:29",
        "12:59",
        "13:29",
        "13:59",
        "14:29",
        "14:59",
        "15:29",
        "15:59",
        "16:29",
        "16:59",
        "17:29",
        "17:59",
        "18:29",
        "18:59",
        "19:29",
        "19:59",
        "20:29",
        "20:59",
        "21:29",
        "21:59",
        "22:29",
        "22:59",
        "23:29",
        "23:59"
        # Add more time slots here
    ]

    predictions = []
    
    # Make predictions for each time slot
    for time_slot in time_slots:
        # Prepare input features for the current time slot and date
        time_minutes = time_to_minutes(time_slot)
        date_parts = target_date.split('-')
        year, month, day = int(date_parts[0]), int(date_parts[1]), int(date_parts[2])
        input_features = [time_minutes, month, day]
        input_features = np.array(input_features).reshape(1, -1)  # Reshape for prediction
        y_pred = model.predict(input_features)
       
        yh_pred = model2.predict(input_features)
        

        # date_str = target_date
        time_str = time_slot

           # Append the predictions to the "environment_readings" list
        predictions_entry = {
                "time": time_str,
                "temperature": float(y_pred),
                "humidity": float(yh_pred),
                "heating system status " : heating_system_status(y_pred)
                
            }

        predictions.append(predictions_entry)

        # # Print the prediction for the current time slot and date
        print(f"Predicted Temperature for {target_date} {time_slot}: {y_pred}")
        print(f"Predicted Humidity for {target_date} {time_slot}: {yh_pred}")
        data = {
            "date": target_date,
            "environment_readings": predictions
        }

    # Save the trained model to a file
    model_filename = 'prediction_model_temp.pkl'  # Choose a file name
    model_filename_humidity='predition_model_humidity.pkl'
    joblib.dump(model, model_filename)
    joblib.dump(model2,model_filename_humidity)
    print(f"Trained model saved to {model_filename}")
    
    print(f"Trained model saved to {model_filename_humidity}")
    
    
    
    heating_system_status(y_pred)
    write_data_to_json(data)





    
if __name__ == "__main__":

    main()

   