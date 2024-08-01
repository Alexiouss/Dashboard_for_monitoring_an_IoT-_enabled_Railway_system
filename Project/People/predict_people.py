import joblib
import numpy as np
import datetime
import calendar
import db
import os

holidays=["2023-10-28","2023-12-25","2023-12-26"]
# Input date in the format 'YYYY-MM-DD'

current_date = datetime.date.today()
# Calculate the next date by adding one day
target_date = str(current_date + datetime.timedelta(days=1))

# Parse the date string into a datetime object
date_obj = datetime.datetime.strptime(target_date, '%Y-%m-%d')
year=int(target_date[0:4])
month=int(target_date[5:7])
days_of_month=calendar.monthrange(year,month)[1]
# Get the day of the year (1-365)
day_of_year = date_obj.timetuple().tm_yday

# Get the day of the week (0-6, where Monday is 0 and Sunday is 6)
day_of_week = date_obj.weekday()

dist=-10
day=int(target_date[-2]+target_date[-1])
is_holiday=0
day_from_holiday=100
Holiday=7
flag=0
for i in range(len(holidays)):
    temp_holiday=holidays[i][5:10]
    if(target_date==holidays[i]):
        is_holiday=1
        dist=0
        Holiday=day
        break
    if(month==int(holidays[i][5:7])):
        if(day>int(holidays[i][-2]+holidays[i][-1])):
            dist_=day-int(holidays[i][-2]+holidays[i][-1])
            if(i==2):
                next_month=int(holidays[i][5:7])
            else:
                next_month=int(holidays[i+1][5:7])
            if((dist_== 1 or dist_==2 or dist_==3) and month!=next_month):
                if(dist_==1):
                    dist=1
                elif(dist_==2):
                    dist=2
                else:
                    dist=3
                break
            elif((dist_== 1 or dist_==2 or dist_==3) and month==next_month):
                if(dist_==1):
                    dist=1
                elif(dist_==2):
                    dist=2
                else:
                    dist=3
                continue
        elif(day<int(holidays[i][-2]+holidays[i][-1])):
            break
    elif(month>int(holidays[i][5:7])):
        continue
    else:
        break


days_till_holiday=int(temp_holiday[-2]+temp_holiday[-1])-day
if(days_till_holiday<0):
    days_till_holiday+=days_of_month 

if((days_till_holiday==2 or days_till_holiday==1) and 
    ((month-int(temp_holiday[0]+temp_holiday[1])==0))): 
    if(days_till_holiday==2):
        dist=-2
    elif(days_till_holiday==1):
        dist=-1   
            

sum=0
loaded_model = joblib.load('people_prediction_model.pkl')
is_weekend=0
if day_of_week>=5:is_weekend=1
output=[]
my_db=db.DB()
for i in range(14):
        # Prepare input features for the current time slot and date
        input_features = [i,is_weekend,is_holiday,dist,day_of_year,day_of_week]
        input_features = np.array(input_features).reshape(1, -1)  # Reshape for prediction
        y_pred = loaded_model.predict(input_features)
        sum+=y_pred
        output.append({"Timeslot":i,"People":y_pred[0]})
        # Print the prediction for the current time slot and date
        print(f"Predicted People for {target_date} {i}: {y_pred}")
my_db.insert_predictions("Predictions_for_people",output,target_date)
my_db.close_db()
print(sum)
