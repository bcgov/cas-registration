# Generated by Django 5.0.6 on 2024-07-02 21:15

import django.contrib.postgres.constraints
import django.contrib.postgres.fields.ranges
import django.db.models.deletion
import reporting.models.configuration
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("registration", "0021_V1_6_0"),
        ("reporting", "0005_delete_sourcetype"),
    ]

    operations = [
        migrations.CreateModel(
            name="BaseSchema",
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
                (
                    "slug",
                    models.CharField(
                        db_comment="Name of the base schema. Should describe what form it is used to generate and when the base schema took effect. For example: general_stationary_combustion_2024",
                        max_length=1000,
                    ),
                ),
                (
                    "schema",
                    models.JSONField(
                        db_comment="The base json schema for a form. This schema defines the static set of fields that should be shown on a form, static meaning that they do not dynamically change based on user input."
                    ),
                ),
            ],
            options={
                "db_table": 'erc"."base_schema',
                "db_table_comment": "This table contains the base json schema data for displaying emission forms. The base schema can be defined by activity and source type and does not change based on user input so it can be stored statically",
            },
        ),
        migrations.CreateModel(
            name="Configuration",
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
                (
                    "slug",
                    models.CharField(
                        db_comment="Unique identifier for a configuration",
                        max_length=1000,
                        unique=True,
                    ),
                ),
                (
                    "valid_from",
                    models.DateField(
                        blank=True,
                        db_comment="Date from which the configuration is applicable",
                        null=True,
                    ),
                ),
                (
                    "valid_to",
                    models.DateField(
                        blank=True,
                        db_comment="Date until which the configuration is applicable",
                        null=True,
                    ),
                ),
            ],
            options={
                "db_table": 'erc"."configuration',
                "db_table_comment": "Table containing program configurations for a date range. Each record will define a time period for when configuration elements are valid. When a change to the configuration is made a new configuration record will be created. This enables historical accuracy when applying configurations from previous years.",
            },
        ),
        migrations.CreateModel(
            name="ConfigurationElement",
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
            ],
            options={
                "db_table": 'erc"."configuration_element',
                "db_table_comment": "Element of a configuration, representing a single relationship between multiple entities. Used to define an allowable activity-sourceType-gasType-methodology relationship as per WCI",
            },
        ),
        migrations.CreateModel(
            name="GasType",
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
                (
                    "name",
                    models.CharField(
                        db_comment="The name of a greenhouse gas type (example: Carbon Dioxide)",
                        max_length=1000,
                    ),
                ),
                (
                    "chemical_formula",
                    models.CharField(
                        db_comment="The chemical formula representation of a greenhouse gast type (example: CO2)",
                        max_length=100,
                    ),
                ),
            ],
            options={
                "db_table": 'erc"."gas_type',
                "db_table_comment": "This table contains the list of gas types that can be reported as defined in GGERR (Greenhous Gas Emission Reporting Regulation)",
            },
        ),
        migrations.CreateModel(
            name="FuelType",
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
                (
                    "name",
                    models.CharField(
                        db_comment="The name of a fuel type (example: Crude Oil)",
                        max_length=1000,
                    ),
                ),
                (
                    "unit",
                    models.CharField(
                        db_comment="The unit of measurement for this fuel type (example: kilolitres)",
                        max_length=1000,
                    ),
                ),
            ],
            options={
                "db_table": 'erc"."fuel_type',
                "db_table_comment": "This table contains the list of fuel types that can be reported.",
            },
        ),
        migrations.CreateModel(
            name="Methodology",
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
                (
                    "name",
                    models.CharField(
                        db_comment="The name of a reporting methodology",
                        max_length=1000,
                    ),
                ),
            ],
            options={
                "db_table": 'erc"."methodology',
                "db_table_comment": "Table contains the set of reporting methodologies that can be applied to an emission as outlined in GGERR (Greenhous Gas Emission Reporting Regulation)",
            },
        ),
        migrations.CreateModel(
            name="ReportingField",
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
                (
                    "field_name",
                    models.CharField(
                        db_comment="Name of field needed for the related configuration element.",
                        max_length=1000,
                    ),
                ),
                (
                    "field_type",
                    models.CharField(db_comment="Type definition for field.", max_length=1000),
                ),
            ],
            options={
                "db_table": 'erc"."reporting_field',
                "db_table_comment": "A field name/type combination that relates to a configuration element record through the config_element_reporting_field intersection table. Used to dynamically create a form schema from the configuration",
            },
        ),
        migrations.CreateModel(
            name="ReportingYear",
            fields=[
                (
                    "reporting_year",
                    models.IntegerField(
                        db_comment="Year for the reporting year, unique and serves as primary key",
                        editable=False,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                (
                    "reporting_window_start",
                    models.DateTimeField(db_comment="Start of the reporting period for that reporting year, UTC-based"),
                ),
                (
                    "reporting_window_end",
                    models.DateTimeField(db_comment="End of the reporting period for that reporting year, UTC-based"),
                ),
                (
                    "description",
                    models.CharField(
                        db_comment="Description for the reporting year",
                        max_length=10000,
                    ),
                ),
            ],
            options={
                "db_table": 'erc"."reporting_year',
                "db_table_comment": "Reporting year",
            },
        ),
        migrations.CreateModel(
            name="SourceType",
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
                (
                    "name",
                    models.CharField(db_comment="The name of a source type", max_length=1000),
                ),
            ],
            options={
                "db_table": 'erc"."source_type',
                "db_table_comment": "Source types",
            },
        ),
        migrations.RemoveField(
            model_name="report",
            name="created_at",
        ),
        migrations.RemoveField(
            model_name="report",
            name="description",
        ),
        migrations.RemoveField(
            model_name="report",
            name="title",
        ),
        migrations.RemoveField(
            model_name="reportoperation",
            name="report",
        ),
        migrations.AddField(
            model_name="report",
            name="operation",
            field=models.ForeignKey(
                db_comment="The operation to which this report belongs",
                null=True,
                on_delete=django.db.models.deletion.DO_NOTHING,
                to="registration.operation",
            ),
        ),
        migrations.AddField(
            model_name="report",
            name="report_operation",
            field=models.OneToOneField(
                db_comment="The report this operation information relates to",
                default=1,
                on_delete=django.db.models.deletion.CASCADE,
                to="reporting.reportoperation",
            ),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name="reportfacility",
            name="facility_bcghgid",
            field=models.CharField(
                blank=True,
                db_comment="The BC GHG ID of the facility as reported",
                max_length=1000,
                null=True,
            ),
        ),
        migrations.AlterField(
            model_name="reportfacility",
            name="report",
            field=models.ForeignKey(
                db_comment="The report this facility information is related to",
                on_delete=django.db.models.deletion.CASCADE,
                related_name="report_facilities",
                to="reporting.report",
            ),
        ),
        migrations.AlterField(
            model_name="reportoperation",
            name="bc_obps_regulated_operation_id",
            field=models.CharField(
                blank=True,
                db_comment="The BC OBPS Regulated Operation ID (BORO ID) for this operation",
                max_length=255,
                null=True,
            ),
        ),
        migrations.AlterField(
            model_name="reportoperation",
            name="operation_representative_name",
            field=models.CharField(
                db_comment="The full name of the operation representative",
                max_length=10000,
            ),
        ),
        migrations.AlterField(
            model_name="reportoperation",
            name="operator_trade_name",
            field=models.CharField(
                blank=True,
                db_comment="The trade name of the operator operating this operation",
                max_length=1000,
                null=True,
            ),
        ),
        migrations.CreateModel(
            name="ActivitySourceTypeBaseSchema",
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
                (
                    "reporting_activity",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.DO_NOTHING,
                        related_name="activity_source_type_base_schemas",
                        to="registration.reportingactivity",
                    ),
                ),
                (
                    "base_schema",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.DO_NOTHING,
                        related_name="activity_source_type_base_schemas",
                        to="reporting.baseschema",
                    ),
                ),
            ],
            options={
                "db_table": 'erc"."activity_source_type_base_schema',
                "db_table_comment": "Intersection table that assigns a base_schema as valid for a period of time given an activity-sourceType pair",
            },
        ),
        migrations.AddConstraint(
            model_name="configuration",
            constraint=django.contrib.postgres.constraints.ExclusionConstraint(
                expressions=[
                    (
                        reporting.models.configuration.TsTzRange(
                            "valid_from",
                            "valid_to",
                            django.contrib.postgres.fields.ranges.RangeBoundary(),
                        ),
                        "&&",
                    )
                ],
                name="exclude_overlapping_configuration_records_by_date_range",
            ),
        ),
        migrations.AddField(
            model_name="activitysourcetypebaseschema",
            name="valid_from",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.DO_NOTHING,
                related_name="+",
                to="reporting.configuration",
            ),
        ),
        migrations.AddField(
            model_name="activitysourcetypebaseschema",
            name="valid_to",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.DO_NOTHING,
                related_name="+",
                to="reporting.configuration",
            ),
        ),
        migrations.AddField(
            model_name="configurationelement",
            name="reporting_activity",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.DO_NOTHING,
                related_name="configuration_elements",
                to="registration.reportingactivity",
            ),
        ),
        migrations.AddField(
            model_name="configurationelement",
            name="valid_from",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.DO_NOTHING,
                related_name="+",
                to="reporting.configuration",
            ),
        ),
        migrations.AddField(
            model_name="configurationelement",
            name="valid_to",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.DO_NOTHING,
                related_name="+",
                to="reporting.configuration",
            ),
        ),
        migrations.AddField(
            model_name="configurationelement",
            name="gas_type",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.DO_NOTHING,
                related_name="configuration_elements",
                to="reporting.gastype",
            ),
        ),
        migrations.AddField(
            model_name="configurationelement",
            name="methodology",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.DO_NOTHING,
                related_name="configuration_elements",
                to="reporting.methodology",
            ),
        ),
        migrations.AddField(
            model_name="configurationelement",
            name="reporting_fields",
            field=models.ManyToManyField(
                blank=True,
                related_name="configuration_elements",
                to="reporting.reportingfield",
            ),
        ),
        migrations.AddField(
            model_name="report",
            name="reporting_year",
            field=models.ForeignKey(
                db_comment="The reporting year, for which this report is filled",
                default=1,
                on_delete=django.db.models.deletion.DO_NOTHING,
                to="reporting.reportingyear",
            ),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name="configurationelement",
            name="source_type",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.DO_NOTHING,
                related_name="configuration_elements",
                to="reporting.sourcetype",
            ),
        ),
        migrations.AddField(
            model_name="activitysourcetypebaseschema",
            name="source_type",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.DO_NOTHING,
                related_name="activity_source_type_base_schemas",
                to="reporting.sourcetype",
            ),
        ),
    ]
