#!/bin/bash

# This will create a python virutal enviroment so packages are installed globally
python3 -m venv env

# activate the virtual enviroment
source env/bin/activate

# install packages
pip install -r requirements.txt

# run the server which will run on localhost:8000
cd music_recommend
python manage.py runserver