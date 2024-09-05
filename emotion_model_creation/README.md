# Emotion detection model creation

## Extracting coordinates

One of the steps is to extract the facial landmark coordinates of both datasets. The datasets have not been included in the repo but they can be found here, Fer-2013 - https://www.kaggle.com/datasets/msambare/fer2013 , ck+ - https://www.kaggle.com/datasets/shawon10/ckplus . **landmarkCoordinates.py** was used to extract from the FER-2013 dataset, and the **landmark_coordinates_ck.py** was used to extract coordinates from the ck+ dataset. To run the extraction code, place the two datasets in the same directories as the python scripts and run them. This will create three csv's, face_landmarks_ck.csv (ck+), face_landmarks_test.csv (Fer-2013) and face_landmarks_train.csv (Fer-2013). The FER-2013 is pre split into testing and training data whilst this split is something we do later with the ck+ set. Note, extracting the landmarks for the FER-2013 dataset can take a lot of time, took my m1 mac, 8GB ram roughly 45 mins.

To visualise the coordinates of the images, the **draw_landmarks.py** can be run to produce a 2D and a 3D plot of the points, you will need to change the IMAGE_FILES variable to the path of a image you wish to draw coordinates for.

## Training and evaluating the models

The two jupyter notebooks were used to train and evaluate the models in google collab. Training neural networks can be very computationally intense, hence why these notebooks were run on google collab and then copied to here. The coordinates csv's where saved to a google drive which collab can then access. **CNN.ipynb** was used to train the FER-2013 model and **CK_CNN_4_emotions.ipynb** was used to train the ck+ model.
