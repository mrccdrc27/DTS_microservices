# Create your views here.
from rest_framework import generics

from rest_framework.views import APIView
from django.shortcuts import render
from rest_framework.generics import GenericAPIView, RetrieveAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from .serializers import *
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from rest_framework.response import Response
from rest_framework import status, permissions

from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from .models import CustomUser
from .serializers import RequestPasswordResetSerializer, PasswordResetConfirmSerializer
from rest_framework.generics import GenericAPIView


from django.utils.http import urlsafe_base64_decode
from django.contrib.auth.tokens import default_token_generator
from django.contrib.auth import get_user_model
from rest_framework import serializers

from .serializers import InviteUserSerializer
from .models import PendingRegistration
from django.urls import reverse

from rest_framework.generics import CreateAPIView

from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import update_session_auth_hash




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

            message = f"""
            Hi,

            We received a request to reset your password. You can reset it by clicking the link below:

            {reset_link}

            If you did not request a password reset, you can safely ignore this email.

            This link will expire in 24 hours for your security.

            Thank you,  
            GenSys Support Team
            """
            
            # Send email
            send_mail(
                'Reset Your Password',
                message,
                'Gensys Support Team',
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
        

from rest_framework.generics import CreateAPIView
from django.core.mail import send_mail
from urllib.parse import urlencode

class InviteUserView(CreateAPIView):
    # permission_classes = [permissions.IsAdminUser]
    serializer_class = InviteUserSerializer

    def perform_create(self, serializer):
        registration = serializer.save()
        token = str(registration.token)

        # FRONTEND URL (change this to your production domain when deployed)
        frontend_base_url = "http://localhost:3000/api/register"
        query_string = urlencode({'token': token})
        url = f"{frontend_base_url}?{query_string}"

        send_mail(
            subject="Action Required: Complete Your Registration",
            message=(
                f"Dear Agent,\n\n"
                f"You have been invited to complete your account registration.\n"
                f"Please click the link below to set your credentials and activate your account:\n\n"
                f"{url}\n\n"
                f"Note: This link will expire in 24 hours for security purposes.\n\n"
                f"If you did not request this invitation, you may safely ignore this email.\n\n"
                f"Best regards,\n"
                f"Gensys Support Team"
            ),
            from_email='Gensys Support Team <no-reply@gensys.com>',
            recipient_list=[registration.email],
        )

        

from rest_framework.decorators import api_view
@api_view(['GET'])
def validate_registration_token(request):
    token = request.query_params.get('token')
    if not token:
        return Response({'valid': False, 'message': 'Token missing'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        invite = PendingRegistration.objects.get(token=token)
        if invite.is_expired():
            return Response({'valid': False, 'message': 'Token expired'}, status=status.HTTP_400_BAD_REQUEST)
        return Response({'valid': True})
    except PendingRegistration.DoesNotExist:
        return Response({'valid': False, 'message': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)
    

# class RegisterUserView(generics.CreateAPIView):
#     def post(self, request, token):
#         data = request.data.copy()
#         data['token'] = token
#         serializer = CompleteRegistrationSerializer(data=data)
#         if serializer.is_valid():
#             serializer.save()
#             return Response({"message": "Registration complete."})
#         return Response(serializer.errors, status=400)

# from rest_framework import generics
# from .serializers import CompleteRegistrationSerializer

class RegisterUserView(generics.CreateAPIView):
    serializer_class = CompleteRegistrationSerializer


class ChangePasswordAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Password changed successfully."}, status=200)
        return Response(serializer.errors, status=400)