# this is for validation of pfp upload (max size and file type)
from rest_framework import serializers
import os

def validate_file_size(file):
    max_size = 2 * 1024 * 1024  # 2MB
    if file.size > max_size:
        raise serializers.ValidationError("Max file size is 2MB.")

def validate_file_extension(file):
    valid_extensions = ['.jpg', '.jpeg', '.png']
    ext = os.path.splitext(file.name)[1].lower()
    if ext not in valid_extensions:
        raise serializers.ValidationError("Only .jpg, .jpeg, and .png files are allowed.")
