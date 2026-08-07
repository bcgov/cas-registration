from ._squashed_data_functions import (
    update_activity_schema_titles,
    create_2025_configuration,
    reverse_create_2025_configuration,
    update_configuration_elements,
    reverse_update_configuration_elements,
    update_activity_schemas,
    reverse_update_activity_schemas,
    init_pulp_and_paper_2025_schemas,
    reverse_init_pulp_and_paper_2025_schemas,
    insert_lime_recovery_kiln_override,
    revert_lime_recovery_kiln_override,
    fix_municipal_solid_waste_fuel_name,
    remove_duplicate_methodology_records,
    populate_slug,
    insert_validation_records,
    revert_validation_records,
    seed_fuel_type_descriptions,
    update_chemical_pulp_pwaei_for_2025,
    update_reporting_fields,
    update_slugs,
    reload_activity_schema_data,
    undo_update_reporting_fields,
    update_reporting_fields_2,
    populate_naics_code,
    update_fuel_amount_ranges,
    revert_fuel_amount_ranges,
    populate_missing_report_version_fields,
    remove_2023_ry,
    revert_2023_ry,
)

import pgtrigger.compiler
import pgtrigger.migrations

import django.db.migrations.operations.special
from django.db import migrations, models
import reporting


class Migration(migrations.Migration):

    atomic = False

    replaces = [
        ('reporting', '0149_V5_0_1'),
        ('reporting', '0150_update_activity_json_schema_titles'),
        ('reporting', '0151_V5_1_0'),
        ('reporting', '0152_report_operation_final_reporting_year'),
        ('reporting', '0153_V5_2_0'),
        ('reporting', '0154_create_2025_configuration'),
        ('reporting', '0155_update_configuration_elements_for_2025'),
        ('reporting', '0156_update_activity_schemas_for_2025'),
        ('reporting', '0157_pulp_and_paper_biogenic_emissions_2025'),
        ('reporting', '0158_create_naics_regulatory_override_table'),
        ('reporting', '0159_populate_naics_regulatory_override'),
        ('reporting', '0160_compliance_summary_product_override_values'),
        ('reporting', '0161_update_report_open_date'),
        ('reporting', '0162_V5_3_0'),
        ('reporting', '0163_V5_3_1'),
        ('reporting', '0164_V5_4_0'),
        ('reporting', '0165_V5_4_1'),
        ('reporting', '0166_V5_4_2'),
        ('reporting', '0167_report_compliance_summary_add_jan_mar_production'),
        ('reporting', '0168_V5_4_3'),
        ('reporting', '0169_V5_5_0'),
        ('reporting', '0170_V5_6_0'),
        ('reporting', '0171_fix_municipal_solid_waste_fuel_name'),
        ('reporting', '0172_activityjsonschema_no_overlapping_configuration_records_and_more'),
        ('reporting', '0173_remove_duplicate_methodology_records'),
        ('reporting', '0174_V5_7_0'),
        ('reporting', '0175_fuel_type_validation_models'),
        ('reporting', '0176_add_slug_to_reporting_field_and_populate'),
        ('reporting', '0177_populate_validation_model_data'),
        ('reporting', '0178_fueltype_description'),
        ('reporting', '0179_V5_8_0'),
        ('reporting', '0180_update_chemical_pulp_pwaei'),
        ('reporting', '0181_update_activity_field_units'),
        ('reporting', '0182_more_activity_field_updates'),
        ('reporting', '0183_V5_9_0'),
        ('reporting', '0184_alter_reportingyear_options'),
        ('reporting', '0185_configuration_immutable_slug_and_more'),
        ('reporting', '0186_V5_10_0'),
        ('reporting', '0187_reportpersonresponsible_contact'),
        ('reporting', '0188_V5_11_0'),
        ('reporting', '0189_reportoperation_naics_code'),
        ('reporting', '0190_update_diesel_and_natural_gas_fuel_amount_ranges'),
        ('reporting', '0191_add_report_version_to_report_models_missing_it'),
        ('reporting', '0192_V5_12_0'),
        ('reporting', '0193_alter_reportattachment_attachment'),
        ('reporting', '0194_reload_json_schemas_updated_required_fields'),
        ('reporting', '0195_V5_13_0'),
        ('reporting', '0196_V5_13_1'),
        ('reporting', '0197_update_reportattachment_metadata'),
        ('reporting', '0198_V5_14_0'),
        ('reporting', '0199_alter_facilityreport_archived_at_and_more'),
        ('reporting', '0200_V5_15_0'),
        ('reporting', '0201_V5_15_1'),
        ('reporting', '0202_remove_2023_ry'),
        ('reporting', '0203_V5_16_0'),
        ('reporting', '0204_V5_17_0'),
        ('reporting', '0205_alter_activityjsonschema_activity_and_more'),
        ('reporting', '0206_V5_18_0'),
    ]

    dependencies = [
        ('reporting', '0001_initial_squashed_0148_V5_0_0'),
        ('registration', '0189_V5_18_0'),
    ]

    operations = [
        migrations.RunPython(
            code=update_activity_schema_titles,
        ),
        migrations.AddField(
            model_name='reportoperation',
            name='operation_opted_out_final_reporting_year',
            field=models.IntegerField(
                blank=True,
                db_comment='The last year an operation will report for, if it has opted out of BCIERS',
                null=True,
            ),
        ),
        migrations.AlterField(
            model_name='reportoperation',
            name='operation_bcghgid',
            field=models.CharField(blank=True, db_comment='The BCGHG ID of the operation', max_length=1000, null=True),
        ),
        migrations.RunPython(
            code=create_2025_configuration,
            reverse_code=reverse_create_2025_configuration,
        ),
        migrations.RunPython(
            code=update_configuration_elements,
            reverse_code=reverse_update_configuration_elements,
        ),
        migrations.RunPython(
            code=update_activity_schemas,
            reverse_code=reverse_update_activity_schemas,
        ),
        migrations.RunPython(
            code=init_pulp_and_paper_2025_schemas,
            reverse_code=reverse_init_pulp_and_paper_2025_schemas,
        ),
        migrations.CreateModel(
            name='NaicsRegulatoryOverride',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                (
                    'reduction_factor',
                    models.DecimalField(
                        db_comment='\n            The Province developed distinct reduction factors for products in the B.C. OBPS with disproportionately\n            higher industrial process emissions than those produced in other sectors. \n            https://www2.gov.bc.ca/assets/gov/environment/climate-change/action/carbon-tax/obps-technical-backgrounder.pdf\n            \n            This field overrides the default industry reduction factor for a particular product, if it exists\n            ',
                        decimal_places=4,
                        max_digits=5,
                    ),
                ),
                (
                    'tightening_rate',
                    models.DecimalField(
                        db_comment='\n            Tightening rates are planned, yearly, gradual increases to BC OBPS stringency.\n            https://www2.gov.bc.ca/assets/gov/environment/climate-change/action/carbon-tax/obps-technical-backgrounder.pdf\n\n            This field overrides the default industry tightening rate for a particular product, if it exists\n            ',
                        decimal_places=4,
                        max_digits=5,
                    ),
                ),
                (
                    'valid_from',
                    models.DateField(
                        blank=True, db_comment='Date from which the regulatory values override is applicable', null=True
                    ),
                ),
                (
                    'valid_to',
                    models.DateField(
                        blank=True,
                        db_comment='Date until which the regulatory values override is applicable',
                        null=True,
                    ),
                ),
                (
                    'naics_code',
                    models.ForeignKey(
                        db_comment='Foreign key to the naics_code record that is associated with the regulatory value override in this record',
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name='regulatory_values_overrides',
                        to='registration.naicscode',
                    ),
                ),
                (
                    'regulated_product',
                    models.ForeignKey(
                        db_comment='Foreign key to the regulated_product record associated with the regulatory values override in this record',
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name='regulatory_values_overrides',
                        to='registration.regulatedproduct',
                    ),
                ),
            ],
            options={
                'db_table': 'erc"."naics_regulatory_override',
                'db_table_comment': '\n            This table contains the regulatory values overrides that apply to a naics code and a product, \n            within a set timeframe from where the values are valid and when the values are no longer valid.\n            ',
                'constraints': [
                    django.contrib.postgres.constraints.ExclusionConstraint(
                        expressions=[
                            (
                                reporting.models.naics_regulatory_override.TsTzRange(
                                    'valid_from', 'valid_to', django.contrib.postgres.fields.ranges.RangeBoundary()
                                ),
                                '&&',
                            ),
                            ('naics_code', '='),
                        ],
                        name='exclude_overlapping_naics_regulatory_override_records_by_date_range',
                    )
                ],
            },
        ),
        migrations.RunPython(
            code=insert_lime_recovery_kiln_override,
            reverse_code=revert_lime_recovery_kiln_override,
        ),
        migrations.AlterModelTableComment(
            name='naicsregulatoryoverride',
            table_comment='\n            This table contains the regulatory values overrides that apply to a naics code and a product,\n            within a set timeframe from where the values are valid and when the values are no longer valid.\n            ',
        ),
        migrations.AddField(
            model_name='reportcompliancesummaryproduct',
            name='tightening_rate_override',
            field=models.DecimalField(
                blank=True,
                db_comment="Override value from the ReportComplianceSummary's reduction factor, if applicable",
                decimal_places=4,
                max_digits=10,
                null=True,
            ),
        ),
        migrations.AlterField(
            model_name='naicsregulatoryoverride',
            name='reduction_factor',
            field=models.DecimalField(
                db_comment='\n            The Province developed distinct reduction factors for products in the B.C. OBPS with disproportionately\n            higher industrial process emissions than those produced in other sectors.\n            https://www2.gov.bc.ca/assets/gov/environment/climate-change/action/carbon-tax/obps-technical-backgrounder.pdf\n\n            This field overrides the default industry reduction factor for a particular product, if it exists\n            ',
                decimal_places=4,
                max_digits=5,
            ),
        ),
        migrations.AddField(
            model_name='reportcompliancesummaryproduct',
            name='reduction_factor_override',
            field=models.DecimalField(
                blank=True,
                db_comment="Override value from the ReportComplianceSummary's reduction factor, if applicable",
                decimal_places=4,
                max_digits=10,
                null=True,
            ),
        ),
        migrations.AddField(
            model_name='reportcompliancesummaryproduct',
            name='jan_mar_production',
            field=models.DecimalField(
                blank=True,
                db_comment='Amount of product produced between January & March',
                decimal_places=4,
                max_digits=20,
                null=True,
            ),
        ),
        migrations.AddField(
            model_name='reportproduct',
            name='production_data_jan_mar',
            field=models.FloatField(
                blank=True,
                db_comment='The total production amount for January to March period, expressed in the unit of this same model. This should only be relevant to reporting year 2025.',
                null=True,
            ),
        ),
        migrations.RunPython(
            code=fix_municipal_solid_waste_fuel_name,
            reverse_code=django.db.migrations.operations.special.RunPython.noop,
        ),
        pgtrigger.migrations.AddTrigger(
            model_name='activityjsonschema',
            trigger=pgtrigger.compiler.Trigger(
                name='no_overlapping_configuration_records',
                sql=pgtrigger.compiler.UpsertTriggerSql(
                    func='\n        declare\n            new_valid_from date;\n            new_valid_to date;\n        begin\n            select valid_from into new_valid_from\n            from "erc"."configuration" where id = new.valid_from_id;\n\n            select valid_to into new_valid_to\n            from "erc"."configuration" where id = new.valid_to_id;\n\n            if exists (\n                select 1\n                from "erc"."activity_json_schema" t\n                join "erc"."configuration" cf on cf.id = t.valid_from_id\n                join "erc"."configuration" ct on ct.id = t.valid_to_id\n                where t.activity_id = new.activity_id\n                  and (tg_op = \'INSERT\' or t.id != old.id)\n                  and new_valid_from <= ct.valid_to\n                  and new_valid_to >= cf.valid_from\n            ) then\n                raise exception \'This record will result in duplicate json schemas being returned for the date range % - % as it overlaps with a current record or records\', new_valid_from, new_valid_to;\n            end if;\n\n            return new;\n        end;\n        ',
                    hash='f86652fd49716f4c26c1539a2e82b3cbe88b6278',
                    operation='INSERT OR UPDATE',
                    pgid='pgtrigger_no_overlapping_configuration_records_f0ff8',
                    table='erc"."activity_json_schema',
                    when='BEFORE',
                ),
            ),
        ),
        pgtrigger.migrations.AddTrigger(
            model_name='activitysourcetypejsonschema',
            trigger=pgtrigger.compiler.Trigger(
                name='no_overlapping_configuration_records',
                sql=pgtrigger.compiler.UpsertTriggerSql(
                    func='\n        declare\n            new_valid_from date;\n            new_valid_to date;\n        begin\n            select valid_from into new_valid_from\n            from "erc"."configuration" where id = new.valid_from_id;\n\n            select valid_to into new_valid_to\n            from "erc"."configuration" where id = new.valid_to_id;\n\n            if exists (\n                select 1\n                from "erc"."activity_source_type_json_schema" t\n                join "erc"."configuration" cf on cf.id = t.valid_from_id\n                join "erc"."configuration" ct on ct.id = t.valid_to_id\n                where t.activity_id = new.activity_id\n          and t.source_type_id = new.source_type_id\n          and (tg_op = \'INSERT\' or t.id != old.id)\n                  and new_valid_from <= ct.valid_to\n                  and new_valid_to >= cf.valid_from\n            ) then\n                raise exception \'This record will result in duplicate json schemas being returned for the date range % - % as it overlaps with a current record or records\', new_valid_from, new_valid_to;\n            end if;\n\n            return new;\n        end;\n        ',
                    hash='4183a64137f3e114ccab3d249d8dc2d8a7b0f6d2',
                    operation='INSERT OR UPDATE',
                    pgid='pgtrigger_no_overlapping_configuration_records_e384d',
                    table='erc"."activity_source_type_json_schema',
                    when='BEFORE',
                ),
            ),
        ),
        pgtrigger.migrations.AddTrigger(
            model_name='configurationelement',
            trigger=pgtrigger.compiler.Trigger(
                name='no_overlapping_configuration_records',
                sql=pgtrigger.compiler.UpsertTriggerSql(
                    func='\n        declare\n            new_valid_from date;\n            new_valid_to date;\n        begin\n            select valid_from into new_valid_from\n            from "erc"."configuration" where id = new.valid_from_id;\n\n            select valid_to into new_valid_to\n            from "erc"."configuration" where id = new.valid_to_id;\n\n            if exists (\n                select 1\n                from "erc"."configuration_element" t\n                join "erc"."configuration" cf on cf.id = t.valid_from_id\n                join "erc"."configuration" ct on ct.id = t.valid_to_id\n                where t.activity_id = new.activity_id\n          and t.source_type_id = new.source_type_id\n  and t.gas_type_id = new.gas_type_id\n  and t.methodology_id = new.methodology_id\n          and (tg_op = \'INSERT\' or t.id != old.id)\n                  and new_valid_from <= ct.valid_to\n                  and new_valid_to >= cf.valid_from\n            ) then\n                raise exception \'This record will result in duplicate configuration elements being returned for the date range % - % as it overlaps with a current record or records\', new_valid_from, new_valid_to;\n            end if;\n\n            return new;\n        end;\n        ',
                    hash='28ff317dc62bada754fea938b98263a19cf8bb06',
                    operation='INSERT OR UPDATE',
                    pgid='pgtrigger_no_overlapping_configuration_records_7a741',
                    table='erc"."configuration_element',
                    when='BEFORE',
                ),
            ),
        ),
        migrations.RunPython(
            code=remove_duplicate_methodology_records,
            reverse_code=django.db.migrations.operations.special.RunPython.noop,
        ),
        migrations.CreateModel(
            name='ExpectedValueRangeFuelAmount',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                (
                    'lower_bound',
                    models.DecimalField(
                        db_comment='The lower bound of the value range for the related fuel type. The reported fuel_amount value should not be lower than this value',
                        decimal_places=2,
                        default=0,
                        max_digits=10,
                    ),
                ),
                (
                    'upper_bound',
                    models.DecimalField(
                        db_comment='The upper bound of the value range for the related fuel type. The reported fuel_amount value should not be greater than this value',
                        decimal_places=2,
                        max_digits=20,
                    ),
                ),
                ('valid_from', models.DateField(db_comment='The date this range bound record took effect')),
                ('valid_to', models.DateField(db_comment='The last date this range bound record was in effect')),
                (
                    'fuel_type',
                    models.ForeignKey(
                        db_comment='The fuel type record that this value range applies to for the fuel_amount value',
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name='expected_value_range_fuel_amount',
                        to='reporting.fueltype',
                    ),
                ),
            ],
            options={
                'db_table': 'erc"."expected_value_range_fuel_amount',
                'db_table_comment': 'This table contains the expected range of values by fuel_type that a reported fuel_type value should fall within. Values reported outside of these bounds are to be considered extraordinary and should be reviewed.',
            },
        ),
        migrations.CreateModel(
            name='ExpectedValueRangeMethodologyField',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                (
                    'lower_bound',
                    models.DecimalField(
                        db_comment='The lower bound of the value range for the related methodology field. The reported methodology field value should not be lower than this value',
                        decimal_places=4,
                        default=0,
                        max_digits=10,
                    ),
                ),
                (
                    'upper_bound',
                    models.DecimalField(
                        db_comment='The upper bound of the value range for the related methodology field. The reported methodology field value should not be greater than this value',
                        decimal_places=4,
                        max_digits=20,
                    ),
                ),
                ('valid_from', models.DateField(db_comment='The date this range bound record took effect')),
                ('valid_to', models.DateField(db_comment='The last date this range bound record was in effect')),
                (
                    'fuel_type',
                    models.ForeignKey(
                        db_comment='The fuel_type record that this value range applies to for the methodolgy field value',
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name='expected_value_range_methodology_field',
                        to='reporting.fueltype',
                    ),
                ),
                (
                    'methodology',
                    models.ForeignKey(
                        db_comment='The methodology record that this value range applies to for the methodology field value',
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name='expected_value_range_methodology_field',
                        to='reporting.methodology',
                    ),
                ),
                (
                    'reporting_field',
                    models.ForeignKey(
                        db_comment='The reporting_field record that this value range applies to for the methodology field value',
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name='expected_value_range_methodology_field',
                        to='reporting.reportingfield',
                    ),
                ),
            ],
            options={
                'db_table': 'erc"."expected_value_range_methodology_field',
                'db_table_comment': 'This table contains the expected range of values by fuel_type, methodology and reporting_field that a reported methodology field value should fall within. Values reported outside of these bounds are to be considered extraordinary and should be reviewed.',
            },
        ),
        migrations.RemoveConstraint(
            model_name='reportingfield',
            name='unique_reporting_field',
        ),
        migrations.AddField(
            model_name='reportingfield',
            name='slug',
            field=models.CharField(
                db_comment='camel-cased slug defines how this field is represented in the reported json data.',
                default='slug',
                max_length=1000,
            ),
            preserve_default=False,
        ),
        migrations.AddConstraint(
            model_name='reportingfield',
            constraint=models.UniqueConstraint(
                fields=('field_name', 'field_type', 'field_units', 'slug'), name='unique_reporting_field'
            ),
        ),
        migrations.RunPython(
            code=populate_slug,
            reverse_code=django.db.migrations.operations.special.RunPython.noop,
        ),
        migrations.RunPython(
            code=insert_validation_records,
            reverse_code=revert_validation_records,
        ),
        migrations.AddField(
            model_name='fueltype',
            name='description',
            field=models.TextField(
                blank=True,
                db_comment='Optional explanatory text to help users distinguish similar fuel types (e.g., Natural Gas vs Field gas).',
                null=True,
            ),
        ),
        migrations.RunPython(
            code=seed_fuel_type_descriptions,
            reverse_code=django.db.migrations.operations.special.RunPython.noop,
        ),
        migrations.RunPython(
            code=update_chemical_pulp_pwaei_for_2025,
            reverse_code=django.db.migrations.operations.special.RunPython.noop,
        ),
        migrations.RunPython(
            code=update_slugs,
            reverse_code=django.db.migrations.operations.special.RunPython.noop,
        ),
        migrations.RunPython(
            code=update_reporting_fields,
            reverse_code=undo_update_reporting_fields,
        ),
        migrations.RunPython(
            code=reload_activity_schema_data,
            reverse_code=django.db.migrations.operations.special.RunPython.noop,
        ),
        migrations.RunPython(
            code=update_reporting_fields_2,
            reverse_code=django.db.migrations.operations.special.RunPython.noop,
        ),
        migrations.AlterModelOptions(
            name='reportingyear',
            options={'ordering': ['reporting_year']},
        ),
        pgtrigger.migrations.AddTrigger(
            model_name='configuration',
            trigger=pgtrigger.compiler.Trigger(
                name='immutable_slug',
                sql=pgtrigger.compiler.UpsertTriggerSql(
                    func="\n            begin\n\n                if new.slug != old.slug then\n                    raise exception 'slug field is immutable';\n                end if;\n                return new;\n\n            end;\n            ",
                    hash='a0c4536debf17ba2153bda6f026e46a5701eb373',
                    operation='UPDATE',
                    pgid='pgtrigger_immutable_slug_66bb3',
                    table='erc"."configuration',
                    when='BEFORE',
                ),
            ),
        ),
        pgtrigger.migrations.AddTrigger(
            model_name='reportingfield',
            trigger=pgtrigger.compiler.Trigger(
                name='immutable_slug',
                sql=pgtrigger.compiler.UpsertTriggerSql(
                    func="\n            begin\n\n                if new.slug != old.slug then\n                    raise exception 'slug field is immutable';\n                end if;\n                return new;\n\n            end;\n            ",
                    hash='09c9b296e1a61afb6bcbb7332f6ec7c59d13b957',
                    operation='UPDATE',
                    pgid='pgtrigger_immutable_slug_c16df',
                    table='erc"."reporting_field',
                    when='BEFORE',
                ),
            ),
        ),
        migrations.AddField(
            model_name='reportpersonresponsible',
            name='contact',
            field=models.ForeignKey(
                blank=True,
                db_comment='The source contact selected for this person responsible.',
                null=True,
                on_delete=django.db.models.deletion.DO_NOTHING,
                related_name='report_person_responsibles',
                to='registration.contact',
            ),
        ),
        migrations.AddField(
            model_name='reportoperation',
            name='naics_code',
            field=models.ForeignKey(
                blank=True,
                db_comment='The NAICS code of the operation at the time the report was created.',
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='+',
                to='registration.naicscode',
            ),
        ),
        migrations.RunPython(
            code=populate_naics_code,
            reverse_code=django.db.migrations.operations.special.RunPython.noop,
        ),
        migrations.RunPython(
            code=update_fuel_amount_ranges,
            reverse_code=revert_fuel_amount_ranges,
        ),
        migrations.AddField(
            model_name='reportnewentrantemission',
            name='report_version',
            field=models.ForeignKey(
                blank=True,
                db_comment='The report version this new entrant emission record belongs to',
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name='report_new_entrant_emissions',
                to='reporting.reportversion',
            ),
        ),
        migrations.AddField(
            model_name='reportnewentrantproduction',
            name='report_version',
            field=models.ForeignKey(
                blank=True,
                db_comment='The report version this new entrant production record belongs to',
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name='report_new_entrant_productions',
                to='reporting.reportversion',
            ),
        ),
        migrations.AddField(
            model_name='reportrawactivitydata',
            name='report_version',
            field=models.ForeignKey(
                blank=True,
                db_comment='The report version this raw activity data belongs to',
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name='report_raw_activity_data',
                to='reporting.reportversion',
            ),
        ),
        migrations.RunPython(
            code=populate_missing_report_version_fields,
        ),
        migrations.AlterField(
            model_name='reportrawactivitydata',
            name='report_version',
            field=models.ForeignKey(
                db_comment='The report version this raw activity data belongs to',
                on_delete=django.db.models.deletion.CASCADE,
                related_name='report_raw_activity_data',
                to='reporting.reportversion',
            ),
        ),
        migrations.AlterField(
            model_name='reportattachment',
            name='attachment',
            field=models.FileField(
                db_comment='A file uploaded as an attachment to a report',
                max_length=1000,
                upload_to='report_attachments/%Y/',
            ),
        ),
        migrations.AlterField(
            model_name='reportnewentrantemission',
            name='report_version',
            field=models.ForeignKey(
                db_comment='The report version this new entrant emission record belongs to',
                on_delete=django.db.models.deletion.CASCADE,
                related_name='report_new_entrant_emissions',
                to='reporting.reportversion',
            ),
        ),
        migrations.AlterField(
            model_name='reportnewentrantproduction',
            name='report_version',
            field=models.ForeignKey(
                db_comment='The report version this new entrant production record belongs to',
                on_delete=django.db.models.deletion.CASCADE,
                related_name='report_new_entrant_productions',
                to='reporting.reportversion',
            ),
        ),
        migrations.AlterField(
            model_name='reportattachment',
            name='status',
            field=models.CharField(
                choices=[('Unscanned', 'Unscanned'), ('Clean', 'Clean'), ('Quarantined', 'Quarantined')],
                db_comment='The virus/malware scan status of the uploaded file. Set by the scanning service (Unscanned before scan, Clean if safe, Quarantined if malware detected)',
                default='Unscanned',
                max_length=100,
            ),
        ),
        migrations.AlterField(
            model_name='facilityreport',
            name='archived_at',
            field=models.DateTimeField(
                blank=True,
                db_comment='Timestamp with timezone of when the record was archived (soft-deleted). Null if the record is active',
                null=True,
            ),
        ),
        migrations.AlterField(
            model_name='facilityreport',
            name='archived_by',
            field=models.ForeignKey(
                blank=True,
                db_comment='ID of the user who archived (soft-deleted) the record. Null if the record is active. Foreign key to erc.user',
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='%(class)s_archived',
                to='registration.user',
            ),
        ),
        migrations.AlterField(
            model_name='facilityreport',
            name='created_at',
            field=models.DateTimeField(
                blank=True, db_comment='Timestamp with timezone of when the record was created', null=True
            ),
        ),
        migrations.AlterField(
            model_name='facilityreport',
            name='created_by',
            field=models.ForeignKey(
                blank=True,
                db_comment='ID of the user who created the record. Foreign key to erc.user',
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='%(class)s_created',
                to='registration.user',
            ),
        ),
        migrations.AlterField(
            model_name='facilityreport',
            name='updated_at',
            field=models.DateTimeField(
                blank=True, db_comment='Timestamp with timezone of when the record was last updated', null=True
            ),
        ),
        migrations.AlterField(
            model_name='facilityreport',
            name='updated_by',
            field=models.ForeignKey(
                blank=True,
                db_comment='ID of the user who last updated the record. Foreign key to erc.user',
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='%(class)s_updated',
                to='registration.user',
            ),
        ),
        migrations.AlterField(
            model_name='report',
            name='archived_at',
            field=models.DateTimeField(
                blank=True,
                db_comment='Timestamp with timezone of when the record was archived (soft-deleted). Null if the record is active',
                null=True,
            ),
        ),
        migrations.AlterField(
            model_name='report',
            name='archived_by',
            field=models.ForeignKey(
                blank=True,
                db_comment='ID of the user who archived (soft-deleted) the record. Null if the record is active. Foreign key to erc.user',
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='%(class)s_archived',
                to='registration.user',
            ),
        ),
        migrations.AlterField(
            model_name='report',
            name='created_at',
            field=models.DateTimeField(
                blank=True, db_comment='Timestamp with timezone of when the record was created', null=True
            ),
        ),
        migrations.AlterField(
            model_name='report',
            name='created_by',
            field=models.ForeignKey(
                blank=True,
                db_comment='ID of the user who created the record. Foreign key to erc.user',
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='%(class)s_created',
                to='registration.user',
            ),
        ),
        migrations.AlterField(
            model_name='report',
            name='updated_at',
            field=models.DateTimeField(
                blank=True, db_comment='Timestamp with timezone of when the record was last updated', null=True
            ),
        ),
        migrations.AlterField(
            model_name='report',
            name='updated_by',
            field=models.ForeignKey(
                blank=True,
                db_comment='ID of the user who last updated the record. Foreign key to erc.user',
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='%(class)s_updated',
                to='registration.user',
            ),
        ),
        migrations.AlterField(
            model_name='reportactivity',
            name='archived_at',
            field=models.DateTimeField(
                blank=True,
                db_comment='Timestamp with timezone of when the record was archived (soft-deleted). Null if the record is active',
                null=True,
            ),
        ),
        migrations.AlterField(
            model_name='reportactivity',
            name='archived_by',
            field=models.ForeignKey(
                blank=True,
                db_comment='ID of the user who archived (soft-deleted) the record. Null if the record is active. Foreign key to erc.user',
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='%(class)s_archived',
                to='registration.user',
            ),
        ),
        migrations.AlterField(
            model_name='reportactivity',
            name='created_at',
            field=models.DateTimeField(
                blank=True, db_comment='Timestamp with timezone of when the record was created', null=True
            ),
        ),
        migrations.AlterField(
            model_name='reportactivity',
            name='created_by',
            field=models.ForeignKey(
                blank=True,
                db_comment='ID of the user who created the record. Foreign key to erc.user',
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='%(class)s_created',
                to='registration.user',
            ),
        ),
        migrations.AlterField(
            model_name='reportactivity',
            name='updated_at',
            field=models.DateTimeField(
                blank=True, db_comment='Timestamp with timezone of when the record was last updated', null=True
            ),
        ),
        migrations.AlterField(
            model_name='reportactivity',
            name='updated_by',
            field=models.ForeignKey(
                blank=True,
                db_comment='ID of the user who last updated the record. Foreign key to erc.user',
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='%(class)s_updated',
                to='registration.user',
            ),
        ),
        migrations.AlterField(
            model_name='reportadditionaldata',
            name='archived_at',
            field=models.DateTimeField(
                blank=True,
                db_comment='Timestamp with timezone of when the record was archived (soft-deleted). Null if the record is active',
                null=True,
            ),
        ),
        migrations.AlterField(
            model_name='reportadditionaldata',
            name='archived_by',
            field=models.ForeignKey(
                blank=True,
                db_comment='ID of the user who archived (soft-deleted) the record. Null if the record is active. Foreign key to erc.user',
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='%(class)s_archived',
                to='registration.user',
            ),
        ),
        migrations.AlterField(
            model_name='reportadditionaldata',
            name='created_at',
            field=models.DateTimeField(
                blank=True, db_comment='Timestamp with timezone of when the record was created', null=True
            ),
        ),
        migrations.AlterField(
            model_name='reportadditionaldata',
            name='created_by',
            field=models.ForeignKey(
                blank=True,
                db_comment='ID of the user who created the record. Foreign key to erc.user',
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='%(class)s_created',
                to='registration.user',
            ),
        ),
        migrations.AlterField(
            model_name='reportadditionaldata',
            name='updated_at',
            field=models.DateTimeField(
                blank=True, db_comment='Timestamp with timezone of when the record was last updated', null=True
            ),
        ),
        migrations.AlterField(
            model_name='reportadditionaldata',
            name='updated_by',
            field=models.ForeignKey(
                blank=True,
                db_comment='ID of the user who last updated the record. Foreign key to erc.user',
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='%(class)s_updated',
                to='registration.user',
            ),
        ),
        migrations.AlterField(
            model_name='reportattachment',
            name='archived_at',
            field=models.DateTimeField(
                blank=True,
                db_comment='Timestamp with timezone of when the record was archived (soft-deleted). Null if the record is active',
                null=True,
            ),
        ),
        migrations.AlterField(
            model_name='reportattachment',
            name='archived_by',
            field=models.ForeignKey(
                blank=True,
                db_comment='ID of the user who archived (soft-deleted) the record. Null if the record is active. Foreign key to erc.user',
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='%(class)s_archived',
                to='registration.user',
            ),
        ),
        migrations.AlterField(
            model_name='reportattachment',
            name='created_at',
            field=models.DateTimeField(
                blank=True, db_comment='Timestamp with timezone of when the record was created', null=True
            ),
        ),
        migrations.AlterField(
            model_name='reportattachment',
            name='created_by',
            field=models.ForeignKey(
                blank=True,
                db_comment='ID of the user who created the record. Foreign key to erc.user',
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='%(class)s_created',
                to='registration.user',
            ),
        ),
        migrations.AlterField(
            model_name='reportattachment',
            name='updated_at',
            field=models.DateTimeField(
                blank=True, db_comment='Timestamp with timezone of when the record was last updated', null=True
            ),
        ),
        migrations.AlterField(
            model_name='reportattachment',
            name='updated_by',
            field=models.ForeignKey(
                blank=True,
                db_comment='ID of the user who last updated the record. Foreign key to erc.user',
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='%(class)s_updated',
                to='registration.user',
            ),
        ),
        migrations.AlterField(
            model_name='reportattachmentconfirmation',
            name='archived_at',
            field=models.DateTimeField(
                blank=True,
                db_comment='Timestamp with timezone of when the record was archived (soft-deleted). Null if the record is active',
                null=True,
            ),
        ),
        migrations.AlterField(
            model_name='reportattachmentconfirmation',
            name='archived_by',
            field=models.ForeignKey(
                blank=True,
                db_comment='ID of the user who archived (soft-deleted) the record. Null if the record is active. Foreign key to erc.user',
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='%(class)s_archived',
                to='registration.user',
            ),
        ),
        migrations.AlterField(
            model_name='reportattachmentconfirmation',
            name='created_at',
            field=models.DateTimeField(
                blank=True, db_comment='Timestamp with timezone of when the record was created', null=True
            ),
        ),
        migrations.AlterField(
            model_name='reportattachmentconfirmation',
            name='created_by',
            field=models.ForeignKey(
                blank=True,
                db_comment='ID of the user who created the record. Foreign key to erc.user',
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='%(class)s_created',
                to='registration.user',
            ),
        ),
        migrations.AlterField(
            model_name='reportattachmentconfirmation',
            name='updated_at',
            field=models.DateTimeField(
                blank=True, db_comment='Timestamp with timezone of when the record was last updated', null=True
            ),
        ),
        migrations.AlterField(
            model_name='reportattachmentconfirmation',
            name='updated_by',
            field=models.ForeignKey(
                blank=True,
                db_comment='ID of the user who last updated the record. Foreign key to erc.user',
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='%(class)s_updated',
                to='registration.user',
            ),
        ),
        migrations.AlterField(
            model_name='reportcompliancesummary',
            name='archived_at',
            field=models.DateTimeField(
                blank=True,
                db_comment='Timestamp with timezone of when the record was archived (soft-deleted). Null if the record is active',
                null=True,
            ),
        ),
        migrations.AlterField(
            model_name='reportcompliancesummary',
            name='archived_by',
            field=models.ForeignKey(
                blank=True,
                db_comment='ID of the user who archived (soft-deleted) the record. Null if the record is active. Foreign key to erc.user',
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='%(class)s_archived',
                to='registration.user',
            ),
        ),
        migrations.AlterField(
            model_name='reportcompliancesummary',
            name='created_at',
            field=models.DateTimeField(
                blank=True, db_comment='Timestamp with timezone of when the record was created', null=True
            ),
        ),
        migrations.AlterField(
            model_name='reportcompliancesummary',
            name='created_by',
            field=models.ForeignKey(
                blank=True,
                db_comment='ID of the user who created the record. Foreign key to erc.user',
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='%(class)s_created',
                to='registration.user',
            ),
        ),
        migrations.AlterField(
            model_name='reportcompliancesummary',
            name='updated_at',
            field=models.DateTimeField(
                blank=True, db_comment='Timestamp with timezone of when the record was last updated', null=True
            ),
        ),
        migrations.AlterField(
            model_name='reportcompliancesummary',
            name='updated_by',
            field=models.ForeignKey(
                blank=True,
                db_comment='ID of the user who last updated the record. Foreign key to erc.user',
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='%(class)s_updated',
                to='registration.user',
            ),
        ),
        migrations.AlterField(
            model_name='reportcompliancesummaryproduct',
            name='archived_at',
            field=models.DateTimeField(
                blank=True,
                db_comment='Timestamp with timezone of when the record was archived (soft-deleted). Null if the record is active',
                null=True,
            ),
        ),
        migrations.AlterField(
            model_name='reportcompliancesummaryproduct',
            name='archived_by',
            field=models.ForeignKey(
                blank=True,
                db_comment='ID of the user who archived (soft-deleted) the record. Null if the record is active. Foreign key to erc.user',
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='%(class)s_archived',
                to='registration.user',
            ),
        ),
        migrations.AlterField(
            model_name='reportcompliancesummaryproduct',
            name='created_at',
            field=models.DateTimeField(
                blank=True, db_comment='Timestamp with timezone of when the record was created', null=True
            ),
        ),
        migrations.AlterField(
            model_name='reportcompliancesummaryproduct',
            name='created_by',
            field=models.ForeignKey(
                blank=True,
                db_comment='ID of the user who created the record. Foreign key to erc.user',
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='%(class)s_created',
                to='registration.user',
            ),
        ),
        migrations.AlterField(
            model_name='reportcompliancesummaryproduct',
            name='updated_at',
            field=models.DateTimeField(
                blank=True, db_comment='Timestamp with timezone of when the record was last updated', null=True
            ),
        ),
        migrations.AlterField(
            model_name='reportcompliancesummaryproduct',
            name='updated_by',
            field=models.ForeignKey(
                blank=True,
                db_comment='ID of the user who last updated the record. Foreign key to erc.user',
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='%(class)s_updated',
                to='registration.user',
            ),
        ),
        migrations.AlterField(
            model_name='reportelectricityimportdata',
            name='archived_at',
            field=models.DateTimeField(
                blank=True,
                db_comment='Timestamp with timezone of when the record was archived (soft-deleted). Null if the record is active',
                null=True,
            ),
        ),
        migrations.AlterField(
            model_name='reportelectricityimportdata',
            name='archived_by',
            field=models.ForeignKey(
                blank=True,
                db_comment='ID of the user who archived (soft-deleted) the record. Null if the record is active. Foreign key to erc.user',
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='%(class)s_archived',
                to='registration.user',
            ),
        ),
        migrations.AlterField(
            model_name='reportelectricityimportdata',
            name='created_at',
            field=models.DateTimeField(
                blank=True, db_comment='Timestamp with timezone of when the record was created', null=True
            ),
        ),
        migrations.AlterField(
            model_name='reportelectricityimportdata',
            name='created_by',
            field=models.ForeignKey(
                blank=True,
                db_comment='ID of the user who created the record. Foreign key to erc.user',
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='%(class)s_created',
                to='registration.user',
            ),
        ),
        migrations.AlterField(
            model_name='reportelectricityimportdata',
            name='updated_at',
            field=models.DateTimeField(
                blank=True, db_comment='Timestamp with timezone of when the record was last updated', null=True
            ),
        ),
        migrations.AlterField(
            model_name='reportelectricityimportdata',
            name='updated_by',
            field=models.ForeignKey(
                blank=True,
                db_comment='ID of the user who last updated the record. Foreign key to erc.user',
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='%(class)s_updated',
                to='registration.user',
            ),
        ),
        migrations.AlterField(
            model_name='reportemission',
            name='archived_at',
            field=models.DateTimeField(
                blank=True,
                db_comment='Timestamp with timezone of when the record was archived (soft-deleted). Null if the record is active',
                null=True,
            ),
        ),
        migrations.AlterField(
            model_name='reportemission',
            name='archived_by',
            field=models.ForeignKey(
                blank=True,
                db_comment='ID of the user who archived (soft-deleted) the record. Null if the record is active. Foreign key to erc.user',
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='%(class)s_archived',
                to='registration.user',
            ),
        ),
        migrations.AlterField(
            model_name='reportemission',
            name='created_at',
            field=models.DateTimeField(
                blank=True, db_comment='Timestamp with timezone of when the record was created', null=True
            ),
        ),
        migrations.AlterField(
            model_name='reportemission',
            name='created_by',
            field=models.ForeignKey(
                blank=True,
                db_comment='ID of the user who created the record. Foreign key to erc.user',
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='%(class)s_created',
                to='registration.user',
            ),
        ),
        migrations.AlterField(
            model_name='reportemission',
            name='updated_at',
            field=models.DateTimeField(
                blank=True, db_comment='Timestamp with timezone of when the record was last updated', null=True
            ),
        ),
        migrations.AlterField(
            model_name='reportemission',
            name='updated_by',
            field=models.ForeignKey(
                blank=True,
                db_comment='ID of the user who last updated the record. Foreign key to erc.user',
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='%(class)s_updated',
                to='registration.user',
            ),
        ),
        migrations.AlterField(
            model_name='reportemissionallocation',
            name='archived_at',
            field=models.DateTimeField(
                blank=True,
                db_comment='Timestamp with timezone of when the record was archived (soft-deleted). Null if the record is active',
                null=True,
            ),
        ),
        migrations.AlterField(
            model_name='reportemissionallocation',
            name='archived_by',
            field=models.ForeignKey(
                blank=True,
                db_comment='ID of the user who archived (soft-deleted) the record. Null if the record is active. Foreign key to erc.user',
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='%(class)s_archived',
                to='registration.user',
            ),
        ),
        migrations.AlterField(
            model_name='reportemissionallocation',
            name='created_at',
            field=models.DateTimeField(
                blank=True, db_comment='Timestamp with timezone of when the record was created', null=True
            ),
        ),
        migrations.AlterField(
            model_name='reportemissionallocation',
            name='created_by',
            field=models.ForeignKey(
                blank=True,
                db_comment='ID of the user who created the record. Foreign key to erc.user',
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='%(class)s_created',
                to='registration.user',
            ),
        ),
        migrations.AlterField(
            model_name='reportemissionallocation',
            name='updated_at',
            field=models.DateTimeField(
                blank=True, db_comment='Timestamp with timezone of when the record was last updated', null=True
            ),
        ),
        migrations.AlterField(
            model_name='reportemissionallocation',
            name='updated_by',
            field=models.ForeignKey(
                blank=True,
                db_comment='ID of the user who last updated the record. Foreign key to erc.user',
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='%(class)s_updated',
                to='registration.user',
            ),
        ),
        migrations.AlterField(
            model_name='reportfuel',
            name='archived_at',
            field=models.DateTimeField(
                blank=True,
                db_comment='Timestamp with timezone of when the record was archived (soft-deleted). Null if the record is active',
                null=True,
            ),
        ),
        migrations.AlterField(
            model_name='reportfuel',
            name='archived_by',
            field=models.ForeignKey(
                blank=True,
                db_comment='ID of the user who archived (soft-deleted) the record. Null if the record is active. Foreign key to erc.user',
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='%(class)s_archived',
                to='registration.user',
            ),
        ),
        migrations.AlterField(
            model_name='reportfuel',
            name='created_at',
            field=models.DateTimeField(
                blank=True, db_comment='Timestamp with timezone of when the record was created', null=True
            ),
        ),
        migrations.AlterField(
            model_name='reportfuel',
            name='created_by',
            field=models.ForeignKey(
                blank=True,
                db_comment='ID of the user who created the record. Foreign key to erc.user',
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='%(class)s_created',
                to='registration.user',
            ),
        ),
        migrations.AlterField(
            model_name='reportfuel',
            name='updated_at',
            field=models.DateTimeField(
                blank=True, db_comment='Timestamp with timezone of when the record was last updated', null=True
            ),
        ),
        migrations.AlterField(
            model_name='reportfuel',
            name='updated_by',
            field=models.ForeignKey(
                blank=True,
                db_comment='ID of the user who last updated the record. Foreign key to erc.user',
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='%(class)s_updated',
                to='registration.user',
            ),
        ),
        migrations.AlterField(
            model_name='reportmethodology',
            name='archived_at',
            field=models.DateTimeField(
                blank=True,
                db_comment='Timestamp with timezone of when the record was archived (soft-deleted). Null if the record is active',
                null=True,
            ),
        ),
        migrations.AlterField(
            model_name='reportmethodology',
            name='archived_by',
            field=models.ForeignKey(
                blank=True,
                db_comment='ID of the user who archived (soft-deleted) the record. Null if the record is active. Foreign key to erc.user',
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='%(class)s_archived',
                to='registration.user',
            ),
        ),
        migrations.AlterField(
            model_name='reportmethodology',
            name='created_at',
            field=models.DateTimeField(
                blank=True, db_comment='Timestamp with timezone of when the record was created', null=True
            ),
        ),
        migrations.AlterField(
            model_name='reportmethodology',
            name='created_by',
            field=models.ForeignKey(
                blank=True,
                db_comment='ID of the user who created the record. Foreign key to erc.user',
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='%(class)s_created',
                to='registration.user',
            ),
        ),
        migrations.AlterField(
            model_name='reportmethodology',
            name='updated_at',
            field=models.DateTimeField(
                blank=True, db_comment='Timestamp with timezone of when the record was last updated', null=True
            ),
        ),
        migrations.AlterField(
            model_name='reportmethodology',
            name='updated_by',
            field=models.ForeignKey(
                blank=True,
                db_comment='ID of the user who last updated the record. Foreign key to erc.user',
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='%(class)s_updated',
                to='registration.user',
            ),
        ),
        migrations.AlterField(
            model_name='reportnewentrant',
            name='archived_at',
            field=models.DateTimeField(
                blank=True,
                db_comment='Timestamp with timezone of when the record was archived (soft-deleted). Null if the record is active',
                null=True,
            ),
        ),
        migrations.AlterField(
            model_name='reportnewentrant',
            name='archived_by',
            field=models.ForeignKey(
                blank=True,
                db_comment='ID of the user who archived (soft-deleted) the record. Null if the record is active. Foreign key to erc.user',
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='%(class)s_archived',
                to='registration.user',
            ),
        ),
        migrations.AlterField(
            model_name='reportnewentrant',
            name='created_at',
            field=models.DateTimeField(
                blank=True, db_comment='Timestamp with timezone of when the record was created', null=True
            ),
        ),
        migrations.AlterField(
            model_name='reportnewentrant',
            name='created_by',
            field=models.ForeignKey(
                blank=True,
                db_comment='ID of the user who created the record. Foreign key to erc.user',
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='%(class)s_created',
                to='registration.user',
            ),
        ),
        migrations.AlterField(
            model_name='reportnewentrant',
            name='updated_at',
            field=models.DateTimeField(
                blank=True, db_comment='Timestamp with timezone of when the record was last updated', null=True
            ),
        ),
        migrations.AlterField(
            model_name='reportnewentrant',
            name='updated_by',
            field=models.ForeignKey(
                blank=True,
                db_comment='ID of the user who last updated the record. Foreign key to erc.user',
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='%(class)s_updated',
                to='registration.user',
            ),
        ),
        migrations.AlterField(
            model_name='reportnewentrantemission',
            name='archived_at',
            field=models.DateTimeField(
                blank=True,
                db_comment='Timestamp with timezone of when the record was archived (soft-deleted). Null if the record is active',
                null=True,
            ),
        ),
        migrations.AlterField(
            model_name='reportnewentrantemission',
            name='archived_by',
            field=models.ForeignKey(
                blank=True,
                db_comment='ID of the user who archived (soft-deleted) the record. Null if the record is active. Foreign key to erc.user',
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='%(class)s_archived',
                to='registration.user',
            ),
        ),
        migrations.AlterField(
            model_name='reportnewentrantemission',
            name='created_at',
            field=models.DateTimeField(
                blank=True, db_comment='Timestamp with timezone of when the record was created', null=True
            ),
        ),
        migrations.AlterField(
            model_name='reportnewentrantemission',
            name='created_by',
            field=models.ForeignKey(
                blank=True,
                db_comment='ID of the user who created the record. Foreign key to erc.user',
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='%(class)s_created',
                to='registration.user',
            ),
        ),
        migrations.AlterField(
            model_name='reportnewentrantemission',
            name='updated_at',
            field=models.DateTimeField(
                blank=True, db_comment='Timestamp with timezone of when the record was last updated', null=True
            ),
        ),
        migrations.AlterField(
            model_name='reportnewentrantemission',
            name='updated_by',
            field=models.ForeignKey(
                blank=True,
                db_comment='ID of the user who last updated the record. Foreign key to erc.user',
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='%(class)s_updated',
                to='registration.user',
            ),
        ),
        migrations.AlterField(
            model_name='reportnewentrantproduction',
            name='archived_at',
            field=models.DateTimeField(
                blank=True,
                db_comment='Timestamp with timezone of when the record was archived (soft-deleted). Null if the record is active',
                null=True,
            ),
        ),
        migrations.AlterField(
            model_name='reportnewentrantproduction',
            name='archived_by',
            field=models.ForeignKey(
                blank=True,
                db_comment='ID of the user who archived (soft-deleted) the record. Null if the record is active. Foreign key to erc.user',
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='%(class)s_archived',
                to='registration.user',
            ),
        ),
        migrations.AlterField(
            model_name='reportnewentrantproduction',
            name='created_at',
            field=models.DateTimeField(
                blank=True, db_comment='Timestamp with timezone of when the record was created', null=True
            ),
        ),
        migrations.AlterField(
            model_name='reportnewentrantproduction',
            name='created_by',
            field=models.ForeignKey(
                blank=True,
                db_comment='ID of the user who created the record. Foreign key to erc.user',
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='%(class)s_created',
                to='registration.user',
            ),
        ),
        migrations.AlterField(
            model_name='reportnewentrantproduction',
            name='updated_at',
            field=models.DateTimeField(
                blank=True, db_comment='Timestamp with timezone of when the record was last updated', null=True
            ),
        ),
        migrations.AlterField(
            model_name='reportnewentrantproduction',
            name='updated_by',
            field=models.ForeignKey(
                blank=True,
                db_comment='ID of the user who last updated the record. Foreign key to erc.user',
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='%(class)s_updated',
                to='registration.user',
            ),
        ),
        migrations.AlterField(
            model_name='reportnonattributableemissions',
            name='archived_at',
            field=models.DateTimeField(
                blank=True,
                db_comment='Timestamp with timezone of when the record was archived (soft-deleted). Null if the record is active',
                null=True,
            ),
        ),
        migrations.AlterField(
            model_name='reportnonattributableemissions',
            name='archived_by',
            field=models.ForeignKey(
                blank=True,
                db_comment='ID of the user who archived (soft-deleted) the record. Null if the record is active. Foreign key to erc.user',
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='%(class)s_archived',
                to='registration.user',
            ),
        ),
        migrations.AlterField(
            model_name='reportnonattributableemissions',
            name='created_at',
            field=models.DateTimeField(
                blank=True, db_comment='Timestamp with timezone of when the record was created', null=True
            ),
        ),
        migrations.AlterField(
            model_name='reportnonattributableemissions',
            name='created_by',
            field=models.ForeignKey(
                blank=True,
                db_comment='ID of the user who created the record. Foreign key to erc.user',
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='%(class)s_created',
                to='registration.user',
            ),
        ),
        migrations.AlterField(
            model_name='reportnonattributableemissions',
            name='updated_at',
            field=models.DateTimeField(
                blank=True, db_comment='Timestamp with timezone of when the record was last updated', null=True
            ),
        ),
        migrations.AlterField(
            model_name='reportnonattributableemissions',
            name='updated_by',
            field=models.ForeignKey(
                blank=True,
                db_comment='ID of the user who last updated the record. Foreign key to erc.user',
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='%(class)s_updated',
                to='registration.user',
            ),
        ),
        migrations.AlterField(
            model_name='reportoperation',
            name='archived_at',
            field=models.DateTimeField(
                blank=True,
                db_comment='Timestamp with timezone of when the record was archived (soft-deleted). Null if the record is active',
                null=True,
            ),
        ),
        migrations.AlterField(
            model_name='reportoperation',
            name='archived_by',
            field=models.ForeignKey(
                blank=True,
                db_comment='ID of the user who archived (soft-deleted) the record. Null if the record is active. Foreign key to erc.user',
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='%(class)s_archived',
                to='registration.user',
            ),
        ),
        migrations.AlterField(
            model_name='reportoperation',
            name='created_at',
            field=models.DateTimeField(
                blank=True, db_comment='Timestamp with timezone of when the record was created', null=True
            ),
        ),
        migrations.AlterField(
            model_name='reportoperation',
            name='created_by',
            field=models.ForeignKey(
                blank=True,
                db_comment='ID of the user who created the record. Foreign key to erc.user',
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='%(class)s_created',
                to='registration.user',
            ),
        ),
        migrations.AlterField(
            model_name='reportoperation',
            name='updated_at',
            field=models.DateTimeField(
                blank=True, db_comment='Timestamp with timezone of when the record was last updated', null=True
            ),
        ),
        migrations.AlterField(
            model_name='reportoperation',
            name='updated_by',
            field=models.ForeignKey(
                blank=True,
                db_comment='ID of the user who last updated the record. Foreign key to erc.user',
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='%(class)s_updated',
                to='registration.user',
            ),
        ),
        migrations.AlterField(
            model_name='reportoperationrepresentative',
            name='archived_at',
            field=models.DateTimeField(
                blank=True,
                db_comment='Timestamp with timezone of when the record was archived (soft-deleted). Null if the record is active',
                null=True,
            ),
        ),
        migrations.AlterField(
            model_name='reportoperationrepresentative',
            name='archived_by',
            field=models.ForeignKey(
                blank=True,
                db_comment='ID of the user who archived (soft-deleted) the record. Null if the record is active. Foreign key to erc.user',
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='%(class)s_archived',
                to='registration.user',
            ),
        ),
        migrations.AlterField(
            model_name='reportoperationrepresentative',
            name='created_at',
            field=models.DateTimeField(
                blank=True, db_comment='Timestamp with timezone of when the record was created', null=True
            ),
        ),
        migrations.AlterField(
            model_name='reportoperationrepresentative',
            name='created_by',
            field=models.ForeignKey(
                blank=True,
                db_comment='ID of the user who created the record. Foreign key to erc.user',
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='%(class)s_created',
                to='registration.user',
            ),
        ),
        migrations.AlterField(
            model_name='reportoperationrepresentative',
            name='updated_at',
            field=models.DateTimeField(
                blank=True, db_comment='Timestamp with timezone of when the record was last updated', null=True
            ),
        ),
        migrations.AlterField(
            model_name='reportoperationrepresentative',
            name='updated_by',
            field=models.ForeignKey(
                blank=True,
                db_comment='ID of the user who last updated the record. Foreign key to erc.user',
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='%(class)s_updated',
                to='registration.user',
            ),
        ),
        migrations.AlterField(
            model_name='reportpersonresponsible',
            name='archived_at',
            field=models.DateTimeField(
                blank=True,
                db_comment='Timestamp with timezone of when the record was archived (soft-deleted). Null if the record is active',
                null=True,
            ),
        ),
        migrations.AlterField(
            model_name='reportpersonresponsible',
            name='archived_by',
            field=models.ForeignKey(
                blank=True,
                db_comment='ID of the user who archived (soft-deleted) the record. Null if the record is active. Foreign key to erc.user',
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='%(class)s_archived',
                to='registration.user',
            ),
        ),
        migrations.AlterField(
            model_name='reportpersonresponsible',
            name='created_at',
            field=models.DateTimeField(
                blank=True, db_comment='Timestamp with timezone of when the record was created', null=True
            ),
        ),
        migrations.AlterField(
            model_name='reportpersonresponsible',
            name='created_by',
            field=models.ForeignKey(
                blank=True,
                db_comment='ID of the user who created the record. Foreign key to erc.user',
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='%(class)s_created',
                to='registration.user',
            ),
        ),
        migrations.AlterField(
            model_name='reportpersonresponsible',
            name='updated_at',
            field=models.DateTimeField(
                blank=True, db_comment='Timestamp with timezone of when the record was last updated', null=True
            ),
        ),
        migrations.AlterField(
            model_name='reportpersonresponsible',
            name='updated_by',
            field=models.ForeignKey(
                blank=True,
                db_comment='ID of the user who last updated the record. Foreign key to erc.user',
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='%(class)s_updated',
                to='registration.user',
            ),
        ),
        migrations.AlterField(
            model_name='reportproduct',
            name='archived_at',
            field=models.DateTimeField(
                blank=True,
                db_comment='Timestamp with timezone of when the record was archived (soft-deleted). Null if the record is active',
                null=True,
            ),
        ),
        migrations.AlterField(
            model_name='reportproduct',
            name='archived_by',
            field=models.ForeignKey(
                blank=True,
                db_comment='ID of the user who archived (soft-deleted) the record. Null if the record is active. Foreign key to erc.user',
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='%(class)s_archived',
                to='registration.user',
            ),
        ),
        migrations.AlterField(
            model_name='reportproduct',
            name='created_at',
            field=models.DateTimeField(
                blank=True, db_comment='Timestamp with timezone of when the record was created', null=True
            ),
        ),
        migrations.AlterField(
            model_name='reportproduct',
            name='created_by',
            field=models.ForeignKey(
                blank=True,
                db_comment='ID of the user who created the record. Foreign key to erc.user',
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='%(class)s_created',
                to='registration.user',
            ),
        ),
        migrations.AlterField(
            model_name='reportproduct',
            name='updated_at',
            field=models.DateTimeField(
                blank=True, db_comment='Timestamp with timezone of when the record was last updated', null=True
            ),
        ),
        migrations.AlterField(
            model_name='reportproduct',
            name='updated_by',
            field=models.ForeignKey(
                blank=True,
                db_comment='ID of the user who last updated the record. Foreign key to erc.user',
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='%(class)s_updated',
                to='registration.user',
            ),
        ),
        migrations.AlterField(
            model_name='reportproductemissionallocation',
            name='archived_at',
            field=models.DateTimeField(
                blank=True,
                db_comment='Timestamp with timezone of when the record was archived (soft-deleted). Null if the record is active',
                null=True,
            ),
        ),
        migrations.AlterField(
            model_name='reportproductemissionallocation',
            name='archived_by',
            field=models.ForeignKey(
                blank=True,
                db_comment='ID of the user who archived (soft-deleted) the record. Null if the record is active. Foreign key to erc.user',
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='%(class)s_archived',
                to='registration.user',
            ),
        ),
        migrations.AlterField(
            model_name='reportproductemissionallocation',
            name='created_at',
            field=models.DateTimeField(
                blank=True, db_comment='Timestamp with timezone of when the record was created', null=True
            ),
        ),
        migrations.AlterField(
            model_name='reportproductemissionallocation',
            name='created_by',
            field=models.ForeignKey(
                blank=True,
                db_comment='ID of the user who created the record. Foreign key to erc.user',
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='%(class)s_created',
                to='registration.user',
            ),
        ),
        migrations.AlterField(
            model_name='reportproductemissionallocation',
            name='updated_at',
            field=models.DateTimeField(
                blank=True, db_comment='Timestamp with timezone of when the record was last updated', null=True
            ),
        ),
        migrations.AlterField(
            model_name='reportproductemissionallocation',
            name='updated_by',
            field=models.ForeignKey(
                blank=True,
                db_comment='ID of the user who last updated the record. Foreign key to erc.user',
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='%(class)s_updated',
                to='registration.user',
            ),
        ),
        migrations.AlterField(
            model_name='reportrawactivitydata',
            name='archived_at',
            field=models.DateTimeField(
                blank=True,
                db_comment='Timestamp with timezone of when the record was archived (soft-deleted). Null if the record is active',
                null=True,
            ),
        ),
        migrations.AlterField(
            model_name='reportrawactivitydata',
            name='archived_by',
            field=models.ForeignKey(
                blank=True,
                db_comment='ID of the user who archived (soft-deleted) the record. Null if the record is active. Foreign key to erc.user',
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='%(class)s_archived',
                to='registration.user',
            ),
        ),
        migrations.AlterField(
            model_name='reportrawactivitydata',
            name='created_at',
            field=models.DateTimeField(
                blank=True, db_comment='Timestamp with timezone of when the record was created', null=True
            ),
        ),
        migrations.AlterField(
            model_name='reportrawactivitydata',
            name='created_by',
            field=models.ForeignKey(
                blank=True,
                db_comment='ID of the user who created the record. Foreign key to erc.user',
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='%(class)s_created',
                to='registration.user',
            ),
        ),
        migrations.AlterField(
            model_name='reportrawactivitydata',
            name='updated_at',
            field=models.DateTimeField(
                blank=True, db_comment='Timestamp with timezone of when the record was last updated', null=True
            ),
        ),
        migrations.AlterField(
            model_name='reportrawactivitydata',
            name='updated_by',
            field=models.ForeignKey(
                blank=True,
                db_comment='ID of the user who last updated the record. Foreign key to erc.user',
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='%(class)s_updated',
                to='registration.user',
            ),
        ),
        migrations.AlterField(
            model_name='reportsignoff',
            name='archived_at',
            field=models.DateTimeField(
                blank=True,
                db_comment='Timestamp with timezone of when the record was archived (soft-deleted). Null if the record is active',
                null=True,
            ),
        ),
        migrations.AlterField(
            model_name='reportsignoff',
            name='archived_by',
            field=models.ForeignKey(
                blank=True,
                db_comment='ID of the user who archived (soft-deleted) the record. Null if the record is active. Foreign key to erc.user',
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='%(class)s_archived',
                to='registration.user',
            ),
        ),
        migrations.AlterField(
            model_name='reportsignoff',
            name='created_at',
            field=models.DateTimeField(
                blank=True, db_comment='Timestamp with timezone of when the record was created', null=True
            ),
        ),
        migrations.AlterField(
            model_name='reportsignoff',
            name='created_by',
            field=models.ForeignKey(
                blank=True,
                db_comment='ID of the user who created the record. Foreign key to erc.user',
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='%(class)s_created',
                to='registration.user',
            ),
        ),
        migrations.AlterField(
            model_name='reportsignoff',
            name='updated_at',
            field=models.DateTimeField(
                blank=True, db_comment='Timestamp with timezone of when the record was last updated', null=True
            ),
        ),
        migrations.AlterField(
            model_name='reportsignoff',
            name='updated_by',
            field=models.ForeignKey(
                blank=True,
                db_comment='ID of the user who last updated the record. Foreign key to erc.user',
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='%(class)s_updated',
                to='registration.user',
            ),
        ),
        migrations.AlterField(
            model_name='reportsourcetype',
            name='archived_at',
            field=models.DateTimeField(
                blank=True,
                db_comment='Timestamp with timezone of when the record was archived (soft-deleted). Null if the record is active',
                null=True,
            ),
        ),
        migrations.AlterField(
            model_name='reportsourcetype',
            name='archived_by',
            field=models.ForeignKey(
                blank=True,
                db_comment='ID of the user who archived (soft-deleted) the record. Null if the record is active. Foreign key to erc.user',
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='%(class)s_archived',
                to='registration.user',
            ),
        ),
        migrations.AlterField(
            model_name='reportsourcetype',
            name='created_at',
            field=models.DateTimeField(
                blank=True, db_comment='Timestamp with timezone of when the record was created', null=True
            ),
        ),
        migrations.AlterField(
            model_name='reportsourcetype',
            name='created_by',
            field=models.ForeignKey(
                blank=True,
                db_comment='ID of the user who created the record. Foreign key to erc.user',
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='%(class)s_created',
                to='registration.user',
            ),
        ),
        migrations.AlterField(
            model_name='reportsourcetype',
            name='updated_at',
            field=models.DateTimeField(
                blank=True, db_comment='Timestamp with timezone of when the record was last updated', null=True
            ),
        ),
        migrations.AlterField(
            model_name='reportsourcetype',
            name='updated_by',
            field=models.ForeignKey(
                blank=True,
                db_comment='ID of the user who last updated the record. Foreign key to erc.user',
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='%(class)s_updated',
                to='registration.user',
            ),
        ),
        migrations.AlterField(
            model_name='reportunit',
            name='archived_at',
            field=models.DateTimeField(
                blank=True,
                db_comment='Timestamp with timezone of when the record was archived (soft-deleted). Null if the record is active',
                null=True,
            ),
        ),
        migrations.AlterField(
            model_name='reportunit',
            name='archived_by',
            field=models.ForeignKey(
                blank=True,
                db_comment='ID of the user who archived (soft-deleted) the record. Null if the record is active. Foreign key to erc.user',
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='%(class)s_archived',
                to='registration.user',
            ),
        ),
        migrations.AlterField(
            model_name='reportunit',
            name='created_at',
            field=models.DateTimeField(
                blank=True, db_comment='Timestamp with timezone of when the record was created', null=True
            ),
        ),
        migrations.AlterField(
            model_name='reportunit',
            name='created_by',
            field=models.ForeignKey(
                blank=True,
                db_comment='ID of the user who created the record. Foreign key to erc.user',
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='%(class)s_created',
                to='registration.user',
            ),
        ),
        migrations.AlterField(
            model_name='reportunit',
            name='updated_at',
            field=models.DateTimeField(
                blank=True, db_comment='Timestamp with timezone of when the record was last updated', null=True
            ),
        ),
        migrations.AlterField(
            model_name='reportunit',
            name='updated_by',
            field=models.ForeignKey(
                blank=True,
                db_comment='ID of the user who last updated the record. Foreign key to erc.user',
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='%(class)s_updated',
                to='registration.user',
            ),
        ),
        migrations.AlterField(
            model_name='reportverification',
            name='archived_at',
            field=models.DateTimeField(
                blank=True,
                db_comment='Timestamp with timezone of when the record was archived (soft-deleted). Null if the record is active',
                null=True,
            ),
        ),
        migrations.AlterField(
            model_name='reportverification',
            name='archived_by',
            field=models.ForeignKey(
                blank=True,
                db_comment='ID of the user who archived (soft-deleted) the record. Null if the record is active. Foreign key to erc.user',
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='%(class)s_archived',
                to='registration.user',
            ),
        ),
        migrations.AlterField(
            model_name='reportverification',
            name='created_at',
            field=models.DateTimeField(
                blank=True, db_comment='Timestamp with timezone of when the record was created', null=True
            ),
        ),
        migrations.AlterField(
            model_name='reportverification',
            name='created_by',
            field=models.ForeignKey(
                blank=True,
                db_comment='ID of the user who created the record. Foreign key to erc.user',
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='%(class)s_created',
                to='registration.user',
            ),
        ),
        migrations.AlterField(
            model_name='reportverification',
            name='updated_at',
            field=models.DateTimeField(
                blank=True, db_comment='Timestamp with timezone of when the record was last updated', null=True
            ),
        ),
        migrations.AlterField(
            model_name='reportverification',
            name='updated_by',
            field=models.ForeignKey(
                blank=True,
                db_comment='ID of the user who last updated the record. Foreign key to erc.user',
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='%(class)s_updated',
                to='registration.user',
            ),
        ),
        migrations.AlterField(
            model_name='reportverificationvisit',
            name='archived_at',
            field=models.DateTimeField(
                blank=True,
                db_comment='Timestamp with timezone of when the record was archived (soft-deleted). Null if the record is active',
                null=True,
            ),
        ),
        migrations.AlterField(
            model_name='reportverificationvisit',
            name='archived_by',
            field=models.ForeignKey(
                blank=True,
                db_comment='ID of the user who archived (soft-deleted) the record. Null if the record is active. Foreign key to erc.user',
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='%(class)s_archived',
                to='registration.user',
            ),
        ),
        migrations.AlterField(
            model_name='reportverificationvisit',
            name='created_at',
            field=models.DateTimeField(
                blank=True, db_comment='Timestamp with timezone of when the record was created', null=True
            ),
        ),
        migrations.AlterField(
            model_name='reportverificationvisit',
            name='created_by',
            field=models.ForeignKey(
                blank=True,
                db_comment='ID of the user who created the record. Foreign key to erc.user',
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='%(class)s_created',
                to='registration.user',
            ),
        ),
        migrations.AlterField(
            model_name='reportverificationvisit',
            name='updated_at',
            field=models.DateTimeField(
                blank=True, db_comment='Timestamp with timezone of when the record was last updated', null=True
            ),
        ),
        migrations.AlterField(
            model_name='reportverificationvisit',
            name='updated_by',
            field=models.ForeignKey(
                blank=True,
                db_comment='ID of the user who last updated the record. Foreign key to erc.user',
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='%(class)s_updated',
                to='registration.user',
            ),
        ),
        migrations.AlterField(
            model_name='reportversion',
            name='archived_at',
            field=models.DateTimeField(
                blank=True,
                db_comment='Timestamp with timezone of when the record was archived (soft-deleted). Null if the record is active',
                null=True,
            ),
        ),
        migrations.AlterField(
            model_name='reportversion',
            name='archived_by',
            field=models.ForeignKey(
                blank=True,
                db_comment='ID of the user who archived (soft-deleted) the record. Null if the record is active. Foreign key to erc.user',
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='%(class)s_archived',
                to='registration.user',
            ),
        ),
        migrations.AlterField(
            model_name='reportversion',
            name='created_at',
            field=models.DateTimeField(
                blank=True, db_comment='Timestamp with timezone of when the record was created', null=True
            ),
        ),
        migrations.AlterField(
            model_name='reportversion',
            name='created_by',
            field=models.ForeignKey(
                blank=True,
                db_comment='ID of the user who created the record. Foreign key to erc.user',
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='%(class)s_created',
                to='registration.user',
            ),
        ),
        migrations.AlterField(
            model_name='reportversion',
            name='updated_at',
            field=models.DateTimeField(
                blank=True, db_comment='Timestamp with timezone of when the record was last updated', null=True
            ),
        ),
        migrations.AlterField(
            model_name='reportversion',
            name='updated_by',
            field=models.ForeignKey(
                blank=True,
                db_comment='ID of the user who last updated the record. Foreign key to erc.user',
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='%(class)s_updated',
                to='registration.user',
            ),
        ),
        migrations.RunPython(
            code=remove_2023_ry,
            reverse_code=revert_2023_ry,
        ),
        migrations.AlterField(
            model_name='activityjsonschema',
            name='activity',
            field=models.ForeignKey(
                db_comment='The identifier for the activity type the schema is referencing. Foreign key to the erc.activity table',
                on_delete=django.db.models.deletion.DO_NOTHING,
                related_name='+',
                to='registration.activity',
            ),
        ),
        migrations.AlterField(
            model_name='activityjsonschema',
            name='valid_from',
            field=models.ForeignKey(
                db_comment='The configuration record that defines the start of the valid period for the corresponding reporting year. Foreign key to the erc.configuration table',
                on_delete=django.db.models.deletion.DO_NOTHING,
                related_name='+',
                to='reporting.configuration',
            ),
        ),
        migrations.AlterField(
            model_name='activityjsonschema',
            name='valid_to',
            field=models.ForeignKey(
                db_comment='The configuration record that defines the end of the valid period for the corresponding reporting year. Foreign key to the erc.configuration table',
                on_delete=django.db.models.deletion.DO_NOTHING,
                related_name='+',
                to='reporting.configuration',
            ),
        ),
        migrations.AlterField(
            model_name='activitysourcetypejsonschema',
            name='activity',
            field=models.ForeignKey(
                db_comment='The identifier for the activity type the schema is referencing. Foreign key to the erc.activity table',
                on_delete=django.db.models.deletion.DO_NOTHING,
                related_name='+',
                to='registration.activity',
            ),
        ),
        migrations.AlterField(
            model_name='activitysourcetypejsonschema',
            name='json_schema',
            field=models.JSONField(
                db_comment="The json schema for a specific activity-source type pair. This defines the shape of the data collected for the source type. Each table with the prefix report_* and json_data captures a related subsection of this schema. Refer to the Greenhouse Gas Emission Reporting Regulation(https://www.bclaws.gov.bc.ca/civix/document/id/lc/statreg/249_2015#section14) Schedule A, Tables 1&2 for the emission's relationships & reporting requirements."
            ),
        ),
        migrations.AlterField(
            model_name='activitysourcetypejsonschema',
            name='source_type',
            field=models.ForeignKey(
                db_comment='The identifier for the source type the schema is referencing. Foreign key to the erc.source_type table',
                on_delete=django.db.models.deletion.DO_NOTHING,
                related_name='+',
                to='reporting.sourcetype',
            ),
        ),
        migrations.AlterField(
            model_name='activitysourcetypejsonschema',
            name='valid_from',
            field=models.ForeignKey(
                db_comment='The configuration record that defines the start of the valid period for the corresponding reporting year. Foreign key to the erc.configuration table',
                on_delete=django.db.models.deletion.DO_NOTHING,
                related_name='+',
                to='reporting.configuration',
            ),
        ),
        migrations.AlterField(
            model_name='activitysourcetypejsonschema',
            name='valid_to',
            field=models.ForeignKey(
                db_comment='The configuration record that defines the end of the valid period for the corresponding reporting year. Foreign key to the erc.configuration table',
                on_delete=django.db.models.deletion.DO_NOTHING,
                related_name='+',
                to='reporting.configuration',
            ),
        ),
        migrations.AlterField(
            model_name='configuration',
            name='slug',
            field=models.CharField(
                db_comment='Unique identifier for a configuration, based on reporting year',
                max_length=1000,
                unique=True,
            ),
        ),
        migrations.AlterField(
            model_name='configurationelement',
            name='activity',
            field=models.ForeignKey(
                db_comment='Activity defining this configuration element. It may have more than one source type. Foreign key to erc.activity table',
                on_delete=django.db.models.deletion.DO_NOTHING,
                related_name='configuration_elements',
                to='registration.activity',
            ),
        ),
        migrations.AlterField(
            model_name='configurationelement',
            name='custom_methodology_schema',
            field=models.ForeignKey(
                blank=True,
                db_comment='Custom methodology schema included if additional custom reporting fields are needed. Foreign key to erc.custom_methodology_schema table',
                null=True,
                on_delete=django.db.models.deletion.DO_NOTHING,
                related_name='configuration_elements',
                to='reporting.custommethodologyschema',
            ),
        ),
        migrations.AlterField(
            model_name='configurationelement',
            name='gas_type',
            field=models.ForeignKey(
                db_comment='Gas type the source type reports in this configuration. Likely has multiple methodologies. Foreign key to erc.gas_type table',
                on_delete=django.db.models.deletion.DO_NOTHING,
                related_name='configuration_elements',
                to='reporting.gastype',
            ),
        ),
        migrations.AlterField(
            model_name='configurationelement',
            name='methodology',
            field=models.ForeignKey(
                db_comment='Methodology the gas type reports in this configuration. Foreign key to erc.methodology table',
                on_delete=django.db.models.deletion.DO_NOTHING,
                related_name='configuration_elements',
                to='reporting.methodology',
            ),
        ),
        migrations.AlterField(
            model_name='configurationelement',
            name='source_type',
            field=models.ForeignKey(
                db_comment='Source type the activity reports in this configuration. Likely has multiple gas types. Foreign key to erc.source_type table',
                on_delete=django.db.models.deletion.DO_NOTHING,
                related_name='configuration_elements',
                to='reporting.sourcetype',
            ),
        ),
        migrations.AlterField(
            model_name='configurationelement',
            name='valid_from',
            field=models.ForeignKey(
                db_comment='Start of the validity period for this configuration, according to reporting year. Foreign key to erc.configuration table',
                on_delete=django.db.models.deletion.DO_NOTHING,
                related_name='+',
                to='reporting.configuration',
            ),
        ),
        migrations.AlterField(
            model_name='configurationelement',
            name='valid_to',
            field=models.ForeignKey(
                db_comment='End of the validity period for this configuration, according to reporting year. Foreign key to erc.configuration table',
                on_delete=django.db.models.deletion.DO_NOTHING,
                related_name='+',
                to='reporting.configuration',
            ),
        ),
        migrations.AlterField(
            model_name='custommethodologyschema',
            name='activity',
            field=models.ForeignKey(
                db_comment='Activity needing this custom methodology schema. It may have more than one source type. Foreign key to erc.activity table',
                on_delete=django.db.models.deletion.DO_NOTHING,
                related_name='+',
                to='registration.activity',
            ),
        ),
        migrations.AlterField(
            model_name='custommethodologyschema',
            name='gas_type',
            field=models.ForeignKey(
                db_comment='Gas type the source type reports in this schema. Likely has multiple methodologies. Foreign key to erc.gas_type table',
                on_delete=django.db.models.deletion.DO_NOTHING,
                related_name='+',
                to='reporting.gastype',
            ),
        ),
        migrations.AlterField(
            model_name='custommethodologyschema',
            name='json_schema',
            field=models.JSONField(db_comment='JSON schema defining the custom fields for this methodology'),
        ),
        migrations.AlterField(
            model_name='custommethodologyschema',
            name='methodology',
            field=models.ForeignKey(
                db_comment='Methodology the gas type reports in this schema. Foreign key to erc.methodology table',
                on_delete=django.db.models.deletion.DO_NOTHING,
                related_name='+',
                to='reporting.methodology',
            ),
        ),
        migrations.AlterField(
            model_name='custommethodologyschema',
            name='source_type',
            field=models.ForeignKey(
                db_comment='Source type the activity reports in this schema. Likely has multiple gas types. Foreign key to erc.source_type table',
                on_delete=django.db.models.deletion.DO_NOTHING,
                related_name='+',
                to='reporting.sourcetype',
            ),
        ),
        migrations.AlterField(
            model_name='custommethodologyschema',
            name='valid_from',
            field=models.ForeignKey(
                db_comment='Start of the validity period for this schema, according to reporting year. Foreign key to erc.configuration table',
                on_delete=django.db.models.deletion.DO_NOTHING,
                related_name='+',
                to='reporting.configuration',
            ),
        ),
        migrations.AlterField(
            model_name='custommethodologyschema',
            name='valid_to',
            field=models.ForeignKey(
                db_comment='End of the validity period for this schema, according to reporting year. Foreign key to erc.configuration table',
                on_delete=django.db.models.deletion.DO_NOTHING,
                related_name='+',
                to='reporting.configuration',
            ),
        ),
        migrations.AlterField(
            model_name='emissioncategory',
            name='category_name',
            field=models.CharField(
                db_comment='The name of the emission category as defined in the Greenhouse Gas Emission Reporting Regulation',
                max_length=1000,
            ),
        ),
        migrations.AlterField(
            model_name='emissioncategorymapping',
            name='activity',
            field=models.ForeignKey(
                db_comment='Activity that this emission is reported under. Foreign key to erc.activity table',
                on_delete=django.db.models.deletion.DO_NOTHING,
                related_name='emission_category_mappings',
                to='registration.activity',
            ),
        ),
        migrations.AlterField(
            model_name='emissioncategorymapping',
            name='emission_category',
            field=models.ForeignKey(
                db_comment='Emission category that defines a reported emission as defined in the Greenhouse Gas Reporting Regulation Schedule A. Foreign key to erc.emission_category table',
                on_delete=django.db.models.deletion.DO_NOTHING,
                related_name='emission_category_mappings',
                to='reporting.emissioncategory',
            ),
        ),
        migrations.AlterField(
            model_name='emissioncategorymapping',
            name='source_type',
            field=models.ForeignKey(
                db_comment='Source type that this emission is reported under. Foreign key to erc.source_type table',
                on_delete=django.db.models.deletion.DO_NOTHING,
                related_name='emission_category_mappings',
                to='reporting.sourcetype',
            ),
        ),
        migrations.AlterField(
            model_name='expectedvaluerangefuelamount',
            name='fuel_type',
            field=models.ForeignKey(
                db_comment='The fuel type record that this value range applies to for the fuel_amount value. Foreign key to erc.fuel_type table',
                on_delete=django.db.models.deletion.CASCADE,
                related_name='expected_value_range_fuel_amount',
                to='reporting.fueltype',
            ),
        ),
        migrations.AlterField(
            model_name='expectedvaluerangemethodologyfield',
            name='fuel_type',
            field=models.ForeignKey(
                db_comment='The fuel_type record that this value range applies to for the methodology field value. Foreign key to erc.fuel_type table',
                on_delete=django.db.models.deletion.CASCADE,
                related_name='expected_value_range_methodology_field',
                to='reporting.fueltype',
            ),
        ),
        migrations.AlterField(
            model_name='expectedvaluerangemethodologyfield',
            name='methodology',
            field=models.ForeignKey(
                db_comment='The methodology record that this value range applies to for the methodology field value. Foreign key to erc.methodology table',
                on_delete=django.db.models.deletion.CASCADE,
                related_name='expected_value_range_methodology_field',
                to='reporting.methodology',
            ),
        ),
        migrations.AlterField(
            model_name='expectedvaluerangemethodologyfield',
            name='reporting_field',
            field=models.ForeignKey(
                db_comment='The reporting_field record that this value range applies to for the methodology field value. Foreign key to erc.reporting_field table',
                on_delete=django.db.models.deletion.CASCADE,
                related_name='expected_value_range_methodology_field',
                to='reporting.reportingfield',
            ),
        ),
        migrations.AlterField(
            model_name='facilityreport',
            name='facility',
            field=models.ForeignKey(
                db_comment='The facility record this report was created for, at the time the report was filled out. Foreign key to the erc.facility table',
                on_delete=django.db.models.deletion.DO_NOTHING,
                related_name='facility_reports',
                to='registration.facility',
            ),
        ),
        migrations.AlterField(
            model_name='facilityreport',
            name='facility_bcghgid',
            field=models.CharField(
                blank=True,
                db_comment='The BC Green House Gas ID of the facility as reported',
                max_length=1000,
                null=True,
            ),
        ),
        migrations.AlterField(
            model_name='facilityreport',
            name='report_version',
            field=models.ForeignKey(
                db_comment='The report_version record this facility report information is related to. Foreign key to the erc.report_version table',
                on_delete=django.db.models.deletion.CASCADE,
                related_name='facility_reports',
                to='reporting.reportversion',
            ),
        ),
        migrations.AlterField(
            model_name='gastype',
            name='chemical_formula',
            field=models.CharField(
                db_comment='The chemical formula representation of a greenhouse gas type (example: CO2)', max_length=100
            ),
        ),
        migrations.AlterField(
            model_name='naicsregulatoryoverride',
            name='naics_code',
            field=models.ForeignKey(
                db_comment='The naics_code record that is associated with the regulatory value override in this record. Foreign key to erc.naics_code table',
                on_delete=django.db.models.deletion.PROTECT,
                related_name='regulatory_values_overrides',
                to='registration.naicscode',
            ),
        ),
        migrations.AlterField(
            model_name='naicsregulatoryoverride',
            name='regulated_product',
            field=models.ForeignKey(
                db_comment='The regulated_product record associated with the regulatory values override in this record. Foreign key to erc.regulated_product table',
                on_delete=django.db.models.deletion.PROTECT,
                related_name='regulatory_values_overrides',
                to='registration.regulatedproduct',
            ),
        ),
        migrations.AlterField(
            model_name='naicsregulatoryvalue',
            name='naics_code',
            field=models.ForeignKey(
                db_comment='The naics_code record that is associated with the regulatory values in this record. Foreign key to erc.naics_code table',
                on_delete=django.db.models.deletion.DO_NOTHING,
                related_name='regulatory_values',
                to='registration.naicscode',
            ),
        ),
        migrations.AlterField(
            model_name='productemissionintensity',
            name='product',
            field=models.ForeignKey(
                db_comment='The product record that the emission intensity values in this record relate to. Foreign key to erc.regulated_product table',
                on_delete=django.db.models.deletion.DO_NOTHING,
                related_name='%(class)s',
                to='registration.regulatedproduct',
            ),
        ),
        migrations.AlterField(
            model_name='productemissionintensity',
            name='product_weighted_average_emission_intensity',
            field=models.DecimalField(
                db_comment='The published B.C. production weighted average emission intensity (PWAEI) for that product found in Schedule A.1 of the GGERR. https://www.bclaws.gov.bc.ca/civix/document/id/lc/statreg/249_2015#ScheduleA',
                decimal_places=4,
                max_digits=10,
            ),
        ),
        migrations.AlterField(
            model_name='report',
            name='operation',
            field=models.ForeignKey(
                db_comment='The operation for which this report was filed. Foreign key to the erc.operation table',
                on_delete=django.db.models.deletion.PROTECT,
                to='registration.operation',
            ),
        ),
        migrations.AlterField(
            model_name='report',
            name='operator',
            field=models.ForeignKey(
                db_comment='The operator to which this report belongs. Foreign key to the erc.operator table',
                on_delete=django.db.models.deletion.PROTECT,
                to='registration.operator',
            ),
        ),
        migrations.AlterField(
            model_name='report',
            name='reporting_year',
            field=models.ForeignKey(
                db_comment='The reporting year, for which this report is filled. Foreign key to the erc.reporting_year table',
                on_delete=django.db.models.deletion.PROTECT,
                to='reporting.reportingyear',
            ),
        ),
        migrations.AlterField(
            model_name='reportactivity',
            name='activity',
            field=models.ForeignKey(
                db_comment='The reporting activity this data applies to. Foreign key to the erc.activity table',
                on_delete=django.db.models.deletion.PROTECT,
                related_name='%(class)s_records',
                to='registration.activity',
            ),
        ),
        migrations.AlterField(
            model_name='reportactivity',
            name='activity_base_schema',
            field=models.ForeignKey(
                db_comment='The activity base schema used to render the form that collected this data. Foreign key to the erc.activity_json_schema table',
                on_delete=django.db.models.deletion.PROTECT,
                related_name='%(class)s_records',
                to='reporting.activityjsonschema',
            ),
        ),
        migrations.AlterField(
            model_name='reportactivity',
            name='facility_report',
            field=models.ForeignKey(
                db_comment='The facility report this activity data belongs to. Foreign key to the erc.facility_report table',
                on_delete=django.db.models.deletion.CASCADE,
                related_name='%(class)s_records',
                to='reporting.facilityreport',
            ),
        ),
        migrations.AlterField(
            model_name='reportactivity',
            name='json_data',
            field=models.JSONField(
                blank=True,
                db_comment="A flat JSON object representing the data collected for this model from the different sections of the schema defined in the erc.activity_source_type_json_schema table. Refer to the Greenhouse Gas Emission Reporting Regulation(https://www.bclaws.gov.bc.ca/civix/document/id/lc/statreg/249_2015#section14) Schedule A, Tables 1&2 for the emission's relationships & reporting requirements.",
            ),
        ),
        migrations.AlterField(
            model_name='reportactivity',
            name='report_version',
            field=models.ForeignKey(
                db_comment='The report version this data belongs to. Foreign key to the erc.report_version table',
                on_delete=django.db.models.deletion.CASCADE,
                related_name='%(class)s_records',
                to='reporting.reportversion',
            ),
        ),
        migrations.AlterField(
            model_name='reportadditionaldata',
            name='electricity_generated',
            field=models.IntegerField(
                blank=True, db_comment='Electricity generated, measured in gigawatt hours (GWh)', null=True
            ),
        ),
        migrations.AlterField(
            model_name='reportadditionaldata',
            name='emissions_off_site_transfer',
            field=models.IntegerField(
                blank=True, db_comment='Emissions captured for off-site transfer, measured in tonnes (t)', null=True
            ),
        ),
        migrations.AlterField(
            model_name='reportadditionaldata',
            name='emissions_on_site_sequestration',
            field=models.IntegerField(
                blank=True, db_comment='Emissions captured for on-site sequestration, measured in tonnes (t)', null=True
            ),
        ),
        migrations.AlterField(
            model_name='reportadditionaldata',
            name='emissions_on_site_use',
            field=models.IntegerField(
                blank=True, db_comment='Emissions captured for on-site use, measured in tonnes (t)', null=True
            ),
        ),
        migrations.AlterField(
            model_name='reportadditionaldata',
            name='report_version',
            field=models.OneToOneField(
                db_comment='The report version this report additional data applies to. Foreign key to the erc.report_version table',
                on_delete=django.db.models.deletion.CASCADE,
                related_name='report_additional_data',
                to='reporting.reportversion',
            ),
        ),
        migrations.AlterField(
            model_name='reportattachment',
            name='attachment',
            field=models.FileField(
                db_comment='A file containing supplementary report information uploaded as an attachment to a report',
                max_length=1000,
                upload_to='report_attachments/%Y/',
            ),
        ),
        migrations.AlterField(
            model_name='reportattachment',
            name='attachment_name',
            field=models.CharField(
                db_comment='The name of the original file that was uploaded, since django (our backend python framework) adds a hash to avoid file name collisions',
                max_length=1000,
            ),
        ),
        migrations.AlterField(
            model_name='reportattachment',
            name='attachment_type',
            field=models.CharField(
                choices=[
                    ('verification_statement', 'Verification Statement'),
                    ('wci_352_362', 'Wci 352 362'),
                    ('additional_reportable_information', 'Additional Reportable Information'),
                    ('confidentiality_request', 'Confidentiality Request'),
                ],
                db_comment='The type of attachment this record represents (verification statement, WCI 352/362, additional reportable information, confidentiality request)',
                max_length=1000,
            ),
        ),
        migrations.AlterField(
            model_name='reportattachment',
            name='report_version',
            field=models.ForeignKey(
                db_comment='The report version this attachment belongs to. Foreign key to the erc.report_version table',
                on_delete=django.db.models.deletion.CASCADE,
                related_name='report_attachments',
                to='reporting.reportversion',
            ),
        ),
        migrations.AlterField(
            model_name='reportattachmentconfirmation',
            name='report_version',
            field=models.ForeignKey(
                db_comment='The supplementary report this attachment confirmation information relates to. Foreign key to the erc.report_version table',
                on_delete=django.db.models.deletion.CASCADE,
                related_name='report_attachment_confirmation',
                to='reporting.reportversion',
            ),
        ),
        migrations.AlterField(
            model_name='reportcompliancesummary',
            name='report_version',
            field=models.ForeignKey(
                db_comment='The version of the report this compliance summary data relates to. Foreign key to the erc.report_version table',
                on_delete=django.db.models.deletion.CASCADE,
                related_name='report_compliance_summary',
                to='reporting.reportversion',
            ),
        ),
        migrations.AlterField(
            model_name='reportcompliancesummaryproduct',
            name='emission_intensity',
            field=models.DecimalField(
                db_comment='The published B.C. production weighted average emission intensity (PWAEI) for that product found in Schedule A.1 of the GGERR. https://www.bclaws.gov.bc.ca/civix/document/id/lc/statreg/249_2015#ScheduleA',
                decimal_places=4,
                max_digits=10,
            ),
        ),
        migrations.AlterField(
            model_name='reportcompliancesummaryproduct',
            name='product',
            field=models.ForeignKey(
                db_comment='The id of the regulated_product record this product data is for. Foreign key to the erc.regulated_product table',
                on_delete=django.db.models.deletion.CASCADE,
                related_name='+',
                to='registration.regulatedproduct',
            ),
        ),
        migrations.AlterField(
            model_name='reportcompliancesummaryproduct',
            name='report_compliance_summary',
            field=models.ForeignKey(
                db_comment='The report_compliance_summary parent object this product data relates to. Foreign key to the erc.report_compliance_summary table',
                on_delete=django.db.models.deletion.CASCADE,
                related_name='report_compliance_summary_products',
                to='reporting.reportcompliancesummary',
            ),
        ),
        migrations.AlterField(
            model_name='reportcompliancesummaryproduct',
            name='report_version',
            field=models.ForeignKey(
                db_comment='The version of the report this compliance summary data relates to. Foreign key to the erc.report_version table',
                on_delete=django.db.models.deletion.CASCADE,
                related_name='report_compliance_summary_products',
                to='reporting.reportversion',
            ),
        ),
        migrations.AlterField(
            model_name='reportelectricityimportdata',
            name='report_version',
            field=models.ForeignKey(
                db_comment='The associated report version for this electricity import data. Foreign key to the erc.report_version table',
                on_delete=django.db.models.deletion.CASCADE,
                related_name='report_electricity_import_data',
                to='reporting.reportversion',
            ),
        ),
        migrations.AlterField(
            model_name='reportemission',
            name='gas_type',
            field=models.ForeignKey(
                db_comment='The gas type this emission data applies to. Foreign key to the erc.gas_type table',
                on_delete=django.db.models.deletion.PROTECT,
                related_name='%(class)s_records',
                to='reporting.gastype',
            ),
        ),
        migrations.AlterField(
            model_name='reportemission',
            name='json_data',
            field=models.JSONField(
                blank=True,
                db_comment="A flat JSON object representing the data collected for this model from the different sections of the schema defined in the erc.activity_source_type_json_schema table. Refer to the Greenhouse Gas Emission Reporting Regulation(https://www.bclaws.gov.bc.ca/civix/document/id/lc/statreg/249_2015#section14) Schedule A, Tables 1&2 for the emission's relationships & reporting requirements.",
            ),
        ),
        migrations.AlterField(
            model_name='reportemission',
            name='report_fuel',
            field=models.ForeignKey(
                blank=True,
                db_comment='The fuel data this emission data belongs to, if applicable. Foreign key to the erc.report_fuel table',
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name='%(class)s_records',
                to='reporting.reportfuel',
            ),
        ),
        migrations.AlterField(
            model_name='reportemission',
            name='report_source_type',
            field=models.ForeignKey(
                db_comment='The source type data this emission data belongs to. Foreign key to the erc.report_source_type table',
                on_delete=django.db.models.deletion.CASCADE,
                related_name='%(class)s_records',
                to='reporting.reportsourcetype',
            ),
        ),
        migrations.AlterField(
            model_name='reportemission',
            name='report_unit',
            field=models.ForeignKey(
                blank=True,
                db_comment='The unit/source sub-type this emission data belongs to, if applicable. Foreign key to the erc.report_unit table',
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name='%(class)s_records',
                to='reporting.reportunit',
            ),
        ),
        migrations.AlterField(
            model_name='reportemission',
            name='report_version',
            field=models.ForeignKey(
                db_comment='The report version this data belongs to. Foreign key to the erc.report_version table',
                on_delete=django.db.models.deletion.CASCADE,
                related_name='%(class)s_records',
                to='reporting.reportversion',
            ),
        ),
        migrations.AlterField(
            model_name='reportemissionallocation',
            name='allocation_methodology',
            field=models.CharField(
                choices=[
                    ('OBPS Allocation Calculator', 'Calculator'),
                    ('Other', 'Other'),
                    ('Not Applicable', 'Not Applicable'),
                ],
                db_comment='The methodology used to calculate the allocated emissions. Defaulted to not applicable which is only available for LFOs',
                default='Not Applicable',
                max_length=255,
            ),
        ),
        migrations.AlterField(
            model_name='reportemissionallocation',
            name='facility_report',
            field=models.ForeignKey(
                db_comment='The facility report this data belongs to. Foreign key to the erc.facility_report table',
                on_delete=django.db.models.deletion.CASCADE,
                related_name='%(class)s_records',
                to='reporting.facilityreport',
            ),
        ),
        migrations.AlterField(
            model_name='reportemissionallocation',
            name='report_version',
            field=models.ForeignKey(
                db_comment='The report version this data is associated with. Foreign key to the erc.report_version table',
                on_delete=django.db.models.deletion.CASCADE,
                related_name='%(class)s_records',
                to='reporting.reportversion',
            ),
        ),
        migrations.AlterField(
            model_name='reportfuel',
            name='fuel_type',
            field=models.ForeignKey(
                db_comment='The fuel type this data applies to. Foreign key to the erc.fuel_type table',
                on_delete=django.db.models.deletion.PROTECT,
                related_name='%(class)s_records',
                to='reporting.fueltype',
            ),
        ),
        migrations.AlterField(
            model_name='reportfuel',
            name='json_data',
            field=models.JSONField(
                blank=True,
                db_comment="A flat JSON object representing the data collected for this model from the different sections of the schema defined in the erc.activity_source_type_json_schema table. Refer to the Greenhouse Gas Emission Reporting Regulation(https://www.bclaws.gov.bc.ca/civix/document/id/lc/statreg/249_2015#section14) Schedule A, Tables 1&2 for the emission's relationships & reporting requirements.",
            ),
        ),
        migrations.AlterField(
            model_name='reportfuel',
            name='report_source_type',
            field=models.ForeignKey(
                db_comment='The source type data this unit data belongs to. Foreign key to the erc.report_source_type table',
                on_delete=django.db.models.deletion.CASCADE,
                related_name='%(class)s_records',
                to='reporting.reportsourcetype',
            ),
        ),
        migrations.AlterField(
            model_name='reportfuel',
            name='report_unit',
            field=models.ForeignKey(
                blank=True,
                db_comment='The unit form data this fuel data belongs to, if applicable. Foreign key to the erc.report_unit table',
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name='%(class)s_records',
                to='reporting.reportunit',
            ),
        ),
        migrations.AlterField(
            model_name='reportfuel',
            name='report_version',
            field=models.ForeignKey(
                db_comment='The report version this data belongs to. Foreign key to the erc.report_version table',
                on_delete=django.db.models.deletion.CASCADE,
                related_name='%(class)s_records',
                to='reporting.reportversion',
            ),
        ),
        migrations.AlterField(
            model_name='reportmethodology',
            name='json_data',
            field=models.JSONField(
                blank=True,
                db_comment="A flat JSON object representing the data collected for this model from the different sections of the schema defined in the erc.activity_source_type_json_schema table. Refer to the Greenhouse Gas Emission Reporting Regulation(https://www.bclaws.gov.bc.ca/civix/document/id/lc/statreg/249_2015#section14) Schedule A, Tables 1&2 for the emission's relationships & reporting requirements.",
            ),
        ),
        migrations.AlterField(
            model_name='reportmethodology',
            name='methodology',
            field=models.ForeignKey(
                db_comment='The methodology this data applies to. Foreign key to the erc.methodology table',
                on_delete=django.db.models.deletion.PROTECT,
                related_name='%(class)s_records',
                to='reporting.methodology',
            ),
        ),
        migrations.AlterField(
            model_name='reportmethodology',
            name='report_emission',
            field=models.OneToOneField(
                db_comment='The emission data this methodology applies to. Foreign key to the erc.report_emission table',
                on_delete=django.db.models.deletion.CASCADE,
                related_name='report_methodology',
                to='reporting.reportemission',
            ),
        ),
        migrations.AlterField(
            model_name='reportmethodology',
            name='report_version',
            field=models.ForeignKey(
                db_comment='The report version this data belongs to. Foreign key to the erc.report_version table',
                on_delete=django.db.models.deletion.CASCADE,
                related_name='%(class)s_records',
                to='reporting.reportversion',
            ),
        ),
        migrations.AlterField(
            model_name='reportnewentrant',
            name='report_version',
            field=models.ForeignKey(
                db_comment='The associated report version for this new entrant record. Foreign key to the erc.report_version table',
                on_delete=django.db.models.deletion.CASCADE,
                related_name='report_new_entrant',
                to='reporting.reportversion',
            ),
        ),
        migrations.AlterField(
            model_name='reportnewentrantemission',
            name='emission_category',
            field=models.ForeignKey(
                db_comment='The emission category record this emission belongs to as defined in Schedule A of the Greenhouse Gas Reporing Regulation. Foreign key to the erc.emission_category table',
                on_delete=django.db.models.deletion.PROTECT,
                related_name='report_new_entrant_emission',
                to='reporting.emissioncategory',
            ),
        ),
        migrations.AlterField(
            model_name='reportnewentrantemission',
            name='report_new_entrant',
            field=models.ForeignKey(
                db_comment='The new entrant report to which this production record belongs to. Foreign key to the erc.report_new_entrant table',
                on_delete=django.db.models.deletion.CASCADE,
                related_name='report_new_entrant_emission',
                to='reporting.reportnewentrant',
            ),
        ),
        migrations.AlterField(
            model_name='reportnewentrantemission',
            name='report_version',
            field=models.ForeignKey(
                db_comment='The report version this new entrant emission record belongs to. Foreign key to the erc.report_version table',
                on_delete=django.db.models.deletion.CASCADE,
                related_name='report_new_entrant_emissions',
                to='reporting.reportversion',
            ),
        ),
        migrations.AlterField(
            model_name='reportnewentrantproduction',
            name='product',
            field=models.ForeignKey(
                db_comment='The regulated product associated with this production record. Foreign key to the erc.regulated_product table',
                on_delete=django.db.models.deletion.PROTECT,
                related_name='new_entrant_productions',
                to='registration.regulatedproduct',
            ),
        ),
        migrations.AlterField(
            model_name='reportnewentrantproduction',
            name='report_new_entrant',
            field=models.ForeignKey(
                db_comment='The new entrant report to which this production record belongs. Foreign key to the erc.report_new_entrant table',
                on_delete=django.db.models.deletion.CASCADE,
                related_name='productions',
                to='reporting.reportnewentrant',
            ),
        ),
        migrations.AlterField(
            model_name='reportnewentrantproduction',
            name='report_version',
            field=models.ForeignKey(
                db_comment='The report version this new entrant production record belongs to. Foreign key to the erc.report_version table',
                on_delete=django.db.models.deletion.CASCADE,
                related_name='report_new_entrant_productions',
                to='reporting.reportversion',
            ),
        ),
        migrations.AlterField(
            model_name='reportnonattributableemissions',
            name='emission_category',
            field=models.ForeignKey(
                db_comment='The emission category associated with this emission. Foreign key to the erc.emission_category table',
                on_delete=django.db.models.deletion.PROTECT,
                related_name='report_non_attributable_emissions',
                to='reporting.emissioncategory',
            ),
        ),
        migrations.AlterField(
            model_name='reportnonattributableemissions',
            name='facility_report',
            field=models.ForeignKey(
                db_comment='The facility report this activity data belongs to. Foreign key to the erc.facility_report table',
                on_delete=django.db.models.deletion.CASCADE,
                related_name='%(class)s_records',
                to='reporting.facilityreport',
            ),
        ),
        migrations.AlterField(
            model_name='reportnonattributableemissions',
            name='report_version',
            field=models.ForeignKey(
                db_comment='The report version this operation information relates to. Foreign key to the erc.report_version table',
                on_delete=django.db.models.deletion.CASCADE,
                related_name='report_non_attributable_emissions',
                to='reporting.reportversion',
            ),
        ),
        migrations.AlterField(
            model_name='reportoperation',
            name='naics_code',
            field=models.ForeignKey(
                blank=True,
                db_comment='The North American Industry Classification System (NAICS) code of the operation at the time the report was created. Foreign key to the erc.naics_code table',
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='+',
                to='registration.naicscode',
            ),
        ),
        migrations.AlterField(
            model_name='reportoperation',
            name='operation_bcghgid',
            field=models.CharField(
                blank=True, db_comment='The BC Greenhouse Gas ID of the operation', max_length=1000, null=True
            ),
        ),
        migrations.AlterField(
            model_name='reportoperation',
            name='operation_type',
            field=models.CharField(
                db_comment='The type of the operation, LFO or SFO (Linear Facilities Operation or Single Facility Operation)',
                max_length=1000,
            ),
        ),
        migrations.AlterField(
            model_name='reportoperation',
            name='report_version',
            field=models.OneToOneField(
                db_comment='The report this operation information relates to. Foreign key to the erc.report_version table',
                on_delete=django.db.models.deletion.CASCADE,
                related_name='report_operation',
                to='reporting.reportversion',
            ),
        ),
        migrations.AlterField(
            model_name='reportoperationrepresentative',
            name='report_version',
            field=models.ForeignKey(
                db_comment='The report version associated with this operation representative. Foreign key to the erc.report_version table',
                on_delete=django.db.models.deletion.CASCADE,
                related_name='report_operation_representatives',
                to='reporting.reportversion',
            ),
        ),
        migrations.AlterField(
            model_name='reportpersonresponsible',
            name='contact',
            field=models.ForeignKey(
                blank=True,
                db_comment='The source contact selected for this person responsible. Foreign key to the registration.contact table',
                null=True,
                on_delete=django.db.models.deletion.DO_NOTHING,
                related_name='report_person_responsibles',
                to='registration.contact',
            ),
        ),
        migrations.AlterField(
            model_name='reportpersonresponsible',
            name='report_version',
            field=models.OneToOneField(
                db_comment='The report version this person responsible applies to. Foreign key to the erc.report_version table',
                on_delete=django.db.models.deletion.CASCADE,
                related_name='report_person_responsible',
                to='reporting.reportversion',
            ),
        ),
        migrations.AlterField(
            model_name='reportproduct',
            name='facility_report',
            field=models.ForeignKey(
                db_comment='The facility report this production information belongs to. Foreign key to the erc.facility_report table',
                on_delete=django.db.models.deletion.CASCADE,
                related_name='report_products',
                to='reporting.facilityreport',
            ),
        ),
        migrations.AlterField(
            model_name='reportproduct',
            name='product',
            field=models.ForeignKey(
                db_comment='The product this production information is about. Foreign key to the erc.regulated_product table',
                on_delete=django.db.models.deletion.PROTECT,
                related_name='report_products',
                to='registration.regulatedproduct',
            ),
        ),
        migrations.AlterField(
            model_name='reportproduct',
            name='production_methodology',
            field=models.CharField(
                choices=[
                    ('OBPS Calculator', 'Obps Calculator'),
                    ('other', 'Other'),
                    ('Not Applicable', 'Not Applicable'),
                ],
                db_comment='The production methodoogy used to make this product. Defaulted to OBPS_CALCULATOR',
                default='OBPS Calculator',
                max_length=10000,
            ),
        ),
        migrations.AlterField(
            model_name='reportproduct',
            name='report_version',
            field=models.ForeignKey(
                db_comment='The report version this production information relates to. Foreign key to the erc.report_version table',
                on_delete=django.db.models.deletion.CASCADE,
                related_name='report_products',
                to='reporting.reportversion',
            ),
        ),
        migrations.AlterField(
            model_name='reportproductemissionallocation',
            name='emission_category',
            field=models.ForeignKey(
                db_comment='The emission category that this emission data belongs to. Foreign key to the erc.emission_category table',
                on_delete=django.db.models.deletion.PROTECT,
                related_name='%(class)s_records',
                to='reporting.emissioncategory',
            ),
        ),
        migrations.AlterField(
            model_name='reportproductemissionallocation',
            name='report_emission_allocation',
            field=models.ForeignKey(
                db_comment='The report emission allocation this emission data belongs to. Foreign key to the erc.report_emission_allocation table',
                on_delete=django.db.models.deletion.CASCADE,
                related_name='%(class)s_records',
                to='reporting.reportemissionallocation',
            ),
        ),
        migrations.AlterField(
            model_name='reportproductemissionallocation',
            name='report_product',
            field=models.ForeignKey(
                db_comment='The regulated product this emission data has been allocated to. Foreign key to the erc.report_product table',
                on_delete=django.db.models.deletion.CASCADE,
                related_name='%(class)s_records',
                to='reporting.reportproduct',
            ),
        ),
        migrations.AlterField(
            model_name='reportproductemissionallocation',
            name='report_version',
            field=models.ForeignKey(
                db_comment='The report version this data is associated with. Foreign key to the erc.report_version table',
                on_delete=django.db.models.deletion.CASCADE,
                related_name='%(class)s_records',
                to='reporting.reportversion',
            ),
        ),
        migrations.AlterField(
            model_name='reportrawactivitydata',
            name='activity',
            field=models.ForeignKey(
                db_comment='The reporting activity this raw activity JSON data applies to. Foreign key to the erc.activity table',
                on_delete=django.db.models.deletion.PROTECT,
                related_name='%(class)s_records',
                to='registration.activity',
            ),
        ),
        migrations.AlterField(
            model_name='reportrawactivitydata',
            name='facility_report',
            field=models.ForeignKey(
                db_comment='The facility report this raw activity JSON data belongs to. Foreign key to the erc.facility_report table',
                on_delete=django.db.models.deletion.CASCADE,
                related_name='%(class)s_records',
                to='reporting.facilityreport',
            ),
        ),
        migrations.AlterField(
            model_name='reportrawactivitydata',
            name='report_version',
            field=models.ForeignKey(
                db_comment='The report version this raw activity data belongs to. Foreign key to the erc.report_version table',
                on_delete=django.db.models.deletion.CASCADE,
                related_name='report_raw_activity_data',
                to='reporting.reportversion',
            ),
        ),
        migrations.AlterField(
            model_name='reportsignoff',
            name='report_version',
            field=models.ForeignKey(
                db_comment='The report this sign-off information relates to. Foreign key to the erc.report_version table',
                on_delete=django.db.models.deletion.CASCADE,
                related_name='report_sign_off',
                to='reporting.reportversion',
            ),
        ),
        migrations.AlterField(
            model_name='reportsourcetype',
            name='activity_source_type_base_schema',
            field=models.ForeignKey(
                db_comment='The activity-source-type base schema used to render the form that collected this data. Foreign key to the erc.activity_source_type_json_schema table',
                on_delete=django.db.models.deletion.PROTECT,
                related_name='%(class)s_records',
                to='reporting.activitysourcetypejsonschema',
            ),
        ),
        migrations.AlterField(
            model_name='reportsourcetype',
            name='json_data',
            field=models.JSONField(
                blank=True,
                db_comment="A flat JSON object representing the data collected for this model from the different sections of the schema defined in the erc.activity_source_type_json_schema table. Refer to the Greenhouse Gas Emission Reporting Regulation(https://www.bclaws.gov.bc.ca/civix/document/id/lc/statreg/249_2015#section14) Schedule A, Tables 1&2 for the emission's relationships & reporting requirements.",
            ),
        ),
        migrations.AlterField(
            model_name='reportsourcetype',
            name='report_activity',
            field=models.ForeignKey(
                db_comment='The activity data record this source type data belongs to. Foreign key to the erc.report_activity table',
                on_delete=django.db.models.deletion.CASCADE,
                related_name='%(class)s_records',
                to='reporting.reportactivity',
            ),
        ),
        migrations.AlterField(
            model_name='reportsourcetype',
            name='report_version',
            field=models.ForeignKey(
                db_comment='The report version this data belongs to. Foreign key to the erc.report_version table',
                on_delete=django.db.models.deletion.CASCADE,
                related_name='%(class)s_records',
                to='reporting.reportversion',
            ),
        ),
        migrations.AlterField(
            model_name='reportsourcetype',
            name='source_type',
            field=models.ForeignKey(
                db_comment='The source type this data applies to. Foreign key to the erc.source_type table',
                on_delete=django.db.models.deletion.PROTECT,
                related_name='%(class)s_records',
                to='reporting.sourcetype',
            ),
        ),
        migrations.AlterField(
            model_name='reportunit',
            name='json_data',
            field=models.JSONField(
                blank=True,
                db_comment="A flat JSON object representing the data collected for this model from the different sections of the schema defined in the erc.activity_source_type_json_schema table. Refer to the Greenhouse Gas Emission Reporting Regulation(https://www.bclaws.gov.bc.ca/civix/document/id/lc/statreg/249_2015#section14) Schedule A, Tables 1&2 for the emission's relationships & reporting requirements.",
            ),
        ),
        migrations.AlterField(
            model_name='reportunit',
            name='report_source_type',
            field=models.ForeignKey(
                db_comment='The source type data this unit data belongs to. Foreign key to the erc.report_source_type table',
                on_delete=django.db.models.deletion.CASCADE,
                related_name='%(class)s_records',
                to='reporting.reportsourcetype',
            ),
        ),
        migrations.AlterField(
            model_name='reportunit',
            name='report_version',
            field=models.ForeignKey(
                db_comment='The report version this data belongs to. Foreign key to the erc.report_version table',
                on_delete=django.db.models.deletion.CASCADE,
                related_name='%(class)s_records',
                to='reporting.reportversion',
            ),
        ),
        migrations.AlterField(
            model_name='reportverification',
            name='accredited_by',
            field=models.CharField(
                blank=True,
                choices=[('ANAB', 'Anab'), ('SCC', 'Scc')],
                db_comment='The verification accreditation body (ANAB or SCC)',
                max_length=10,
                null=True,
            ),
        ),
        migrations.AlterField(
            model_name='reportverification',
            name='report_version',
            field=models.OneToOneField(
                db_comment='The report version of this report verification. Foreign key to the erc.report_version table',
                on_delete=django.db.models.deletion.CASCADE,
                related_name='report_verification',
                to='reporting.reportversion',
            ),
        ),
        migrations.AlterField(
            model_name='reportverificationvisit',
            name='report_verification',
            field=models.ForeignKey(
                db_comment='The report verification associated with this visit. Foreign key to the erc.report_verification table',
                on_delete=django.db.models.deletion.CASCADE,
                related_name='report_verification_visits',
                to='reporting.reportverification',
            ),
        ),
        migrations.AlterField(
            model_name='reportverificationvisit',
            name='visit_coordinates',
            field=models.CharField(
                blank=True,
                db_comment='Geographic location of an other facility visited. (Latitude, Longitude. e.g. (10.0, 20.0))',
                max_length=100,
                null=True,
            ),
        ),
        migrations.AlterField(
            model_name='reportversion',
            name='report',
            field=models.ForeignKey(
                db_comment='The report to which this version applied. Foreign key to the erc.report table',
                on_delete=django.db.models.deletion.CASCADE,
                related_name='report_versions',
                to='reporting.report',
            ),
        ),
        migrations.AlterField(
            model_name='reportversion',
            name='report_type',
            field=models.CharField(
                choices=[('Annual Report', 'Annual Report'), ('Simple Report', 'Simple Report')],
                db_comment='Report type for this Report Version. Annual Report or Simple Report',
                default='Annual Report',
                max_length=1000,
            ),
        ),
    ]
