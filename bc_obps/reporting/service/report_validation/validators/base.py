from typing import Any, ClassVar
from reporting.models.report_version import ReportVersion
from reporting.service.report_validation.report_validation_error import (
    ReportValidationError,
)
from reporting.service.report_validation.report_validation_tags import ValidationTags
from reporting.service.reporting_flow_service import ReportingFlow

VALIDATOR_REGISTRY: list[type["ReportValidator"]] = []


class ReportValidator:
    """
    Base class for class-based report validators.

    The dispatcher (ReportValidationService) reads three members from each
    registered class:
        TAGS                                — list of ValidationTags used to filter by trigger.
        applies(flow)                       — bool, whether this validator should run for the flow.
        validate(report_version, flow)      — dict of error_key -> ReportValidationError.

    Concrete validators are auto-registered into VALIDATOR_REGISTRY at class
    definition time via __init_subclass__ .
    Concrete subclasses must:
        - Have a class name ending in 'Validator'.
        - Override validate() somewhere between themselves and ReportValidator.
        - Declare a non-empty TAGS list of ValidationTags members.
    """

    TAGS: ClassVar[list[ValidationTags]] = [ValidationTags.REPORT_VALIDATION]

    def __init_subclass__(cls, abstract: bool = False, **kwargs: Any) -> None:
        super().__init_subclass__(**kwargs)

        if abstract:
            return

        cls._enforce_validator_contract()

        if cls not in VALIDATOR_REGISTRY:
            VALIDATOR_REGISTRY.append(cls)

    @classmethod
    def _enforce_validator_contract(cls) -> None:
        if not cls.__name__.endswith("Validator"):
            raise TypeError(f"{cls.__qualname__}: report validator class names must end in 'Validator'.")

        validate_overridden = any(
            "validate" in ancestor.__dict__ for ancestor in cls.__mro__ if ancestor not in (ReportValidator, object)
        )
        if not validate_overridden:
            raise TypeError(
                f"{cls.__qualname__}: must override validate(cls, report_version, flow). "
                "Mark intermediate base classes with `abstract=True` if they are not "
                "intended to be dispatched."
            )

        if not cls.TAGS:
            raise TypeError(f"{cls.__qualname__}: TAGS must declare at least one ValidationTags member.")

        invalid_tags = [tag for tag in cls.TAGS if not isinstance(tag, ValidationTags)]
        if invalid_tags:
            raise TypeError(
                f"{cls.__qualname__}: TAGS must contain only ValidationTags members; " f"got {invalid_tags!r}."
            )

    @classmethod
    def applies(cls, flow: ReportingFlow) -> bool:
        return True

    @classmethod
    def validate(
        cls,
        report_version: ReportVersion,
        flow: ReportingFlow,
    ) -> dict[str, ReportValidationError]:
        raise NotImplementedError
