from registration.decorators import authorize
from .api_base import router
from django.core.files.base import ContentFile
from typing import List
from registration.models import NaicsCode, AppRole, Document,  DocumentType
from registration.schema import (
    NaicsCodeSchema,
)
from ninja import File
from ninja.files import UploadedFile
from ninja import ModelSchema
from ninja.responses import codes_4xx, codes_5xx
from registration.schema import Message, OperatorOut, SelectUserOperatorStatus
from ninja import Schema
import base64
import io
import json
from ninja import NinjaAPI, File
from ninja.files import UploadedFile
import re
import requests
class DocumentOut(ModelSchema):


    """
    Schema for the Operator model
    """
    boundary_map: str = None

    # static method, start with resolve, name of field
    @staticmethod
    def resolve_boundary_map(obj: Document):
        # if obj.file.file:
        #     breakpoint()
        #     file_content = obj.file.file
        #     encoded_content = base64.b64encode(file_content).decode("utf-8")

        #     return "data:application/pdf;base64," + encoded_content
        

        response = requests.get(obj.file.url)
        if response.status_code == 200:
            # The file content is in response.content
            file_content = response.content
            encoded_content = base64.b64encode(file_content).decode("utf-8")
            # data:image/jpeg;name=IMG-20231228-WA0000.jpg;base64 data:application/pdf;base64
            var = "data:application/pdf;name=" + obj.file.name.split("/")[-1] + ";base64," + encoded_content
            print(var)
            return var
        return 'i dont work yet'
        
    class Config:
        model = Document
        model_fields = '__all__'


class DocumentSchema(Schema):
    boundary_map: str


# @router.post("/upload", response={201: DocumentOut, codes_4xx: Message})
# async def create_document(request, file: UploadedFile = File(...)):
#     print('made it into the upload endpoint')
#     # i think is not actually the file
#     print('file',file)
#     data = file.read()
#     print('data',data)
#     breakpoint()
#     document = Document.objects.create(**data)


#     return 201, document

@router.get("/handle-file", response=DocumentOut)
def get_file(request):
    qs = Document.objects.last()
    return qs

@router.post("/handle-file", response={201: DocumentOut, codes_4xx: Message})
def create_document(request, payload: DocumentSchema):

# for the real endpoint, we'll probably have to do some sort of loop because there can be multiple types of documents in each form

    file_name =  re.search(r'name=([^;]+)', payload.boundary_map).group(1)
    _, encoded_data = payload.boundary_map.split(',')

    # Decode the base64-encoded data
    file_data = base64.b64decode(encoded_data)
    file = ContentFile(file_data, file_name)

 
    document = Document.objects.create(file=file,  type=DocumentType.objects.get(name='boundary_map'), description='what was this meant to be? maybe it would make more sense to put the description in the DocumentType table?')


    return 201, document


##### GET #####


@router.get("/naics_codes", response=List[NaicsCodeSchema])
@authorize(AppRole.get_all_authorized_roles())
def list_naics_codes(request):
    qs = NaicsCode.objects.all()
    return qs


##### POST #####


##### PUT #####


##### DELETE #####
