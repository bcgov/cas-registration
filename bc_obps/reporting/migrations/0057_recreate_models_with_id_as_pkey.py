# Generated by Django 5.0.11 on 2025-02-07 22:13

import django.db.models.deletion
import pgtrigger.compiler
import pgtrigger.migrations
import phonenumber_field.modelfields
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        (
            "registration",
            "0076_alter_facility_type_alter_historicalfacility_type_and_more",
        ),
        ("reporting", "0056_delete_models_to_change_pkey"),
    ]

    operations = [
        migrations.CreateModel(
            name="ReportAdditionalData",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("created_at", models.DateTimeField(blank=True, null=True)),
                ("updated_at", models.DateTimeField(blank=True, null=True)),
                ("archived_at", models.DateTimeField(blank=True, null=True)),
                (
                    "capture_emissions",
                    models.BooleanField(
                        db_comment="Whether or not capture emissions was selected",
                        default=False,
                    ),
                ),
                (
                    "emissions_on_site_use",
                    models.IntegerField(blank=True, db_comment="Emissions on site use", null=True),
                ),
                (
                    "emissions_on_site_sequestration",
                    models.IntegerField(
                        blank=True,
                        db_comment="Emissions on site sequestration",
                        null=True,
                    ),
                ),
                (
                    "emissions_off_site_transfer",
                    models.IntegerField(blank=True, db_comment="Emissions off-site transfer", null=True),
                ),
                (
                    "electricity_generated",
                    models.IntegerField(blank=True, db_comment="Electricity generated", null=True),
                ),
                (
                    "archived_by",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name="%(class)s_archived",
                        to="registration.user",
                    ),
                ),
                (
                    "created_by",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name="%(class)s_created",
                        to="registration.user",
                    ),
                ),
                (
                    "report_version",
                    models.OneToOneField(
                        db_comment="The report version this report additional data applies to",
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="report_additional_data",
                        to="reporting.reportversion",
                    ),
                ),
                (
                    "updated_by",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name="%(class)s_updated",
                        to="registration.user",
                    ),
                ),
            ],
            options={
                "db_table": 'erc"."report_additional_data',
                "db_table_comment": "A table to store the additional data for the report",
                "abstract": False,
            },
        ),
        migrations.CreateModel(
            name="ReportPersonResponsible",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("created_at", models.DateTimeField(blank=True, null=True)),
                ("updated_at", models.DateTimeField(blank=True, null=True)),
                ("archived_at", models.DateTimeField(blank=True, null=True)),
                (
                    "first_name",
                    models.CharField(db_comment="A user or contact's first name", max_length=1000),
                ),
                (
                    "last_name",
                    models.CharField(db_comment="A user or contact's last name", max_length=1000),
                ),
                (
                    "position_title",
                    models.CharField(db_comment="A user or contact's position title", max_length=1000),
                ),
                (
                    "email",
                    models.EmailField(
                        db_comment="A user or contact's email, limited to valid emails",
                        max_length=254,
                    ),
                ),
                (
                    "phone_number",
                    phonenumber_field.modelfields.PhoneNumberField(
                        blank=True,
                        db_comment="A user or contact's phone number, limited to valid phone numbers",
                        max_length=128,
                        region=None,
                    ),
                ),
                (
                    "street_address",
                    models.CharField(db_comment="The street address of the contact.", max_length=255),
                ),
                (
                    "municipality",
                    models.CharField(db_comment="The municipality of the contact.", max_length=255),
                ),
                (
                    "province",
                    models.CharField(db_comment="The province of the contact.", max_length=100),
                ),
                (
                    "postal_code",
                    models.CharField(db_comment="The postal code of the contact.", max_length=20),
                ),
                (
                    "business_role",
                    models.CharField(db_comment="The business role of the contact.", max_length=255),
                ),
                (
                    "archived_by",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name="%(class)s_archived",
                        to="registration.user",
                    ),
                ),
                (
                    "created_by",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name="%(class)s_created",
                        to="registration.user",
                    ),
                ),
                (
                    "report_version",
                    models.OneToOneField(
                        db_comment="The report version this person responsible applies to",
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="report_person_responsible",
                        to="reporting.reportversion",
                    ),
                ),
                (
                    "updated_by",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name="%(class)s_updated",
                        to="registration.user",
                    ),
                ),
            ],
            options={
                "db_table": 'erc"."report_person_responsible',
                "db_table_comment": "A table to store the data about the person responsible for the report",
                "abstract": False,
            },
        ),
        migrations.CreateModel(
            name="ReportVerification",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("created_at", models.DateTimeField(blank=True, null=True)),
                ("updated_at", models.DateTimeField(blank=True, null=True)),
                ("archived_at", models.DateTimeField(blank=True, null=True)),
                (
                    "verification_body_name",
                    models.CharField(
                        db_comment="The name of the verification body conducting the verification",
                        max_length=1000,
                    ),
                ),
                (
                    "accredited_by",
                    models.CharField(
                        choices=[("ANAB", "Anab"), ("SCC", "Scc")],
                        db_comment="The verification accreditation body",
                        max_length=10,
                    ),
                ),
                (
                    "scope_of_verification",
                    models.CharField(
                        choices=[
                            ("B.C. OBPS Annual Report", "Bc Obps"),
                            ("Supplementary Report", "Supplementary"),
                            ("Corrected Report", "Corrected"),
                        ],
                        db_comment="The scope of the verification",
                        max_length=50,
                    ),
                ),
                (
                    "threats_to_independence",
                    models.BooleanField(db_comment="Indicates whether there were any threats to independence noted"),
                ),
                (
                    "verification_conclusion",
                    models.CharField(
                        choices=[
                            ("Positive", "Positive"),
                            ("Modified", "Modified"),
                            ("Negative", "Negative"),
                        ],
                        db_comment="The conclusion of the verification",
                        max_length=8,
                    ),
                ),
                (
                    "archived_by",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name="%(class)s_archived",
                        to="registration.user",
                    ),
                ),
                (
                    "created_by",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name="%(class)s_created",
                        to="registration.user",
                    ),
                ),
                (
                    "report_version",
                    models.OneToOneField(
                        db_comment="The report version of this report verification",
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="report_verification",
                        to="reporting.reportversion",
                    ),
                ),
                (
                    "updated_by",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name="%(class)s_updated",
                        to="registration.user",
                    ),
                ),
            ],
            options={
                "db_table": 'erc"."report_verification',
                "db_table_comment": "Table to store verification information associated with a report version",
                "abstract": False,
            },
        ),
        pgtrigger.migrations.AddTrigger(
            model_name="reportadditionaldata",
            trigger=pgtrigger.compiler.Trigger(
                name="set_created_audit_columns",
                sql=pgtrigger.compiler.UpsertTriggerSql(
                    func="new.created_by_id = (select current_setting('my.guid', true)); new.created_at = now(); return new;",
                    hash="cb6c94d5e55db5286a0e73d783a8da48337d6001",
                    operation="INSERT",
                    pgid="pgtrigger_set_created_audit_columns_85628",
                    table='erc"."report_additional_data',
                    when="BEFORE",
                ),
            ),
        ),
        pgtrigger.migrations.AddTrigger(
            model_name="reportadditionaldata",
            trigger=pgtrigger.compiler.Trigger(
                name="set_updated_audit_columns",
                sql=pgtrigger.compiler.UpsertTriggerSql(
                    func="new.updated_by_id = (select current_setting('my.guid', true)); new.updated_at = now(); return new;",
                    hash="fbb7e410c9bab331b31f23f05df69ea6e92d2f34",
                    operation="UPDATE",
                    pgid="pgtrigger_set_updated_audit_columns_10b60",
                    table='erc"."report_additional_data',
                    when="BEFORE",
                ),
            ),
        ),
        pgtrigger.migrations.AddTrigger(
            model_name="reportpersonresponsible",
            trigger=pgtrigger.compiler.Trigger(
                name="set_created_audit_columns",
                sql=pgtrigger.compiler.UpsertTriggerSql(
                    func="new.created_by_id = (select current_setting('my.guid', true)); new.created_at = now(); return new;",
                    hash="bb162791540d1e8f1e6f08b94f20784379fc3c8a",
                    operation="INSERT",
                    pgid="pgtrigger_set_created_audit_columns_a62b6",
                    table='erc"."report_person_responsible',
                    when="BEFORE",
                ),
            ),
        ),
        pgtrigger.migrations.AddTrigger(
            model_name="reportpersonresponsible",
            trigger=pgtrigger.compiler.Trigger(
                name="set_updated_audit_columns",
                sql=pgtrigger.compiler.UpsertTriggerSql(
                    func="new.updated_by_id = (select current_setting('my.guid', true)); new.updated_at = now(); return new;",
                    hash="56dfaab4f9c0a852dcfb789b51a4eb07509af7f2",
                    operation="UPDATE",
                    pgid="pgtrigger_set_updated_audit_columns_515b7",
                    table='erc"."report_person_responsible',
                    when="BEFORE",
                ),
            ),
        ),
        pgtrigger.migrations.AddTrigger(
            model_name="reportverification",
            trigger=pgtrigger.compiler.Trigger(
                name="set_created_audit_columns",
                sql=pgtrigger.compiler.UpsertTriggerSql(
                    func="new.created_by_id = (select current_setting('my.guid', true)); new.created_at = now(); return new;",
                    hash="04e06ba2cad6b55dceb3a1e016bde958d2e7a0c5",
                    operation="INSERT",
                    pgid="pgtrigger_set_created_audit_columns_90770",
                    table='erc"."report_verification',
                    when="BEFORE",
                ),
            ),
        ),
        pgtrigger.migrations.AddTrigger(
            model_name="reportverification",
            trigger=pgtrigger.compiler.Trigger(
                name="set_updated_audit_columns",
                sql=pgtrigger.compiler.UpsertTriggerSql(
                    func="new.updated_by_id = (select current_setting('my.guid', true)); new.updated_at = now(); return new;",
                    hash="3cd7525cefd08840cbf81a7b7ff9473a0fe0452e",
                    operation="UPDATE",
                    pgid="pgtrigger_set_updated_audit_columns_71494",
                    table='erc"."report_verification',
                    when="BEFORE",
                ),
            ),
        ),
    ]
