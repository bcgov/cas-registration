from ._0002_squashed_data_functions import (
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
import django.db.migrations.operations.special
from django.db import migrations


class Migration(migrations.Migration):

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
        migrations.RunPython(
            code=insert_lime_recovery_kiln_override,
            reverse_code=revert_lime_recovery_kiln_override,
        ),
        migrations.RunPython(
            code=fix_municipal_solid_waste_fuel_name,
            reverse_code=django.db.migrations.operations.special.RunPython.noop,
        ),
        migrations.RunPython(
            code=remove_duplicate_methodology_records,
            reverse_code=django.db.migrations.operations.special.RunPython.noop,
        ),
        migrations.RunPython(
            code=populate_slug,
            reverse_code=django.db.migrations.operations.special.RunPython.noop,
        ),
        migrations.RunPython(
            code=insert_validation_records,
            reverse_code=revert_validation_records,
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
        migrations.RunPython(
            code=populate_naics_code,
            reverse_code=django.db.migrations.operations.special.RunPython.noop,
        ),
        migrations.RunPython(
            code=update_fuel_amount_ranges,
            reverse_code=revert_fuel_amount_ranges,
        ),
        migrations.RunPython(
            code=populate_missing_report_version_fields,
        ),
        migrations.RunPython(
            code=remove_2023_ry,
            reverse_code=revert_2023_ry,
        ),
    ]
