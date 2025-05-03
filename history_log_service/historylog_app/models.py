from django.db import models


class HistoryLog(models.Model):
    historylogId = models.AutoField(primary_key=True)
    taskId = models.IntegerField()
    agentId = models.IntegerField()
    action = models.CharField(max_length=255)
    note = models.TextField(blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"HistoryLog {self.historylogId} - Action: {self.action}"

# Create your models here.
