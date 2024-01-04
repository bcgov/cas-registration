from registration.decorators import authorize
from .api_base import router
from typing import List
from registration.models import NaicsCode, AppRole, Document
from registration.schema import (
    NaicsCodeSchema,
)
from ninja import File
from ninja.files import UploadedFile
from ninja import ModelSchema
from ninja.responses import codes_4xx, codes_5xx
from registration.schema import Message, OperatorOut, SelectUserOperatorStatus
class DocumentOut(ModelSchema):
    """
    Schema for the Operator model
    """

    class Config:
        model = Document
        model_fields = '__all__'

@router.post("/upload", response={201: DocumentOut, codes_4xx: Message})
async def create_document(request, file: UploadedFile = File(...)):
    print('made it into the upload endpoint')
    # i think is not actually the file
    print('file',file)
    data = file.read()
    print('data',data)
    breakpoint()
    document = Document.objects.create(**data)


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
