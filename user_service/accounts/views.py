# Create your views here.
from rest_framework.views import APIView
from django.shortcuts import render
from rest_framework.generics import GenericAPIView, RetrieveAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from .serializers import *
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from rest_framework.response import Response
from rest_framework import status

from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from .models import CustomUser
from .serializers import RequestPasswordResetSerializer, PasswordResetConfirmSerializer
from rest_framework.generics import GenericAPIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status

from django.utils.http import urlsafe_base64_decode
from django.contrib.auth.tokens import default_token_generator
from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView

# Is a protected Route, must put token to validate and get request
class HelloView(APIView):
    permission_classes = (IsAuthenticated, )

    def get(self, request):
        content = {'message': 'Hello'}
        return Response(content)
    
class AdminView(APIView):
    permission_classes = (IsAuthenticated, )

    def get(self, request):
        if not request.user.is_staff:
            return Response("invalid credentials", status= status.HTTP_401_UNAUTHORIZED)
        content = {'message': 'Hello Admin'}
        return Response(content)

class Verify(APIView):
    # checks if there are any tampering done to the jwt
    permission_classes = (IsAuthenticated, )
    def get(self, request):
        content = {'is_staff': request.user.is_staff}
        if not request.user.is_staff:
            return Response(content, status= status.HTTP_200_OK)
        return Response(content, status= status.HTTP_200_OK)


class UserRegistrationAPIView(GenericAPIView):
    permission_classes = (AllowAny,)
    serializer_class = UserRegistrationSerializer
    
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # token create
        token = RefreshToken.for_user(user)
        token['is_staff'] = user.is_staff
        data = serializer.data
        data["tokens"] = {"refresh":str(token),
                          "access": str(token.access_token)}
        return Response(data, status= status.HTTP_201_CREATED)

class UserLoginAPIView(GenericAPIView):
    permission_classes = (AllowAny,)
    serializer_class = UserLoginSerializer
    
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data= request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data
        serializer = CustomUserSerializer(user)

        # token create
        token = RefreshToken.for_user(user)
        data = serializer.data
        data["tokens"] = {"refresh":str(token),  
                          "access": str(token.access_token)}
        data["is_staff"] = user.is_staff
        return Response(data, status=status.HTTP_200_OK)
    
class UserLogoutAPIView(GenericAPIView):
    permission_classes = (IsAuthenticated,)
    
    def post(self, request, *args, **kwargs):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response(status= status.HTTP_400_BAD_REQUEST)

class UserInfoAPIView(RetrieveAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = CustomUserSerializer
    
    def get_object(self):
        return self.request.user
    
class RequestPasswordResetAPIView(GenericAPIView):
    permission_classes = (AllowAny,)
    serializer_class = RequestPasswordResetSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']
        try:
            user = CustomUser.objects.get(email=email)
            token = PasswordResetTokenGenerator().make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            reset_link = f"http://localhost:8000/api/password/reset/confirm/?uid={uid}&token={token}"
  # Change to your frontend URL

            # Send email
            send_mail(
                'Reset Your Password',
                f'Click the link to reset your password: {reset_link}',
                None,
                [email],
            )

            return Response({'message': 'Password reset link sent.'}, status=200)
        except CustomUser.DoesNotExist:
            return Response({'error': 'User with this email does not exist.'}, status=404)

class PasswordResetConfirmAPIView(GenericAPIView):
    permission_classes = (AllowAny,)
    serializer_class = PasswordResetConfirmSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        uidb64 = serializer.validated_data['uid']
        token = serializer.validated_data['token']
        new_password = serializer.validated_data['new_password']
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = CustomUser.objects.get(pk=uid)

            if PasswordResetTokenGenerator().check_token(user, token):
                user.set_password(new_password)
                user.save()
                return Response({'message': 'Password reset successfully.'}, status=200)
            else:
                return Response({'error': 'Invalid or expired token.'}, status=400)
        except Exception:
            return Response({'error': 'Invalid reset link.'}, status=400)

class PasswordTokenCheckAPI(APIView):
    permission_classes = (AllowAny,)
    
    def get(self, request, uidb64, token):
        try:
            id = force_str(urlsafe_base64_decode(uidb64))
            user = CustomUser.objects.get(id=id)
            if not PasswordResetTokenGenerator().check_token(user, token):
                return Response({'error': 'Invalid token, please request a new one.'}, status=status.HTTP_401_UNAUTHORIZED)
            return Response({'success': True, 'message': 'Valid token', 'uidb64': uidb64, 'token': token}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': 'Token is invalid or expired, please request a new one.'}, status=status.HTTP_401_UNAUTHORIZED)


class PasswordResetCompleteAPIView(APIView):
    def post(self, request, *args, **kwargs):
        uidb64 = request.data.get("uidb64")
        token = request.data.get("token")
        new_password = request.data.get("new_password")
        
        try:
            # Decode the uidb64 to get the user ID
            uid = urlsafe_base64_decode(uidb64).decode()
            user = get_user_model().objects.get(id=uid)
            
            # Validate the token
            if default_token_generator.check_token(user, token):
                # Set new password and save
                user.set_password(new_password)
                user.save()
                return Response({"message": "Password reset successful"}, status=status.HTTP_200_OK)
            else:
                return Response({"error": "Invalid token"}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": "Invalid request"}, status=status.HTTP_400_BAD_REQUEST)