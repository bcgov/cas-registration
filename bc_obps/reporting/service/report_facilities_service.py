from django.db import transaction

from reporting.models import ReportVersion, FacilityReport, ReportOperation
from registration.models import Facility, FacilityDesignatedOperationTimeline, FacilitySnapshot
from typing import List, Dict
from uuid import UUID
from reporting.service.sync_validation_service import SyncValidationService


class ReportFacilitiesService:
    @staticmethod
    @transaction.atomic
    def get_report_facility_list_by_version_id(version_id: int) -> Dict[str, List[str]]:
        """
        Get facilities associated with a report version's operation.

        Args:
            version_id: The report version ID

        Returns:
            Dictionary containing list of facilities with their details
        """
        report_version = ReportVersion.objects.select_related('report__operation').get(id=version_id)

        # Retrieve distinct facilities associated with this report version's operation
        facilities_list = list(
            Facility.objects.filter(designated_operations__operation=report_version.report.operation)
            .values_list('name', flat=True)
            .distinct()
        )

        return {"facilities": facilities_list}

    @classmethod
    @transaction.atomic
    def save_selected_facilities(cls, version_id: int, facility_list: list[UUID]) -> None:
        report_version = ReportVersion.objects.select_related('report__operation', 'report__operator').get(
            id=version_id
        )

        FacilityReport.objects.filter(report_version=report_version).exclude(facility_id__in=facility_list).delete()

        existing_ids = set(
            FacilityReport.objects.filter(report_version=report_version).values_list('facility_id', flat=True)
        )
        to_create_ids = set(facility_list) - existing_ids

        if not to_create_ids:
            return

        operation = report_version.report.operation
        facilities = {f.id: f for f in Facility.objects.filter(id__in=to_create_ids)}

        # Build snapshot map (most recent per facility)
        snapshots = FacilitySnapshot.objects.filter(operation_id=operation.id, facility_id__in=to_create_ids).order_by(
            'facility_id', '-snapshot_timestamp'
        )
        snapshot_map = {}
        for snap in snapshots:
            if snap.facility_id not in snapshot_map:
                snapshot_map[snap.facility_id] = snap

        # Build timeline map (end_date indicates past facility)
        timelines = FacilityDesignatedOperationTimeline.objects.filter(
            operation=operation, facility_id__in=to_create_ids
        ).values('facility_id', 'end_date')
        timeline_map = {t['facility_id']: t['end_date'] for t in timelines}

        # Check if old operator
        is_old_operator = report_version.report.operator_id != operation.operator_id

        # Create facility reports
        new_reports = []
        for fac_id in to_create_ids:
            facility = facilities[fac_id]
            use_snapshot = (is_old_operator or bool(timeline_map.get(fac_id))) and fac_id in snapshot_map

            if use_snapshot:
                snap = snapshot_map[fac_id]
                name, ftype, bcghg = snap.name, snap.type, snap.bcghg_id
            else:
                name, ftype, bcghg = (
                    facility.name,
                    facility.type,
                    str(facility.bcghg_id.id) if facility.bcghg_id else None,
                )

            new_reports.append(
                FacilityReport(
                    report_version=report_version,
                    facility=facility,
                    facility_name=name,
                    facility_type=ftype,
                    facility_bcghgid=bcghg,
                )
            )

        created = FacilityReport.objects.bulk_create(new_reports)
        default_activities = ReportOperation.objects.get(report_version=report_version).activities.all()
        for fr in created:
            fr.activities.set(default_activities)

    @staticmethod
    @transaction.atomic
    def get_all_facilities_for_review(version_id: int) -> dict:
        selected_facilities = set(
            FacilityReport.objects.filter(report_version_id=version_id).values_list('facility_id', flat=True)
        )
        report_version = ReportVersion.objects.select_related('report__operation', 'report__operator').get(
            id=version_id
        )
        operation_id = report_version.report.operation.id

        timeline_facilities = (
            FacilityDesignatedOperationTimeline.objects.filter(operation_id=operation_id)
            .values_list('facility_id', flat=True)
            .distinct()
        )
        snapshots = FacilitySnapshot.objects.filter(operation_id=operation_id, facility_id__in=timeline_facilities)
        snapshot_map = {s.facility_id: s for s in snapshots}

        timelines = (
            FacilityDesignatedOperationTimeline.objects.filter(operation_id=operation_id)
            .select_related('facility')
            .order_by('facility__name')
            .distinct()
        )

        current_facilities: list[dict] = []
        past_facilities: list[dict] = []
        all_selected = not selected_facilities

        for timeline in timelines:
            facility = timeline.facility
            use_snapshot = facility.id in snapshot_map and facility.operation_id != operation_id

            facility_data = {
                "facility_id": snapshot_map[facility.id].facility_id if use_snapshot else facility.id,
                "facility__name": snapshot_map[facility.id].name if use_snapshot else facility.name,
                "is_selected": (
                    facility.id in selected_facilities
                    if timeline.end_date
                    else (all_selected or facility.id in selected_facilities)
                ),
            }

            (past_facilities if timeline.end_date else current_facilities).append(facility_data)

        return {
            "current_facilities": current_facilities,
            "past_facilities": past_facilities,
            "operation_id": operation_id,
            "is_sync_allowed": SyncValidationService.is_sync_allowed(version_id),
        }
