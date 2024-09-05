import mediapipe as mp
import cv2
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

#This will plot a 2D and a 3D plot of landmarks of any image you put into the IMAGE_FILES variable

def display_landmarks():

    mp_drawing = mp.solutions.drawing_utils
    mp_drawing_styles = mp.solutions.drawing_styles
    mp_holistic = mp.solutions.holistic

    #The image that will have the points plotted for
    IMAGE_FILES = ['archive/train/happy/Training_371241.jpg']

    BG_COLOR = (192, 192, 192) # gray
    with mp_holistic.Holistic(
        static_image_mode=True,
        model_complexity=2,
        enable_segmentation=True,
        refine_face_landmarks=True) as holistic:
        for idx, file in enumerate(IMAGE_FILES):
            image = cv2.imread(file)

            # Convert the BGR image to RGB before processing.
            results = holistic.process(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))

            face_landmarks = results.face_landmarks.landmark

            x_coords = [landmark.x for landmark in face_landmarks]
            y_coords = [landmark.y for landmark in face_landmarks]

            # Create a scatter plot of the landmarks
            plt.scatter(x_coords, y_coords, c='blue')
            plt.xlabel('X Coordinate')
            plt.ylabel('Y Coordinate')
            plt.title('Face Landmarks')
            plt.gca().invert_yaxis()
            plt.show()

            #This has been taken from https://github.com/google/mediapipe/blob/master/docs/solutions/holistic.md
            annotated_image = image.copy()
            # Draw segmentation on the image.
            # To improve segmentation around boundaries, consider applying a joint
            # bilateral filter to "results.segmentation_mask" with "image".
            condition = np.stack((results.segmentation_mask,) * 3, axis=-1) > 0.1
            bg_image = np.zeros(image.shape, dtype=np.uint8)
            bg_image[:] = BG_COLOR
            annotated_image = np.where(condition, annotated_image, bg_image)
            # draw face landmarks on the image.
            mp_drawing.draw_landmarks(
                annotated_image,
                results.face_landmarks,
                mp_holistic.FACEMESH_TESSELATION,
                landmark_drawing_spec=None,
                connection_drawing_spec=mp_drawing_styles
                .get_default_face_mesh_tesselation_style())
            
            cv2.imwrite('/tmp/annotated_image' + str(idx) + '.png', annotated_image)
            # Plot pose world landmarks.
            mp_drawing.plot_landmarks(
                results.face_landmarks, mp_holistic.FACEMESH_TESSELATION)

display_landmarks() 