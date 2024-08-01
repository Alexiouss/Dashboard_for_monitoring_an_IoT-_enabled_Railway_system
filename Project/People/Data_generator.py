import random
import json
from datetime import datetime, timedelta
import calendar
import numpy as np
def generate_fake_data():
    data = {"_id":"2018"}
    start_date = datetime(2018, 1, 1, 8, 59)

    # #holidays_18
    holidays=["2018-01-01","2018-02-19","2018-03-25","2018-04-07","2018-04-08","2018-05-01",
               "2018-05-28","2018-08-15","2018-10-28","2018-12-25"]
    # #holidays_19
    # holidays=["2018-01-01","2018-03-11","2018-03-25","2018-04-27","2018-04-28","2018-05-01",
    #            "2018-06-17","2018-08-15","2018-10-28","2018-12-25"]

    # #holidays_20
    # holidays=["2018-01-01","2018-03-02","2018-03-25","2018-04-19","2018-04-20","2018-05-01",
    #            "2018-06-08","2018-08-15","2018-10-28","2018-12-25"]
    
    # #holidays_21
    # holidays=["2018-01-01","2018-03-15","2018-03-25","2018-04-30","2018-05-01","2018-05-02",
    #            "2018-06-21","2018-08-15","2018-10-28","2018-12-25"]
    
    # #holidays_22
    # holidays=["2018-01-01","2018-03-06","2018-03-25","2018-04-22","2018-04-23","2018-05-01",
    #          "2018-06-13","2018-08-15","2018-10-28","2018-12-25"]
    delta = timedelta(minutes=60)  # One hour interval
    current_date = start_date
    day_of_year=1
    for month in range(1,13):
        Holiday=7
        day_from_holiday=100
        days_of_month=calendar.monthrange(2018,month)[1]
        for day in range(1, days_of_month + 1):
            dist=-10
            total_people=0
            weight=1
            date_str = current_date.strftime("%Y-%m-%d")
            
            is_holiday=0
            for holiday in holidays:
                temp_holiday=holiday[5:10]
                if(date_str==holiday):
                    is_holiday=1
                    dist=0
                    Holiday=day
                    day_from_holiday=Holiday+2
                    holidays.remove(holiday)
                    break
                else:
                    break
            

            days_till_holiday=int(temp_holiday[-2]+temp_holiday[-1])-int(date_str[-2]+date_str[-1])
            if(days_till_holiday<0):
                days_till_holiday+=days_of_month 
            

            if((days_till_holiday==2 or days_till_holiday==1) and 
               ((month-int(temp_holiday[0]+temp_holiday[1])==0))): 
                if(days_till_holiday==2):
                    weight=1.3
                    dist=-2
                elif(days_till_holiday==1):
                    weight=1.5
                    dist=-1   
            

            if(day==day_from_holiday-1 or day==Holiday):
                weight=1
                if(day==day_from_holiday-1):
                    weight=1.2
                    dist=1

            if((day==day_from_holiday) or (day==day_from_holiday+1)):
                if(day==day_from_holiday):
                    dist=2
                    weight=1.6
                else:
                    weight=1.4
                    dist=3
            
            day_of_week = calendar.weekday(2018, month, day)  # 0 = Monday, 6 = Sunday
            is_weekend = day_of_week >= 5
            if(is_weekend):
                is_weekend=1
                if(day_of_week==5):
                    weight=3*weight
                elif(day_of_week==6):
                    weight=2.9*weight
                if(day==day_from_holiday-1):
                    weight=1.2
                elif(day==Holiday):
                    weight=1
            else:
                is_weekend=0
                weight=(((day_of_week/2))*weight)+1
                if(day==day_from_holiday-1):
                    weight=1.2
                elif(day==Holiday):
                    weight=1
                
            peak_hour = random.randint(12, 21)  # Randomly choose a peak hour
            weight=weight+0.9*abs(np.sin(day_of_year))
            peak_people=random.randint(int(weight*100),int(weight*200))
            #total_people=peak_people

            
            if date_str not in data:
                data[date_str] = {"day":day_of_year,"is_weekend":is_weekend, "dist_from_holiday": dist,"is_holiday": is_holiday,"day_of_week":day_of_week,"peak_hour":peak_hour, "timeslots": []}

            day_of_year+=1
            for i in range(14):
                i+=1
                if current_date.hour < 12:
                    max_value=int(weight*100)-1
                    # Before 11:59 AM
                    people_count = max_value-random.randint(1,50)
                else:
                    # 11:59 AM to 8:59 PM
                    if current_date.hour == peak_hour:
                        # Peak hour
                        people_count = peak_people
                    else:
                        max_value=peak_people
                        people_count = int(np.random.normal(max_value,scale=50,size=1))
                        while(people_count>=max_value):
                            people_count = max_value-random.randint(1,50)

                total_people+=people_count
                time_str = current_date.strftime("%H:%M")

                

                data[date_str]["timeslots"].append({"time": time_str, "people_count": people_count})
                current_date += delta
            data[date_str].update({"Total_number_of_people":total_people})
            
            current_date+=10*delta
    
    return data

def write_to_json_file(data):
    with open("2018.json", "w") as f:
        json.dump(data, f, indent=2)

if __name__ == "__main__":
    fake_data = generate_fake_data()
    write_to_json_file(fake_data)
    print("Fake data generated and stored in 2018.json.")
