from django.contrib.auth.password_validation import validate_password
from .models import CustomUser
from rest_framework import serializers
from django.contrib.auth import authenticate

from django.core.exceptions import ValidationError as DjangoValidationError

from django.contrib.auth.models import User

from .models import PendingRegistration
from django.utils import timezone
from datetime import timedelta

from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import PendingRegistration

User = get_user_model()
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


class InviteUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = PendingRegistration
        fields = ['email', 'role']

    def create(self, validated_data):
        validated_data['expires_at'] = timezone.now() + timedelta(hours=24)
        return PendingRegistration.objects.create(**validated_data)
    
class CompleteRegistrationSerializer(serializers.Serializer):
    token = serializers.UUIDField()
    password = serializers.CharField(write_only=True)
    first_name = serializers.CharField(required=True)
    last_name = serializers.CharField(required=True)

    def validate_password(self, value):
        try:
            validate_password(value)
        except DjangoValidationError as e:
            raise serializers.ValidationError(e.messages)
        return value
    
    def validate_token(self, token):
        try:
            invite = PendingRegistration.objects.get(token=token)
        except PendingRegistration.DoesNotExist:
            raise serializers.ValidationError("Invalid token.")
        if invite.is_expired():
            raise serializers.ValidationError("Token expired.")
        return token

    def create(self, validated_data):
        invite = PendingRegistration.objects.get(token=validated_data['token'])

        user = User.objects.create_user(
            username=invite.email,
            email=invite.email,
            password=validated_data['password'],
            first_name=validated_data.get('first_name'),
            last_name=validated_data.get('last_name'),
            is_staff=invite.role == 'admin'  # or customize this logic
        )

        
        invite.delete()
        return user
    