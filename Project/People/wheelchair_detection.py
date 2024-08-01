from ultralytics import YOLO
import cv2
import numpy as np
import json
import db
import datetime
import time
my_db=db.DB()
# read input image
images=['bike1_92_png.rf.17bf77c1bc60a9ebdc7db1ea3cddac9a.jpg','bike1_6_png.rf.5947b8e90778d9d000f5abe992c7f39f.jpg','market-after-dark-studiouweb.jpg','img_0331_png.rf.34bdd73189c13a241b80c287e07b9895.jpg']

def select_image(i):
    return cv2.imread('dataset/test/images/'+images[i])

def recognise(img):

# Define the new dimensions for the smaller image
    new_width = 160  # Adjust this value to your desired width
    new_height = 120  # Adjust this value to your desired height
    # Resize the image to the new dimensions
    smaller_img = cv2.resize(img, (new_width, new_height))

    model = YOLO('best.pt')
    img_array = np.array(smaller_img)
    bbs=model.predict(img_array, save=True, imgsz=320, conf=0.5)

    bbs_list=bbs[0]
    json_data=bbs_list.tojson()


    # Parse the JSON data
    data = json.loads(json_data)
    names = [item["name"] for item in data]

    # Convert the list to a dictionary with the "name" key
    name_dict = {"name": names}
    data_json={"_id":datetime.datetime.today(),"detection":name_dict}
    # Check if a document with the name "wheel_chair" exists
    my_db.detect_wheelchair('Wheelchair_detection',data_json)

i = 0

while True:
    recognise(select_image(i))
    i += 1
    time.sleep(10)  # Sleep for 20 seconds before running the next iteration
    if(i>=len(images)):
        break