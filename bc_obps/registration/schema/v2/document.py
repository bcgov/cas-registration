from ninja import ModelSchema
from registration.models.document import Document


class DocumentOut(ModelSchema):
    class Meta:
        model = Document
        fields = ['id', 'type']
