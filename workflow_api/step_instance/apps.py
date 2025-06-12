from django.apps import AppConfig


class StepInstanceConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'step_instance'

    def ready(self):
        import step_instance.signals  
