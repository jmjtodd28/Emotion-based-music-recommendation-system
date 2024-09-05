import mediapipe as mp
import cv2
import numpy as np
import csv
import pandas as pd
import matplotlib.pyplot as plt
import os

# there are a total of 478 facial landmarks all with a x,y,z coordinate
landmark_total = 478

mp_holistic = mp.solutions.holistic

csv_file_path = 'face_landmarks_ck_test.csv'
headers = ['label']
with open(csv_file_path, mode='w', newline='') as file:
    writer = csv.writer(file)
    for i in range(landmark_total):
        headers += ['x{}'.format(i), 'y{}'.format(i), 'z{}'.format(i)]
    writer.writerow(headers)

#Total number of photos = 981
num_of_files = 981

files_processed = 0
error_files = 0

emotions = os.listdir('archive_ckplus/CK+48')

for emotion in emotions:
    IMAGE_FILES = os.listdir('archive_ckplus/CK+48/' + emotion)

    with mp_holistic.Holistic(static_image_mode=True,
        model_complexity=2,
        enable_segmentation=True,
        refine_face_landmarks=True) as holistic:
        for i, file in enumerate(IMAGE_FILES):

            file_path = 'archive_ckplus/CK+48/' + emotion + '/' + file
            try:
                image = cv2.imread(file_path, cv2.IMREAD_GRAYSCALE)

                # Convert the greyscale image to RGB before processing.
                results = holistic.process(cv2.cvtColor(image, cv2.COLOR_GRAY2RGB))

                face_landmarks = results.face_landmarks.landmark

                #Extract all the x, y, z values of all the landmarks, put them in a list and then into the csv with the corresponding emotion lable
                coords = np.array([])
                coords = np.append(coords, emotion)

                for landmark in face_landmarks:
                    coords = np.append(coords, format(landmark.x, '.9f'))
                    coords = np.append(coords, format(landmark.y, '.9f'))
                    coords = np.append(coords, format(landmark.z, '.9f'))

                with open(csv_file_path, mode='a', newline='') as file:
                    writer = csv.writer(file)
                    writer.writerow(coords)

                files_processed += 1
                print(f"\rProcessed files {files_processed + error_files}/{num_of_files}   errors:{error_files}", end='')

            except Exception as e:
                print(e)
                error_files += 1
                print(f"\rProcessed files {files_processed + error_files}/{num_of_files}   errors:{error_files}", end='')
                continue