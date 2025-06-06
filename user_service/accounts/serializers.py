from django.contrib.auth.password_validation import validate_password
from .models import CustomUser
from rest_framework import serializers
from django.contrib.auth import authenticate
from django.db import transaction
from django.core.exceptions import ValidationError as DjangoValidationError
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from django.core.exceptions import ValidationError as DjangoValidationError
from django.contrib.auth import get_user_model
from .models import PendingRegistration 



User = get_user_model()
# Serializers, is what converts the datastructure of an object to much more readable format (json)
# Acts as a Controller in MVC structure, you can enfore rules that bridge the view and the model




class PendingRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = PendingRegistration
        fields = ['id', 'email', 'role', 'token', 'expires_at']

#is_active edits
class UserActivationSerializer(serializers.ModelSerializer):
    is_active = serializers.BooleanField(required=False, default=True)

    class Meta:
        model = CustomUser
        fields = ['is_active']

class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ("id", "username", "email")


class UserInfoSerializer(serializers.ModelSerializer):
    profile_picture = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = CustomUser
        fields = (
            "id",
            "username",
            "first_name",
            "middle_name",
            "last_name",
            "role",
            "phone_number",
            "email",
            "is_staff",
            "profile_picture",
        )
        
class UserLoginSerializer(serializers.Serializer):
    email = serializers.CharField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, data):
        user = authenticate(**data)
        if user and user.is_active:
            return user
        raise serializers.ValidationError("Incorrect Credentials!")    

# serializers.py
class VerifyLoginOTPSerializer(serializers.Serializer):
    temp_token = serializers.CharField()
    otp = serializers.CharField()


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
    

class CompleteRegistrationSerializer(serializers.ModelSerializer):
    token = serializers.UUIDField(write_only=True)
    password = serializers.CharField(write_only=True)
    password2 = serializers.CharField(write_only=True)
    profile_picture = serializers.FileField(
    required=False,
    allow_null=True)

    
    class Meta:
        model = User
        fields = ['token', 'first_name', 'middle_name', 'last_name','phone_number', 'profile_picture', 'password', 'password2']
    
    def validate_token(self, token):
        try:
            invite = PendingRegistration.objects.get(token=token)
        except PendingRegistration.DoesNotExist:
            raise serializers.ValidationError("Invalid token.")

        if invite.is_used:
            raise serializers.ValidationError("Token has already been used.")

        if invite.is_expired():
            raise serializers.ValidationError("Token has expired.")

        self.context['invite'] = invite  # store for use in create()
        return token

    def validate_profile_picture(self, file):
        # Your custom validation logic here
        max_size = 2 * 1024 * 1024  # 2MB
        if file is None:
            return file
        if file.size > max_size:
            raise serializers.ValidationError("Max file size is 2MB.")

        valid_extensions = ['.jpg', '.jpeg', '.png']
        import os
        ext = os.path.splitext(file.name)[1].lower()
        if ext not in valid_extensions:
            raise serializers.ValidationError("Only .jpg, .jpeg, and .png files are allowed.")

        from PIL import Image
        try:
            image = Image.open(file)
            image.verify()
        except Exception:
            raise serializers.ValidationError("Uploaded file is not a valid image.")

        return file


    def validate_password(self, value):
        try:
            validate_password(value)
        except DjangoValidationError as e:
            raise serializers.ValidationError(e.messages)
        return value

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError({"password2": "Passwords do not match."})
        return data

    def create(self, validated_data):
        token = validated_data.pop('token')
        password = validated_data.pop('password')
        validated_data.pop('password2')

        profile_picture = validated_data.pop('profile_picture', None)
        phone_number = validated_data.pop('phone_number', None)
        middle_name = validated_data.pop('middle_name', None)

        invite = PendingRegistration.objects.get(token=token)
        
        #with transaction.atomic():
        user = User.objects.create_user(
            username=invite.email,
            email=invite.email,
            role=invite.role,
            password=password,
            first_name=validated_data.get('first_name'),
            middle_name=middle_name,
            last_name=validated_data.get('last_name'),
            phone_number=phone_number,
            is_staff=(invite.role == 'admin'),
            profile_picture=profile_picture
        )
        # Delete the invite after successful registration
        invite.delete()

        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        return {
            'user': user,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }



class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)
    confirm_password = serializers.CharField(required=True)

    def validate_password(self, value):
        try:
            validate_password(value)
        except DjangoValidationError as e:
            raise serializers.ValidationError(e.messages)
        return value
    
    def validate(self, attrs):
        user = self.context['request'].user

        if not user.check_password(attrs['old_password']):
            raise serializers.ValidationError({"old_password": "Old password is not correct"})

        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match"})

        if len(attrs['new_password']) < 8:
            raise serializers.ValidationError({"new_password": "Password must be at least 8 characters"})

        return attrs

    def save(self, **kwargs):
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        