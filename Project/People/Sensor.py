import cv2
import numpy as np

class Sensor:

    def __init__(self,sector_id):
        
        self.sector_id=sector_id
        self.width=800
        self.height=600
        self.upper_line_hight=200
        self.lower_line_hight=400


    def lines(self,width,frame_backround):
        
        cv2.line(frame_backround, (0, self.upper_line_hight), (width, self.upper_line_hight), (0, 0, 255), thickness=2)
        cv2.line(frame_backround, (0, self.lower_line_hight), (width, self.lower_line_hight), (255, 0, 0), thickness=2)

        


