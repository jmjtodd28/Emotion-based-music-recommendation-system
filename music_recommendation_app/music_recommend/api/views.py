from django.shortcuts import render
import base64
import os
import cv2
import mediapipe as mp
import numpy as np
from tensorflow.keras.models import load_model
from django.http import HttpResponse, JsonResponse
from frontend.models import PreferenceData
from django.views import View
import json

def main(request):
    return HttpResponse("Hello World")

class PreferenceDataView(View):

    def get(self, reqeust, *args, **kwargs):
        try:
            if PreferenceData.objects.exists:
                preference_data = PreferenceData.objects.values().first()
                return JsonResponse({'success': True, 'data': preference_data})
            else:
                return JsonResponse({'success:': False, 'message': 'There is no data'})
        except Exception as e:
            return JsonResponse({'success': False, 'message': str(e)})

    def post(self, request, *args, **kwargs):
        try:
            data = json.loads(request.body)

            if PreferenceData.objects.exists():
                PreferenceData.objects.all().delete()

            happy = data['happy']
            sad = data['sad']
            angry = data['angry']
            neutral = data['neutral']

            PreferenceData.objects.create(
                happy = happy,
                sad = sad,
                angry = angry,
                neutral = neutral
            )

            return JsonResponse({'success': True, 'message': 'Data saved successfully.'})
        except Exception as e:
            return JsonResponse({'success': False, 'message': str(e)})

class GetCurrentEmotion(View):
        #load the model on init so i dont have to do it for every load
    def __init__(self, *args, **kwargs):
        super(GetCurrentEmotion, self).__init__(*args, **kwargs)
        current_directory = os.path.dirname(os.path.abspath(__file__))
        model_path = os.path.join(current_directory, 'emotion_detection_model.keras')
        self.model = load_model(model_path)
    
    def post(self, request, *args, **kwargs):
        try:
            data = json.loads(request.body)
            #The images comes bas64 encoded
            base64_image = data['image']
            
            base64_data = base64_image.split(',')[1]

            image_data = base64.b64decode(base64_data)

            image_np = cv2.imdecode(np.frombuffer(image_data, np.uint8), cv2.IMREAD_COLOR)

            #Load the premade cascade Classifier to detect faces 
            face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
            #model needs input to be greyscale
            gray = cv2.cvtColor(image_np, cv2.COLOR_BGR2GRAY)
            faces = face_cascade.detectMultiScale(gray, 1.3, 5)
            if len(faces) == 0:
                return JsonResponse({'success': False, 'prediction': "No face detected"})
        
            #We need to crop image to be just the face to mimic what the training photos were just face and this affects the coordiantes and therefor the predictions
            (x, y, w, h) = faces[0]
            cropped_image = image_np[y:y+h, x:x+w]

            mp_holistic = mp.solutions.holistic

            with mp_holistic.Holistic(static_image_mode=True,
                                    model_complexity=2,
                                    enable_segmentation=True,
                                    refine_face_landmarks=True) as holistic:
                image_rgb = cv2.cvtColor(cropped_image, cv2.COLOR_BGR2RGB)

                results = holistic.process(image_rgb)

                if results.face_landmarks is None:
                    return JsonResponse({'success': False, 'prediction': "No emotion detected"})

                face_landmarks = results.face_landmarks.landmark

                #Facial landmark coordinates
                coords = np.array([])
                
                for landmark in face_landmarks:
                    coords = np.append(coords, format(landmark.x, '.9f'))
                    coords = np.append(coords, format(landmark.y, '.9f'))
                    coords = np.append(coords, format(landmark.z, '.9f'))
                
                #Need to reshape data, group by coordinates, to match the shape of the input layer of the CNN before prediction
                reshaped_coords = coords.reshape(1, -1, 3)
                reshaped_coords = reshaped_coords.astype(np.float32)

                #Finally make the prediciton
                prediction = self.model.predict(reshaped_coords)
                highest_prediction = np.argmax(prediction)

                if highest_prediction == 0:
                    emotion = "angry"
                elif highest_prediction == 1:
                    emotion = "happy"
                elif highest_prediction == 2:
                    emotion = "neutral"
                elif highest_prediction == 3:
                    emotion = "sad"

            return JsonResponse({'success': True, 'prediction': emotion })
        except Exception as e:
            print(e)