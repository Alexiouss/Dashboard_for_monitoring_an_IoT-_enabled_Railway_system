import random
import json
from datetime import datetime, timedelta
import calendar

def generate_fake_temperature_data():
    data = {"_id":"2022"}
    start_date = datetime(2022, 1, 1, 8, 59)
    
    delta = timedelta(minutes=15)  # 15-minute intervals for smoother variation it captures smaller changes in temperature over time, making the variations smoother.
    current_date = start_date
    
    # Set the end date to December 31, 2022
    end_date = datetime(2022, 12, 31, 0, 59)

    while current_date <= end_date:
        date_str = current_date.strftime("%Y-%m-%d")
        temperature, humidity  = generate_environment_data(current_date)
        
        if date_str not in data:
            data[date_str] = {"environment_readings": []}

        time_str = current_date.strftime("%H:%M")
        if 8 * 60 + 59 <= current_date.hour * 60 + current_date.minute <= 24 * 60 + 59:
             data[date_str]["environment_readings"].append({"time": time_str, "temperature": temperature, "humidity": humidity})

        current_date += delta
    
    return data

def generate_environment_data(current_date):
    # Set base temperatures for different months
    month = current_date.month
    if 3 <= month <= 4 : 
        base_temperature = 15.0
        base_humidity = 60.0  # Medium humidity in spring
    elif 5 <= month <= 8:
        base_temperature = 25.0
        base_humidity = 40.0  # Lower humidity in summer
    elif 9 <= month <= 10:
        base_temperature = 20.0
        base_humidity = 50.0  # Medium humidity in autumn
    else:
        base_temperature = 10.0
        base_humidity = 70.0  # Higher humidity in winter
    
 # Calculate the time of day as minutes from midnight
    minutes_from_midnight = current_date.hour * 60 + current_date.minute
    
    

    # Gradual descent before 12:00 (12:00 P
    # 
    # M)
    if current_date.hour < 12:
        gradual_descent_rate = (12 - current_date.hour) * random.uniform(0.2,0.3)
        base_temperature -= gradual_descent_rate
        base_humidity += gradual_descent_rate * 2

    # Gradual ascent between 12:00 and 19:00 (12:00 PM to 7:00 PM)
    #may to august
    elif 12 <= current_date.hour < 16 and 5<= month<= 9:
        gradual_ascent_rate = (current_date.hour - 12) * random.uniform(0.7,0.9) 
        base_temperature += gradual_ascent_rate
        base_humidity -= gradual_ascent_rate 

    elif 16 <= current_date.hour < 20 and 5<= month<= 9:
        gradual_ascent_rate = (current_date.hour - 12) * random.uniform(0.3,0.4) 
        base_temperature += gradual_ascent_rate
        base_humidity -= gradual_ascent_rate 

    
    #other months
    elif 12 <= current_date.hour < 16 :
        gradual_ascent_rate = (current_date.hour - 12) * random.uniform(0.3,0.4) 
        base_temperature += gradual_ascent_rate
        base_humidity -= gradual_ascent_rate 

    # Gradual descent after 19:00 (7:00 PM)
    #winter 
    elif current_date.hour >= 16 and 10<= month <= 12 or 1<= month<= 4:
        gradual_descent_rate = (current_date.hour - 19) *random.uniform(0.2,0.3) 
        base_temperature -= gradual_descent_rate
        base_humidity += gradual_descent_rate 

    elif current_date.hour >= 19 and 10<= month <= 12 or 1<= month<= 4:
        gradual_descent_rate = (current_date.hour - 19) * random.uniform(0.7,0.9) 
        base_temperature -= gradual_descent_rate
        base_humidity += gradual_descent_rate 

    #other months
    elif current_date.hour >= 18 :
        gradual_descent_rate = (current_date.hour - 19) * random.uniform(0.2,0.3) 
        base_temperature -= gradual_descent_rate
        base_humidity += gradual_descent_rate 

    elif current_date.hour >= 20 :
        gradual_descent_rate = (current_date.hour - 19) * random.uniform(0.4,0.5) 
        base_temperature -= gradual_descent_rate
        base_humidity += gradual_ascent_rate 
      
      
    
    

    return round(base_temperature, 1), round(base_humidity, 1)


def write_environment_data_to_json(data):
    with open("environment_data_2022.json.", "w") as f:
        json.dump(data, f, indent=2)



if __name__ == "__main__":
    environment_data = generate_fake_temperature_data()
    write_environment_data_to_json(environment_data)
    print("Environmental data generated and stored in environment_data_2022.json.")