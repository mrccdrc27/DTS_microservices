from django.db import models

class Comment(models.Model):
    commentId = models.AutoField(primary_key=True)
    taskId = models.IntegerField()  # No FK, just store the ID
    agentId = models.IntegerField()
    content = models.TextField()
    createdAt = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Comment {self.commentId} on Task {self.taskId}"
