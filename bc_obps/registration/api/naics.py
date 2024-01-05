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
import re
class DocumentOut(ModelSchema):
    """
    Schema for the Operator model
    """

    class Config:
        model = Document
        model_fields = '__all__'

# could use middleware for the transformation too? harder when it's part of a form
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
