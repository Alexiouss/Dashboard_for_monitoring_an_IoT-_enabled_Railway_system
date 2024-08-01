import Person,Sensor
import random,datetime,time,cv2,numpy as np
import db
import requests

def person_generator(num_of_persons,last_executed_time):
    current_time=time.time()
    if current_time - last_executed_time >= 5:
        weights=[75,25]
        for _ in range(num_of_persons):
            x_coord=random.randint(200,frame_width-200)
            y_coord=random.choices([-20,frame_height+20],weights,k=1)[0]
            direction=random.randint(-1,1)
            starting_position=y_coord
            is_emploee=random.choices([True,False],[1,9],k=1)[0]
            person_id=len(tracked_persons)+1
            tracked_persons.append(Person.MyPerson(starting_position,x_coord,y_coord,direction,person_id,is_emploee))
        return current_time
    return last_executed_time
        

def tracking(tracked_persons):
    dy=0
    temp_count=0
    for person in tracked_persons:
        if (person.starting_position == -20 ):
            current_position=person.y_coor
            person.show_person(frame_backround)
            dy=random.randint(2,3)
            person.y_coor+=dy
            person.x_coor+=person.direction
            next_position=person.y_coor
            if(current_position<lower_line and next_position>=lower_line and person.is_emploee==False):
                temp_count+=1
        else:
            current_position=person.y_coor
            person.show_person(frame_backround)
            dy=random.randint(2,3)
            person.y_coor-=dy
            person.x_coor+=person.direction
            next_position=person.y_coor
            if(current_position>upper_line and next_position<=upper_line and person.is_emploee==False):
                temp_count-=1
    if(temp_count!=0):
        date=datetime.datetime.now()
        my_db.insert_sensed_people(temp_count,date.hour,date.minute,date.second)
    return temp_count        


if __name__=='__main__':
    sensor_1=Sensor.Sensor(1)
    person_id=1
    frame_backround = 128 * np.ones((600, 800, 3), dtype=np.uint8)
    frame_width=sensor_1.width
    frame_height=sensor_1.height

    lines=sensor_1.lines(frame_width,frame_backround)
    upper_line=sensor_1.upper_line_hight
    lower_line=sensor_1.lower_line_hight
    tracked_persons=[]
    threshold=20
    people_count=0
    weights=[30,20,15,10,10,5,4,3,2,1]
    my_db=db.DB()
    t0=time.time()
    last_executed_time = time.time()

    my_db.clear_collection('People_counting_live')
    while True:
        
        date=datetime.datetime.now()
        if(len(tracked_persons)<threshold):
            num_of_persons=random.choices([1,2,3,4,5,6,7,8,9,10],weights,k=1)[0]
            last_executed_time=person_generator(num_of_persons,last_executed_time)
            people_count+=tracking(tracked_persons)
            cv2.imshow('Station', frame_backround)
        
            cv2.waitKey(30)
            frame_backround .fill(128)
            sensor_1.lines(frame_width,frame_backround)

        else:
            people_count+=tracking(tracked_persons)
            cv2.imshow('Station', frame_backround)
            cv2.waitKey(30)
            frame_backround.fill(128)
            sensor_1.lines(frame_width,frame_backround)
        if(len(tracked_persons)>0):
            if((len(tracked_persons)>=threshold) and 
            (tracked_persons[-1].y_coor>frame_height and tracked_persons[-1].starting_position==-20) or 
            (tracked_persons[-1].y_coor<0 and tracked_persons[-1].starting_position==frame_height+20)):
                break
    cv2.destroyAllWindows()
    my_db.close_db()
    t1=time.time()
    print(people_count,t1-t0)   
