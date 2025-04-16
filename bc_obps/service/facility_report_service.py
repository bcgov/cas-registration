from uuid import UUID
from django.db import transaction
from typing import Any, List, Optional, Tuple, cast
from ninja import Query
from registration.models import Activity, Facility
from reporting.models import ReportActivity, ReportProductEmissionAllocation, ReportProduct
from reporting.models.facility_report import FacilityReport
from reporting.schema.facility_report import FacilityReportListInSchema, FacilityReportFilterSchema
from django.db.models import QuerySet
from django.db.models import F


class SaveFacilityReportData:
    def __init__(
        self,
        facility_name: str,
        facility_type: str,
        activities: List[int],
        regulated_products: Optional[List[int]],
        facility_bcghgid: Optional[str] = None,
    ):
        self.facility_name = facility_name
        self.facility_type = facility_type
        self.facility_bcghgid = facility_bcghgid
        self.activities = activities
        self.regulated_products = regulated_products


class FacilityReportService:
    @classmethod
    def get_facility_report_by_version_and_id(cls, report_version_id: int, facility_id: UUID) -> FacilityReport:
        return FacilityReport.objects.annotate(operation_id=F('report_version__report__operation_id')).get(
            report_version_id=report_version_id, facility_id=facility_id
        )

    @classmethod
    def get_facility_report_by_version_id(cls, report_version_id: int) -> Optional[Tuple[UUID]]:
        # Return the first facility_id as a tuple or None
        facility_id = (
            FacilityReport.objects.filter(report_version__id=report_version_id)
            .values_list('facility_id', flat=True)
            .first()
        )
        return (facility_id,) if facility_id else None

    @classmethod
    def get_activity_ids_for_facility(cls, version_id: int, facility_id: UUID) -> List[int]:
        facility_report = FacilityReport.objects.get(report_version_id=version_id, facility_id=facility_id)
        return list(facility_report.activities.values_list('id', flat=True))

    @classmethod
    def set_activities_for_facility_report(cls, facility_report: FacilityReport, activities: List[int]) -> None:
        facility_report.activities.set(Activity.objects.filter(id__in=activities))
        report_activities_to_prune = ReportActivity.objects.filter(facility_report_id=facility_report.id).exclude(
            activity_id__in=activities
        )

        if report_activities_to_prune:
            # If activities are removed from a facility_report, then the corresponding report_activity data must be delete-cascaded
            report_activities_to_prune.delete()
            # If activities are removed from a facility report, then the allocation of emissions to all products must be deleted & re-allocated by the user
            ReportProductEmissionAllocation.objects.filter(
                report_emission_allocation__facility_report_id=facility_report.id
            ).delete()

    @classmethod
    def prune_report_product_data_for_facility_report(
        cls, facility_report: FacilityReport, regulated_products: List[int]
    ) -> None:
        report_products_to_prune = ReportProduct.objects.filter(facility_report_id=facility_report.id).exclude(
            product_id__in=regulated_products
        )

        if report_products_to_prune:
            report_product_ids = report_products_to_prune.values_list("id", flat=True)
            # If regulated_products are removed from a report_operation, then the corresponding report_product data must be deleted
            ReportProduct.objects.filter(facility_report_id=facility_report.id).exclude(
                product_id__in=regulated_products
            ).delete()
            # If regulated_products are removed from a report_operation, then the allocation of emissions to those products must be deleted & re-allocated by the user
            ReportProductEmissionAllocation.objects.filter(
                report_emission_allocation__facility_report_id=facility_report.id,
                report_product_id__in=report_product_ids,
            ).delete()

    @classmethod
    @transaction.atomic()
    def save_facility_report(cls, report_version_id: int, facility_id: UUID, data: Any) -> FacilityReport:
        """
        Update a facility report and its related activities.

        Args:
            report_version_id (int): The ID of the report version.
            facility_id (int): The ID of the facility.
            data (SaveFacilityReportData): The input data for the facility report.

        Returns:
            FacilityReport: The updated or created FacilityReport instance.
        """

        # Update FacilityReport instance
        facility_report = FacilityReport.objects.get(report_version_id=report_version_id, facility_id=facility_id)
        facility_report.facility_name = data.facility_name.strip()
        facility_report.facility_type = data.facility_type.strip()
        # Update ManyToMany fields (activities, report_products)
        if hasattr(data, 'activities'):
            cls.set_activities_for_facility_report(facility_report=facility_report, activities=data.activities)
        if hasattr(data, 'regulated_products'):
            cls.prune_report_product_data_for_facility_report(
                facility_report=facility_report, regulated_products=data.regulated_products
            )

        # Save the updated FacilityReport instance
        facility_report.save()

        return facility_report

    @classmethod
    def get_facility_report_list(
        cls,
        version_id: int,
        sort_field: Optional[str],
        sort_order: Optional[str],
        filters: FacilityReportFilterSchema = Query(...),
    ) -> QuerySet[FacilityReport]:
        sort_direction = "-" if sort_order == "desc" else ""
        sort_by = f"{sort_direction}{sort_field}"

        facilities = FacilityReport.objects.filter(report_version_id=version_id)

        queryset = (
            filters.filter(facilities)
            .order_by(sort_by)
            .values('id', 'facility_name', 'facility_id', 'facility_bcghgid', 'is_completed')
            .distinct()
        )

        return cast(QuerySet[FacilityReport], queryset)

    @classmethod
    @transaction.atomic
    def save_facility_report_list(cls, version_id: int, data: List[FacilityReportListInSchema]) -> None:

        for facility_data in data:
            facility_id = facility_data.facility
            is_completed = facility_data.is_completed

            # Update the facility report
            FacilityReport.objects.filter(report_version_id=version_id, facility_id=facility_id).update(
                is_completed=is_completed
            )

    @classmethod
    @transaction.atomic()
    def update_facility_report(cls, version_id: int, facility_id: UUID) -> FacilityReport:
        facility = Facility.objects.get(id=facility_id)
        facility_report = FacilityReport.objects.get(report_version_id=version_id, facility_id=facility_id)

        facility_report.facility_name = facility.name
        facility_report.facility_type = facility.type
        facility_report.facility_bcghgid = str(facility.bcghg_id.id) if facility.bcghg_id else None

        facility_report.save()

        return facility_report
