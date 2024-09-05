# Web Application

Before using the application you will need python 3+ installed, which can be found here https://www.python.org/downloads/ and a Spotify Premium account. In the appendix of the dissertation there will be login details for a new Spotify account for you to use.

Note: if you own a Spotify premium account it still will not work when you login with your own account. I need to manually add users emails via a spotify dashboard, which I will be more than happy to do if you wish.

To run the local host server, I have created **start_app.sh** which will create a local python enviroment, activate it, install packages locally and then start the server on port 8000. Enter the following command to start up the server.

```bash
bash start_app.sh
```

The code for the frontend can be found at music_recommend/frontend/src and the code for the endpoints can be found in the python files in the music_recommend/api and music_recommend/spotify. music_recommend/api handles storing preferences and the live emotion detection and music_recommend/spotify handles everything to do with spotify authentication and tokens.
