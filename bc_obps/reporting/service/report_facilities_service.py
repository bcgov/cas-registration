from django.db import transaction
from django.db.models import QuerySet
from typing import List, Dict
from uuid import UUID

from reporting.models import ReportVersion, FacilityReport, ReportOperation
from registration.models import Facility, FacilityDesignatedOperationTimeline, FacilitySnapshot
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

        # Remove facilities not in the new selection
        FacilityReport.objects.filter(report_version=report_version).exclude(facility_id__in=facility_list).delete()

        # Determine which facilities need to be created
        existing_ids = set(
            FacilityReport.objects.filter(report_version=report_version).values_list('facility_id', flat=True)
        )
        to_create_ids = set(facility_list) - existing_ids

        if not to_create_ids:
            return

        operation = report_version.report.operation
        is_old_operator = report_version.report.operator_id != operation.operator_id

        # Fetch facilities in one query
        facilities = {f.id: f for f in Facility.objects.filter(id__in=to_create_ids)}

        # Get the most recent snapshot per facility using distinct
        snapshot_map = cls._get_latest_snapshots(operation.id, to_create_ids)

        # Get timeline info (end_date indicates past facility)
        timeline_map = dict(
            FacilityDesignatedOperationTimeline.objects.filter(
                operation=operation, facility_id__in=to_create_ids
            ).values_list('facility_id', 'end_date')
        )

        # Build facility reports
        new_reports = [
            cls._create_facility_report(
                report_version=report_version,
                facility=facilities[fac_id],
                snapshot_map=snapshot_map,
                timeline_map=timeline_map,
                is_old_operator=is_old_operator,
            )
            for fac_id in to_create_ids
        ]

        # Bulk create and assign activities
        created = FacilityReport.objects.bulk_create(new_reports)
        default_activities = ReportOperation.objects.get(report_version=report_version).activities.all()
        for fr in created:
            fr.activities.set(default_activities)

    @staticmethod
    def _get_latest_snapshots(operation_id: UUID, facility_ids: set[UUID]) -> dict:
        """Get the most recent snapshot for each facility."""
        snapshots = (
            FacilitySnapshot.objects.filter(operation_id=operation_id, facility_id__in=facility_ids)
            .order_by('facility_id', '-snapshot_timestamp')
            .distinct('facility_id')
        )
        return {snap.facility_id: snap for snap in snapshots}

    @staticmethod
    def _create_facility_report(
        report_version: ReportVersion,
        facility: Facility,
        snapshot_map: dict,
        timeline_map: dict,
        is_old_operator: bool,
    ) -> FacilityReport:
        """Create a FacilityReport instance with appropriate snapshot or current data."""
        use_snapshot = (is_old_operator or bool(timeline_map.get(facility.id))) and facility.id in snapshot_map

        if use_snapshot:
            snap = snapshot_map[facility.id]
            name, ftype, bcghg = snap.name, snap.type, snap.bcghg_id
        else:
            name, ftype, bcghg = (
                facility.name,
                facility.type,
                str(facility.bcghg_id.id) if facility.bcghg_id else None,
            )

        return FacilityReport(
            report_version=report_version,
            facility=facility,
            facility_name=name,
            facility_type=ftype,
            facility_bcghgid=bcghg,
        )

    @classmethod
    @transaction.atomic
    def get_all_facilities_for_review(cls, version_id: int) -> dict:
        """
        Get all facilities for review, including current and past facilities.

        For old operators (those who no longer own the operation), only show facilities
        from snapshots. For current operators, show all facilities in the timeline.
        """
        selected_facilities = set(
            FacilityReport.objects.filter(report_version_id=version_id).values_list('facility_id', flat=True)
        )
        report_version = ReportVersion.objects.select_related('report__operation', 'report__operator').get(
            id=version_id
        )
        operation = report_version.report.operation
        is_old_operator = report_version.report.operator_id != operation.operator_id

        # Get timelines and snapshots based on operator status
        timelines, snapshot_map = cls._get_timelines_and_snapshots(operation.id, is_old_operator)

        # Build facility lists
        current_facilities, past_facilities = cls._build_facility_lists(
            timelines=timelines,
            snapshot_map=snapshot_map,
            selected_facilities=selected_facilities,
            operation_id=operation.id,
            is_old_operator=is_old_operator,
        )

        return {
            "current_facilities": current_facilities,
            "past_facilities": past_facilities,
            "operation_id": operation.id,
            "is_sync_allowed": SyncValidationService.is_sync_allowed(version_id),
        }

    @staticmethod
    def _get_timelines_and_snapshots(operation_id: UUID, is_old_operator: bool) -> tuple:
        """
        Get facility timelines and snapshots based on whether it's an old operator.

        Returns:
            Tuple of (timelines queryset, snapshot_map dict)
        """
        if is_old_operator:
            # For old operators, only show facilities from snapshots
            snapshots = FacilitySnapshot.objects.filter(operation_id=operation_id).select_related('facility')
            snapshot_map = {s.facility_id: s for s in snapshots}

            timelines = (
                FacilityDesignatedOperationTimeline.objects.filter(
                    operation_id=operation_id, facility_id__in=snapshot_map.keys()
                )
                .select_related('facility')
                .order_by('facility__name')
                .distinct()
            )
        else:
            # For current operator, show all facilities in the timeline
            timeline_facility_ids = (
                FacilityDesignatedOperationTimeline.objects.filter(operation_id=operation_id)
                .values_list('facility_id', flat=True)
                .distinct()
            )
            snapshots = FacilitySnapshot.objects.filter(
                operation_id=operation_id, facility_id__in=timeline_facility_ids
            )
            snapshot_map = {s.facility_id: s for s in snapshots}

            timelines = (
                FacilityDesignatedOperationTimeline.objects.filter(operation_id=operation_id)
                .select_related('facility')
                .order_by('facility__name')
                .distinct()
            )

        return timelines, snapshot_map

    @staticmethod
    def _build_facility_lists(
        timelines: QuerySet[FacilityDesignatedOperationTimeline],
        snapshot_map: dict,
        selected_facilities: set,
        operation_id: UUID,
        is_old_operator: bool,
    ) -> tuple[list[dict], list[dict]]:
        """
        Build lists of current and past facilities from timelines.

        Returns:
            Tuple of (current_facilities list, past_facilities list)
        """
        current_facilities: list[dict] = []
        past_facilities: list[dict] = []
        all_selected = not selected_facilities

        for timeline in timelines:
            facility = timeline.facility
            use_snapshot = facility.id in snapshot_map and (is_old_operator or facility.operation_id != operation_id)

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

        return current_facilities, past_facilities
