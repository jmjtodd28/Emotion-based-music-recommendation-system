from django.db import models

class PreferenceData(models.Model):
    happy = models.JSONField()
    sad = models.JSONField()
    angry = models.JSONField()
    neutral = models.JSONField()