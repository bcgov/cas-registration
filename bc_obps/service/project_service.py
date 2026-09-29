from datetime import date
from typing import Optional
from uuid import UUID
from django.db.models import QuerySet
from service.data_access_service.project_service import ProjectDataAccessService
from registry.schema.project import ProjectFilterSchema
from ninja import Query
from dataclasses import dataclass
from django.db import transaction
from registry.models.project import Project

@dataclass
class ProjectData:
    name: str
    project_type: str
    category: str
    project_start_date: Optional[date]
    project_end_date: Optional[date]
    description: Optional[str]
    status: str
    operation_id: UUID
    contact_id: int
    address_id: int
    account_id: int
    program_id: int
    verifier_id: UUID

class ProjectService:
    # @classmethod
    # def get_if_authorized(cls, user_guid: UUID) -> Optional[Account]:
    #     user = UserDataAccessService.get_by_guid(user_guid)
    #     user_accounts = 

    @classmethod
    def list_projects(cls, sort_field: Optional[str], sort_order: Optional[str], filters: ProjectFilterSchema = Query(...),) -> QuerySet[Project]:
        sort_direction = "-" if sort_order == "desc" else ""
        sort_by = f"{sort_direction}{sort_field}"
        base_qs = ProjectDataAccessService.get_all_projects()

        return filters.filter(base_qs).order_by(sort_by)

    @classmethod
    @transaction.atomic()
    def create_project(cls, user_guid: UUID, project_data: ProjectData) -> Project:
        return ProjectDataAccessService.create_project()


    # @classmethod
    # @transaction.atomic()
    # def _create_operation(
    #     cls,
    #     user_guid: UUID,
    #     operation_data: OperationData,
    # ) -> Operation:
    #     operation_fields = operation_data.operation_fields()

    #     user_operator: UserOperator = UserDataAccessService.get_user_operator_by_user(user_guid)
    #     operation_fields['operator_id'] = user_operator.operator_id

    #     operation = OperationDataAccessService.create_operation(
    #         user_guid,
    #         operation_fields,
    #         operation_data.activities if hasattr(operation_data, "activities") and operation_data.activities else [],
    #         (
    #             operation_data.regulated_products
    #             if hasattr(operation_data, "regulated_products") and operation_data.regulated_products
    #             else []
    #         ),
    #     )

    #     OperationDesignatedOperatorTimelineDataAccessService.create_operation_designated_operator_timeline(
    #         user_guid,
    #         {
    #             'operator': user_operator.operator,
    #             'operation': operation,
    #             'start_date': cls.OPERATION_DEFAULT_START_DATE,
    #         },
    #     )

    #     # create documents
    #     operation_documents = []

    #     if operation_data.boundary_map:
    #         operation_documents.append(
    #             DocumentDataAccessService.create_document(
    #                 user_guid,
    #                 operation_data.boundary_map,
    #                 'boundary_map',
    #                 operation.id,
    #             )
    #         )
    #     if operation_data.process_flow_diagram:
    #         operation_documents.append(
    #             DocumentDataAccessService.create_document(
    #                 user_guid,
    #                 operation_data.process_flow_diagram,
    #                 'process_flow_diagram',
    #                 operation.id,
    #             )
    #         )
    #     if operation_data.new_entrant_application:
    #         operation_documents.append(
    #             DocumentDataAccessService.create_document(
    #                 user_guid,
    #                 operation_data.new_entrant_application,
    #                 'new_entrant_application',
    #                 operation.id,
    #             )
    #         )

    #     operation.documents.add(*operation_documents)

    #     # handle multiple operators
    #     multiple_operators_data = operation_data.multiple_operators_array
    #     cls.upsert_multiple_operators(operation, multiple_operators_data, user_guid)

    #     # handle purposes
    #     if operation.registration_purpose == Operation.Purposes.OPTED_IN_OPERATION:
    #         operation = cls._create_opted_in_operation_detail(user_guid, operation)
    #     if operation.registration_purpose == Operation.Purposes.ELECTRICITY_IMPORT_OPERATION:
    #         cls._create_or_update_eio(user_guid, operation, operation_data)

    #     return operation