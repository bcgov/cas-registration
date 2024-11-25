from datetime import date
from ninja import Schema,ModelSchema
from pydantic import BaseModel
from typing import Dict, Optional, List

from registration.schema.v1 import RegulatedProductSchema
from reporting.models import ReportNewEntrant, ReportNewEntrantEmissions
from reporting.schema.emission_category import EmissionCategorySchema



class ReportNewEntrantSchema(ModelSchema):
    class Meta:
        model = ReportNewEntrant
        fields = ('id', 'assertion_statement', 'date_of_authorization', 'date_of_first_shipment',)

class ReportNewEntrantEmissionSchema(ModelSchema):
    class Meta:
        model = ReportNewEntrantEmissions
        fields = ('id','emission','emission_category__category_name')



class ReportNewEntrantDataOut(Schema):
    report_new_entrant: ReportNewEntrantSchema
    regulated_products: RegulatedProductSchema
    emission_category: EmissionCategorySchema
    emissions:


