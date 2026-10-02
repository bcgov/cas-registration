"""
A small, explicit registry mapping historically-tracked models to the audit log "views" they
contribute rows to.

This is intentionally not a generic/pluggable framework -- it's a POC-scoped, hand-maintained
registry. Adding a new audited entity type means adding a new `AuditedView` entry here.
"""

from dataclasses import dataclass, field
from typing import Any, Callable, Dict, List, Optional, Tuple, Type

from django.db.models import Model

from registration.models import Operation
from reporting.models import Report, ReportVersion, ReportOperation


@dataclass(frozen=True)
class WatchedField:
    """Describes a single field tracked on an audited source model."""

    label: str
    resolver: Optional[Callable[[Any], Any]] = None

    def resolve(self, raw_value: Any) -> Any:
        """Resolve a raw field value (or related manager/object) into a display-friendly value."""
        return self.resolver(raw_value) if self.resolver else raw_value


@dataclass(frozen=True)
class AuditedSource:
    """A historically-tracked model contributing rows to an audited entity type."""

    model: Type[Model]
    root_id_resolver: Callable[[Any], Any]
    watched_fields: Dict[str, WatchedField]
    # Optional {field_name: resolver} overrides applied only to DELETE events, for a watched field
    # whose plain snapshot value -- the deleted instance's own last-known field value -- is
    # misleading once you consider other rows tied to the same root entity. E.g. a deleted
    # ReportVersion's own `status` is always "Draft" (submitted versions can't be deleted), which
    # doesn't reflect what the parent Report's status should read as afterward. Each resolver
    # receives (instance, root_id) and its return value replaces that field's plain value in the
    # snapshot, keeping the WatchedField's existing label.
    delete_field_overrides: Dict[str, Callable[[Any, Any], Any]] = field(default_factory=dict)


def _resolve_operation_display_name(entity_id: str) -> str:
    name = Operation.objects.filter(pk=entity_id).values_list("name", flat=True).first()
    return name or entity_id


def _resolve_report_display_name(entity_id: str) -> str:
    report = Report.objects.select_related("operation", "reporting_year").filter(pk=entity_id).first()
    if report is None:
        return entity_id
    return f"{report.operation.name} — {report.reporting_year.reporting_year}"


def _resolve_report_status_after_delete(instance: Any, root_id: Any) -> str:
    """
    A deleted ReportVersion's own last-known `status` is always "Draft" -- a submitted version
    can never be deleted (see the `no_delete_submitted_report_version` DB trigger) -- so showing
    it verbatim misleadingly reads as "the report is still a draft" when what actually matters is
    what's left of the Report after the deletion.

    Since a submitted version can't be deleted, if the Report still has one, the deleted draft
    must have been a supplementary edit on top of it, and the report reverts to "Submitted". If no
    version remains at all, the deleted draft was the Report's only/original version, and it
    reverts to "Not Started".
    """
    has_submitted_version = ReportVersion.objects.filter(
        report_id=root_id,
        status=ReportVersion.ReportVersionStatus.Submitted,
        is_latest_submitted=True,
    ).exists()
    return "Submitted" if has_submitted_version else "Not Started"


@dataclass(frozen=True)
class AuditedView:
    """An entity type exposed via the audit log, backed by one or more audited sources."""

    entity_type: str
    # Resolves the root entity's id to a human-readable label (e.g. an operation's name),
    # queried live rather than read off an audit log row -- so it still works even when an
    # entity has no audit history yet, and always reflects the entity's CURRENT name/state,
    # not whatever it was at some point in its audit trail.
    display_name_resolver: Callable[[str], str]
    sources: List[AuditedSource] = field(default_factory=list)


AUDITED_VIEWS: Dict[str, AuditedView] = {
    "operation": AuditedView(
        entity_type="operation",
        display_name_resolver=_resolve_operation_display_name,
        sources=[
            AuditedSource(
                model=Operation,
                root_id_resolver=lambda instance: instance.pk,
                watched_fields={
                    "name": WatchedField(label="Operation Name"),
                    "type": WatchedField(label="Operation Type"),
                    "naics_code": WatchedField(
                        label="Primary NAICS Code",
                        resolver=lambda v: v.naics_description if v else None,
                    ),
                    "operator": WatchedField(
                        label="Operator",
                        resolver=lambda v: v.legal_name if v else None,
                    ),
                    "regulated_products": WatchedField(
                        label="Regulated Products",
                        resolver=lambda qs: [p.name for p in qs.all()] if qs is not None else [],
                    ),
                    "registration_purpose": WatchedField(label="Registration Purpose"),
                },
            ),
        ],
    ),
    "report": AuditedView(
        entity_type="report",
        display_name_resolver=_resolve_report_display_name,
        sources=[
            AuditedSource(
                model=ReportVersion,
                # Rooted at the parent Report, not the individual ReportVersion's own pk --
                # a version can be deleted (e.g. a draft removed after a registration purpose
                # change), which would make the version's own id unreachable from the UI. The
                # Report itself is stable, so the whole version timeline (create/update/delete)
                # stays reachable under one id even after a version is gone.
                root_id_resolver=lambda instance: instance.report_id,
                watched_fields={
                    "status": WatchedField(label="Status"),
                    "report_type": WatchedField(label="Report Type"),
                },
                delete_field_overrides={
                    "status": _resolve_report_status_after_delete,
                },
            ),
            AuditedSource(
                model=ReportOperation,
                root_id_resolver=lambda instance: instance.report_version.report_id,
                watched_fields={
                    "naics_code": WatchedField(
                        label="NAICS Code",
                        resolver=lambda v: v.naics_description if v else None,
                    ),
                },
            ),
        ],
    ),
}


def get_source_for_model(model: Type[Model]) -> Optional[Tuple[AuditedView, AuditedSource]]:
    """
    Find the (AuditedView, AuditedSource) pair registered for the given base model, if any.

    Returns None if the model isn't part of any audited view -- callers should treat this as a
    cheap no-op signal, since most historically-tracked models in this codebase aren't audited.
    """
    for view in AUDITED_VIEWS.values():
        for source in view.sources:
            if source.model is model:
                return view, source
    return None
