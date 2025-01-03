# Generated by Django 5.0.8 on 2024-12-05 21:22

import django.contrib.postgres.constraints
import django.contrib.postgres.fields.ranges
import django.db.models.deletion
import reporting.models.naics_regulatory_value
from django.db import migrations, models
from django.contrib.postgres.operations import BtreeGistExtension


def init_naics_regulatory_value_data(apps, schema_monitor):
    '''
    Add initial data to erc.naics_regulatory_value
    '''

    NaicsCode = apps.get_model('registration', 'NaicsCode')
    NaicsRegulatoryValue = apps.get_model('reporting', 'NaicsRegulatoryValue')
    NaicsRegulatoryValue.objects.bulk_create(
        [
            NaicsRegulatoryValue(
                naics_code_id=(NaicsCode.objects.get(naics_code=211110).id),
                reduction_factor='0.65',
                tightening_rate='0.01',
                valid_from='2023-01-01',
                valid_to='9999-12-31',
            ),
            NaicsRegulatoryValue(
                naics_code_id=(NaicsCode.objects.get(naics_code=212114).id),
                reduction_factor='0.65',
                tightening_rate='0.01',
                valid_from='2023-01-01',
                valid_to='9999-12-31',
            ),
            NaicsRegulatoryValue(
                naics_code_id=(NaicsCode.objects.get(naics_code=212220).id),
                reduction_factor='0.65',
                tightening_rate='0.01',
                valid_from='2023-01-01',
                valid_to='9999-12-31',
            ),
            NaicsRegulatoryValue(
                naics_code_id=(NaicsCode.objects.get(naics_code=212231).id),
                reduction_factor='0.65',
                tightening_rate='0.01',
                valid_from='2023-01-01',
                valid_to='9999-12-31',
            ),
            NaicsRegulatoryValue(
                naics_code_id=(NaicsCode.objects.get(naics_code=212233).id),
                reduction_factor='0.8',
                tightening_rate='0.01',
                valid_from='2023-01-01',
                valid_to='9999-12-31',
            ),
            NaicsRegulatoryValue(
                naics_code_id=(NaicsCode.objects.get(naics_code=212299).id),
                reduction_factor='0.65',
                tightening_rate='0.01',
                valid_from='2023-01-01',
                valid_to='9999-12-31',
            ),
            NaicsRegulatoryValue(
                naics_code_id=(NaicsCode.objects.get(naics_code=213118).id),
                reduction_factor='0.65',
                tightening_rate='0.01',
                valid_from='2023-01-01',
                valid_to='9999-12-31',
            ),
            NaicsRegulatoryValue(
                naics_code_id=(NaicsCode.objects.get(naics_code=311119).id),
                reduction_factor='0.65',
                tightening_rate='0.01',
                valid_from='2023-01-01',
                valid_to='9999-12-31',
            ),
            NaicsRegulatoryValue(
                naics_code_id=(NaicsCode.objects.get(naics_code=311310).id),
                reduction_factor='0.65',
                tightening_rate='0.01',
                valid_from='2023-01-01',
                valid_to='9999-12-31',
            ),
            NaicsRegulatoryValue(
                naics_code_id=(NaicsCode.objects.get(naics_code=311614).id),
                reduction_factor='0.65',
                tightening_rate='0.01',
                valid_from='2023-01-01',
                valid_to='9999-12-31',
            ),
            NaicsRegulatoryValue(
                naics_code_id=(NaicsCode.objects.get(naics_code=321111).id),
                reduction_factor='0.65',
                tightening_rate='0.01',
                valid_from='2023-01-01',
                valid_to='9999-12-31',
            ),
            NaicsRegulatoryValue(
                naics_code_id=(NaicsCode.objects.get(naics_code=321212).id),
                reduction_factor='0.65',
                tightening_rate='0.01',
                valid_from='2023-01-01',
                valid_to='9999-12-31',
            ),
            NaicsRegulatoryValue(
                naics_code_id=(NaicsCode.objects.get(naics_code=321216).id),
                reduction_factor='0.65',
                tightening_rate='0.01',
                valid_from='2023-01-01',
                valid_to='9999-12-31',
            ),
            NaicsRegulatoryValue(
                naics_code_id=(NaicsCode.objects.get(naics_code=321999).id),
                reduction_factor='0.65',
                tightening_rate='0.01',
                valid_from='2023-01-01',
                valid_to='9999-12-31',
            ),
            NaicsRegulatoryValue(
                naics_code_id=(NaicsCode.objects.get(naics_code=322111).id),
                reduction_factor='0.65',
                tightening_rate='0.01',
                valid_from='2023-01-01',
                valid_to='9999-12-31',
            ),
            NaicsRegulatoryValue(
                naics_code_id=(NaicsCode.objects.get(naics_code=322112).id),
                reduction_factor='0.65',
                tightening_rate='0.01',
                valid_from='2023-01-01',
                valid_to='9999-12-31',
            ),
            NaicsRegulatoryValue(
                naics_code_id=(NaicsCode.objects.get(naics_code=322121).id),
                reduction_factor='0.65',
                tightening_rate='0.01',
                valid_from='2023-01-01',
                valid_to='9999-12-31',
            ),
            NaicsRegulatoryValue(
                naics_code_id=(NaicsCode.objects.get(naics_code=322122).id),
                reduction_factor='0.65',
                tightening_rate='0.01',
                valid_from='2023-01-01',
                valid_to='9999-12-31',
            ),
            NaicsRegulatoryValue(
                naics_code_id=(NaicsCode.objects.get(naics_code=324110).id),
                reduction_factor='0.65',
                tightening_rate='0.01',
                valid_from='2023-01-01',
                valid_to='9999-12-31',
            ),
            NaicsRegulatoryValue(
                naics_code_id=(NaicsCode.objects.get(naics_code=325120).id),
                reduction_factor='0.65',
                tightening_rate='0.01',
                valid_from='2023-01-01',
                valid_to='9999-12-31',
            ),
            NaicsRegulatoryValue(
                naics_code_id=(NaicsCode.objects.get(naics_code=325181).id),
                reduction_factor='0.65',
                tightening_rate='0.01',
                valid_from='2023-01-01',
                valid_to='9999-12-31',
            ),
            NaicsRegulatoryValue(
                naics_code_id=(NaicsCode.objects.get(naics_code=325189).id),
                reduction_factor='0.9',
                tightening_rate='0.01',
                valid_from='2023-01-01',
                valid_to='9999-12-31',
            ),
            NaicsRegulatoryValue(
                naics_code_id=(NaicsCode.objects.get(naics_code=325190).id),
                reduction_factor='0.65',
                tightening_rate='0.01',
                valid_from='2023-01-01',
                valid_to='9999-12-31',
            ),
            NaicsRegulatoryValue(
                naics_code_id=(NaicsCode.objects.get(naics_code=327310).id),
                reduction_factor='0.9',
                tightening_rate='0.01',
                valid_from='2023-01-01',
                valid_to='9999-12-31',
            ),
            NaicsRegulatoryValue(
                naics_code_id=(NaicsCode.objects.get(naics_code=327410).id),
                reduction_factor='0.9',
                tightening_rate='0.01',
                valid_from='2023-01-01',
                valid_to='9999-12-31',
            ),
            NaicsRegulatoryValue(
                naics_code_id=(NaicsCode.objects.get(naics_code=327420).id),
                reduction_factor='0.65',
                tightening_rate='0.01',
                valid_from='2023-01-01',
                valid_to='9999-12-31',
            ),
            NaicsRegulatoryValue(
                naics_code_id=(NaicsCode.objects.get(naics_code=327990).id),
                reduction_factor='0.65',
                tightening_rate='0.01',
                valid_from='2023-01-01',
                valid_to='9999-12-31',
            ),
            NaicsRegulatoryValue(
                naics_code_id=(NaicsCode.objects.get(naics_code=331222).id),
                reduction_factor='0.65',
                tightening_rate='0.01',
                valid_from='2023-01-01',
                valid_to='9999-12-31',
            ),
            NaicsRegulatoryValue(
                naics_code_id=(NaicsCode.objects.get(naics_code=331313).id),
                reduction_factor='0.95',
                tightening_rate='0.01',
                valid_from='2023-01-01',
                valid_to='9999-12-31',
            ),
            NaicsRegulatoryValue(
                naics_code_id=(NaicsCode.objects.get(naics_code=331410).id),
                reduction_factor='0.85',
                tightening_rate='0.01',
                valid_from='2023-01-01',
                valid_to='9999-12-31',
            ),
            NaicsRegulatoryValue(
                naics_code_id=(NaicsCode.objects.get(naics_code=331511).id),
                reduction_factor='0.65',
                tightening_rate='0.01',
                valid_from='2023-01-01',
                valid_to='9999-12-31',
            ),
            NaicsRegulatoryValue(
                naics_code_id=(NaicsCode.objects.get(naics_code=412110).id),
                reduction_factor='0.65',
                tightening_rate='0.01',
                valid_from='2023-01-01',
                valid_to='9999-12-31',
            ),
            NaicsRegulatoryValue(
                naics_code_id=(NaicsCode.objects.get(naics_code=486210).id),
                reduction_factor='0.65',
                tightening_rate='0.01',
                valid_from='2023-01-01',
                valid_to='9999-12-31',
            ),
        ]
    )


