import requests
import json
import datetime
def get_weather_data(api_key, city):
    base_url = f"http://api.openweathermap.org/data/2.5/forecast?lat={37.9839412}&lon={23.7283052}&appid={api_key}"
    params = {
        "q": city,
        "appid": api_key,
        "units": "metric",
    }

    response = requests.get(base_url)

    if response.status_code == 200:
        return response.json()
    else:
        raise Exception("Failed to retrieve weather data.")

def extract_humidity_for_next_day(weather_data):
    humidity_data = []
    for forecast in weather_data['list']:
        date = forecast['dt_txt']
        date_str=date[0:10]
        current_date=str(datetime.datetime.now())
        current_date_str=current_date[0:10]
        humidity = forecast['main']['humidity']
        if(date_str!=current_date_str):
            break
        humidity_data.append({'date': date, 'humidity': humidity})
    return humidity_data


def extract_temprature_for_next_day(weather_data):
    temprature_data=[]
    for forecast in weather_data['list']:
        date=forecast['dt_txt']
        date_str=date[0:10]
        current_date=str(datetime.datetime.now())
        current_date_str=current_date[0:10]
        temprature=forecast['main']['temp']
        temprature=round((temprature-273.15),2)
        if(date_str!=current_date_str):
            break
        temprature_data.append({'date': date, 'temprature': temprature})
    return temprature_data



def save_to_json(data, file_path):
    with open(file_path, 'w') as json_file:
        json.dump(data, json_file, indent=4)


def save_to_json_temp(data, file_path):
    with open(file_path, 'w') as json_file:
        json.dump(data, json_file, indent=4)

if __name__ == "__main__":
    API_KEY = "19fff106b53d35ce16bdb6f9baef9597"
    CITY_NAME = "Athens"
    try:
        weather_data = get_weather_data(API_KEY, CITY_NAME)
        humidity_data = extract_humidity_for_next_day(weather_data)
        temprature_data=extract_temprature_for_next_day(weather_data)
        save_to_json(humidity_data, "humidity_data.json")
        save_to_json_temp(temprature_data,"temprature_data.json")
        print("Humidity data for the next day saved to 'humidity_data.json'")
    except Exception as e:
        print("Error:", e)

