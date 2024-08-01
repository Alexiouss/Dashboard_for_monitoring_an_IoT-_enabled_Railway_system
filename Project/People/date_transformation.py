import numpy as np
import datetime
import calendar
import db

my_db=db.DB()
holidays=["2023-10-28","2023-12-25","2023-12-26"]
# Input date in the format 'YYYY-MM-DD'


current_date = str(datetime.date.today())
# Calculate the next date by adding one day

# Parse the date string into a datetime object
date_obj = datetime.datetime.strptime(current_date, '%Y-%m-%d')
year=int(current_date[0:4])
month=int(current_date[5:7])
days_of_month=calendar.monthrange(year,month)[1]
# Get the day of the year (1-365)
day_of_year = date_obj.timetuple().tm_yday

# Get the day of the week (0-6, where Monday is 0 and Sunday is 6)
day_of_week = date_obj.weekday()

dist=-10
day=int(current_date[-2]+current_date[-1])
is_holiday=0
day_from_holiday=100
Holiday=7
flag=0
for i in range(len(holidays)):
    temp_holiday=holidays[i][5:10]
    if(current_date==holidays[i]):
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
is_weekend=0
if day_of_week>=5:is_weekend=1
data={current_date:{"day":day_of_year,"is_weekend":is_weekend,"dist_from_holiday":dist,"is_holiday":is_holiday,"day_of_week":day_of_week}}
my_db.insert_to_historic_end('People_in_the_station_historic',str(year),data)
my_db.close_db()