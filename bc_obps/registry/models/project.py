import uuid
from registration.models.time_stamped_model import TimeStampedModel
from common.enums import Schemas
from django.db import models
from simple_history.models import HistoricalRecords
from registry.enums.enums import RegistryTableNames
from registration.models import Operation, Address, Contact
from registry.models import Account, Verifier, Program
from registry.models.rls_configs.project import Rls as RegistryProjectRls


class Project(TimeStampedModel):
    class ProjectType(models.TextChoices):
        SEQUESTRATION = "Sequestration & Carbon Removal"
        FCOP = "FCOP"
        EMISSIONS_REDUCTIONS = "Emissions Reductions & Avoidance"
        WASTE_RECOVERY = "Waste & Circular Recovery"
        ENERGY_EFFICIENCY = "Energy & Efficiency Transition"
        OTHER = "Other"

    class ProjectStatus(models.TextChoices):
        ACTIVE = "Active"
        INACTIVE = "Inactive"

    class Category(models.TextChoices):
        CARBON = "Carbon"

    id = models.PositiveBigIntegerField(
        primary_key=True, db_comment="Primary key to identify the registry project"
    )
    name = models.CharField(max_length=1000, db_comment="The name of the project")
    account = models.ForeignKey(
        Account,
        on_delete=models.PROTECT,
        db_comment="The registry account associated with the project",
        related_name="project",
    )
    project_type = models.CharField(
        max_length=50,
        choices=ProjectType.choices,
    )
    category = models.CharField(max_length=50, choices=Category.choices)
    verifier = models.ForeignKey(
        Verifier, on_delete=models.DO_NOTHING, related_name="projects", db_comment="The verifier for the project"
    )
    address = models.ForeignKey(
        Address,
        on_delete=models.PROTECT,
    )
    project_start_date = models.DateField(blank=True, null=True, db_comment="The anticipated start date of the project")
    project_end_date = models.DateField(
        blank=True,
        null=True,
        db_comment="The anticipated end date of the project",
    )
    description = models.CharField(max_length=2000, blank=True, null=True, db_comment="A description of the project")
    operation_id = models.ForeignKey(Operation, on_delete=models.DO_NOTHING, related_name="registry_project")
    status = models.CharField(
        max_length=50, choices=ProjectStatus.choices, db_comment="Indicates whether the project is active or not."
    )
    program = models.ForeignKey(Program, on_delete=models.PROTECT)
    contact = models.ForeignKey(
        Contact,
        on_delete=models.PROTECT,
        db_comment="A point of contact for the project",
        related_name="registry_project_contact",
    )
    history = HistoricalRecords(
        table_name='erc_history"."project_history', history_user_id_field=models.UUIDField(null=True, blank=True)
    )

    class Meta(TimeStampedModel.Meta):
        db_table_comment = "Table containing project information relating to the internal BC Carbon Registry"
        db_table = f'{Schemas.ERC.value}"."{RegistryTableNames.PROJECT.value}'

    Rls = RegistryProjectRls
