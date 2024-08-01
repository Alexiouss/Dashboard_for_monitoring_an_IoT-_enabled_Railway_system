import datetime
import joblib  # Import joblib for model serialization
import db
import numpy as np
my_db=db.DB()

def time_to_minutes(time_str):
    # Convert a time string in the format "HH:MM" to minutes since midnight
    hours, minutes = map(int, time_str.split(':'))
    return hours * 60 + minutes


model = joblib.load('prediction_model_temp.pkl') 
model_humidity=joblib.load('predition_model_humidity.pkl') 
current_date = datetime.date.today()
# Calculate the next date by adding one day
target_date = str(current_date + datetime.timedelta(days=1))
#target_date = str(current_date) comment this out when you want to predict the people of the same day
date_str = current_date.strftime("%Y-%m-%d")
timeslots=[]
start_hour=8
start_minutes=59
for i in range(61):
    current_minutes=start_minutes
    current_hour=start_hour
    time_str=str(current_hour)+":"+str(current_minutes)
    timeslots.append(time_str)
    start_minutes=current_minutes+15
    if(start_minutes>60):
        start_hour+=1
        start_minutes-=60


predictions =[]
    
    # Make predictions for each time slot
for time_slot in timeslots:
        # Prepare input features for the current time slot and date
    time_minutes = time_to_minutes(time_slot)
    date_parts = target_date.split('-')
    year, month, day = int(date_parts[0]), int(date_parts[1]), int(date_parts[2])
    input_features = [time_minutes, month, day]
    input_features = np.array(input_features).reshape(1, -1)  # Reshape for prediction
    y_pred = model.predict(input_features)
    
    yh_pred = model_humidity.predict(input_features)
    

    # date_str = target_date
    time_str = time_slot

        # Append the predictions to the "environment_readings" list
    predictions_entry = {
            "time": time_str,
            "temperature": float(y_pred[0]),
            "humidity": float(yh_pred[0]),
    }


    predictions.append(predictions_entry)

    # # Print the prediction for the current time slot and date
my_db.insert_to_env_pred('env_predictions',target_date,"environment_readings",predictions)
my_db.close_db()