class Migration(migrations.Migration):

    dependencies = [
        ('registration', '0061_remove_naics_code'),
        ('reporting', '0036_aluminum_or_alumina_production_data'),
    ]

    operations = [
        BtreeGistExtension(),  # Enable btree gist extension in Postgres to handle fkey constraint equal condition below
        migrations.CreateModel(
            name='NaicsRegulatoryValue',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                (
                    'reduction_factor',
                    models.DecimalField(
                        db_comment='The Province developed distinct reduction factors for products in the B.C. OBPS with disproportionately higher industrial process emissions than those produced in other sectors. https://www2.gov.bc.ca/assets/gov/environment/climate-change/action/carbon-tax/obps-technical-backgrounder.pdf',
                        decimal_places=4,
                        max_digits=5,
                    ),
                ),
                (
                    'tightening_rate',
                    models.DecimalField(
                        db_comment='Tightening rates are planned, yearly, gradual increases to BC OBPS stringency. https://www2.gov.bc.ca/assets/gov/environment/climate-change/action/carbon-tax/obps-technical-backgrounder.pdf',
                        decimal_places=4,
                        max_digits=5,
                    ),
                ),
                (
                    'valid_from',
                    models.DateField(
                        blank=True, db_comment='Date from which the regulatory values are applicable', null=True
                    ),
                ),
                (
                    'valid_to',
                    models.DateField(
                        blank=True, db_comment='Date until which the regulatory values are applicable', null=True
                    ),
                ),
                (
                    'naics_code',
                    models.ForeignKey(
                        db_comment='Foreign key to the naics_code record that is associated with the regulatory values in this record',
                        on_delete=django.db.models.deletion.DO_NOTHING,
                        related_name='regulatory_values',
                        to='registration.naicscode',
                    ),
                ),
            ],
            options={
                'db_table': 'erc"."naics_regulatory_values',
                'db_table_comment': 'This table contains the regulatory values that apply to a naics code within a set timeframe from where the values are valid and when the values are no longer valid.',
            },
        ),
        migrations.AddConstraint(
            model_name='naicsregulatoryvalue',
            constraint=django.contrib.postgres.constraints.ExclusionConstraint(
                expressions=[
                    (
                        reporting.models.naics_regulatory_value.TsTzRange(
                            'valid_from', 'valid_to', django.contrib.postgres.fields.ranges.RangeBoundary()
                        ),
                        '&&',
                    ),
                    ('naics_code', '='),
                ],
                name='exclude_overlapping_naics_regulatory_values_records_by_date_range',
            ),
        ),
        migrations.RunPython(init_naics_regulatory_value_data),  # No revert necessary
    ]
