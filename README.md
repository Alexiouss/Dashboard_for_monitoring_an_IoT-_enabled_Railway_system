# Dashboard_for_monitoring_an_IoT_enabled_Railway_system

This is a project that was implemented within the context of my university course, Internet of Things.

# Description
This is a custom Dashboard of a railway employee for monitoring certain parts of the railway station. Through the Dashboard they can monitor (through simulated sensors,prediction and computer vision algorithms), the humidity and the temprature of the station, how many people are currently in the station and if there are any people with monility problems in a wheelchair so that they can assist them. Also they can view statistics for previous days and they can use the dashboard to predict how many people are going to be in the station the day after, so that they can assign the most efficent number of employees. They can also predict the temprature and humidity.

# How to use
* After cloning the repository, make sure to change the paths in the server.js file to the correct path of your pc.
* Make sure to run the web_scrapping.py file so that you get the data for the humidity and temprature of the current day. Make sure that the json files from the web scrapping are in the same file as the server.js file.
* Before running the server you should run the files multi_output_model_2.ipynb and prediction_model_env.py so that your prediction models are up to date with the scikit-learn version.
* In the server.js file in lines 332 and 422 make sure to change the dates to the current date.
* For the server to run you will a connection to a mongoDB database. To insert the historic data to the dataset you need to run the file DB_queries.py and update the jason file to insert and the collection to be inserted ,accordingly.
* The historic data for the people in the stations are saved in the jason files 'year'.json
After you create your database the database name should be 'Railway' and the collection names should be :
  1. People_counting_live
  2. People_in_the_station_historic
  3. Predictions_for_people
  4. Wheelchair_detection
  5. env_predictions
  6. environment_system
  7. environmental_data

After creating the database you are good to go by running the server.js file. The server runs on the localhost at the port 8080.
