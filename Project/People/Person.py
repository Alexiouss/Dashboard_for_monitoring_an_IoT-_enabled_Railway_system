import cv2
import numpy as np
class MyPerson:
    
    def __init__(self,starting_position,x_coor,y_coor,direction,person,is_imploee):
        
        self.id=person
        self.x_coor=x_coor
        self.y_coor=y_coor
        self.is_emploee=is_imploee
        self.starting_position=starting_position
        self.direction=direction
        

    def show_person(self,frame_backround):
        if(self.is_emploee==False):
            cv2.circle(frame_backround,(self.x_coor,self.y_coor),20,(0,255,0),-1)
            text_size = cv2.getTextSize(str(self.id), cv2.FONT_HERSHEY_SIMPLEX, 0.5, 1)[0]
            text_x = self.x_coor - text_size[0] // 2
            text_y = self.y_coor + text_size[1] // 2
            cv2.putText(frame_backround, str(self.id), (text_x, text_y), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 0), 1)

        else:
            cv2.circle(frame_backround,(self.x_coor,self.y_coor),20,(255,0,255),-1)
            text_size = cv2.getTextSize(str(self.id), cv2.FONT_HERSHEY_SIMPLEX, 0.5, 1)[0]
            text_x = self.x_coor - text_size[0] // 2
            text_y = self.y_coor + text_size[1] // 2
            cv2.putText(frame_backround, str(self.id), (text_x, text_y), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 0), 1)


