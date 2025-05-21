from django.contrib.auth.password_validation import validate_password
from .models import CustomUser
from rest_framework import serializers
from django.contrib.auth import authenticate

from django.core.exceptions import ValidationError as DjangoValidationError
# Serializers, is what converts the datastructure of an object to much more readable format (json)
# Acts as a Controller in MVC structure, you can enfore rules that bridge the view and the model

class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ("id", "username", "email")


class UserRegistrationSerializer(serializers.ModelSerializer):
    password1 = serializers.CharField(write_only=True)
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUser
        fields = (
            "id", 
            "username", 
            "first_name",
            "is_staff",
            "email", 
            "password1", 
            "password2"
        )

    def validate(self, attrs):
        if attrs['password1'] != attrs['password2']:
            raise serializers.ValidationError("Passwords do not match!")

        # Run Django's built-in password validators
        try:
            validate_password(attrs['password1'], user=self.instance or None)
        except DjangoValidationError as e:
            raise serializers.ValidationError({'password1': e.messages})

        return attrs

    def create(self, validated_data):
        # Remove password fields from validated data
        password = validated_data.pop("password1")
        validated_data.pop("password2")

        user = CustomUser(**validated_data)
        user.set_password(password)
        user.save()
        return user
    
    # Creates the mode;
    def create(self, validated_data):
        password = validated_data.pop("password1")
        validated_data.pop("password2")

        return CustomUser.objects.create_user(password=password, **validated_data)

class UserLoginSerializer(serializers.Serializer):
    email = serializers.CharField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, data):
        user = authenticate(**data)
        if user and user.is_active:
            return user
        raise serializers.ValidationError("Incorrect Credentials!")    



class RequestPasswordResetSerializer(serializers.Serializer):
    email = serializers.EmailField()

class PasswordResetConfirmSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(min_length=8)
