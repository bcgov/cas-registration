from django.db import models

class Report(models.Model):
    title = models.CharField(max_length=100)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        app_label = 'reporting'

    def __str__(self):
        return self.title
