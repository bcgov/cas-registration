# import base64
# import io
# import json
# from ninja import Router
# from ninja.errors import HttpError
# from django.core.files.base import ContentFile
# from ninja.files import UploadedFile
# from django.core.files.uploadedfile import InMemoryUploadedFile
# from tempfile import NamedTemporaryFile

# router = Router()

# class FileUploadMiddleware:
#     def __init__(self, get_response):
#         self.get_response = get_response

#     def __call__(self, request):
#         print('made it into the middleware')
#         # maybe better to check on if there's any sort of file (rjsf calles them boundary_map etc., how to deterine?)
#         if request.method == "POST" and request.path == "/api/registration/upload":

#             raw_data = request.body
#             decoded_data = json.loads(raw_data.decode('utf-8'))
#             data_url = decoded_data.get("file")

#             if data_url:
#                 try:
#                     # Split the data URL to extract the base64-encoded data
#                     _, encoded_data = data_url.split(',')

#                     # Decode the base64-encoded data
#                     file_data = base64.b64decode(encoded_data)

#                     temp_file = NamedTemporaryFile(delete=False)
#                     temp_file.write(file_data)
#                     temp_file.flush()

#                     # Update request.FILES with the file--django docs: During file uploads, the actual file data is stored in request.FILES. Each entry in this dictionary is an UploadedFile object (or a subclass) – a wrapper around an uploaded file. You’ll usually use one of these methods to access the uploaded content:
                    
#                     # (not sure how this would work with multiple files, name has to be 'file')
#                     request.FILES['file'] = UploadedFile(temp_file)
                    
                   
#                 except Exception as e:
#                     raise HttpError(400, f"Error decoding Data URL: {str(e)}")

#         response = self.get_response(request)
#         return response


