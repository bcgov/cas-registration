# Generated by Django 5.0.14 on 2025-05-30 19:46

import pgtrigger.compiler
import pgtrigger.migrations
from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("reporting", "0109_electricity_transmission"),
    ]

    operations = [
        pgtrigger.migrations.RemoveTrigger(
            model_name="facilityreport",
            name="immutable_report_version",
        ),
        pgtrigger.migrations.RemoveTrigger(
            model_name="reportactivity",
            name="immutable_report_version",
        ),
        pgtrigger.migrations.RemoveTrigger(
            model_name="reportadditionaldata",
            name="immutable_report_version",
        ),
        pgtrigger.migrations.RemoveTrigger(
            model_name="reportattachment",
            name="immutable_report_version",
        ),
        pgtrigger.migrations.RemoveTrigger(
            model_name="reportattachmentconfirmation",
            name="immutable_report_version",
        ),
        pgtrigger.migrations.RemoveTrigger(
            model_name="reportcompliancesummary",
            name="immutable_report_version",
        ),
        pgtrigger.migrations.RemoveTrigger(
            model_name="reportcompliancesummaryproduct",
            name="immutable_report_version",
        ),
        pgtrigger.migrations.RemoveTrigger(
            model_name="reportelectricityimportdata",
            name="immutable_report_version",
        ),
        pgtrigger.migrations.RemoveTrigger(
            model_name="reportemission",
            name="immutable_report_version",
        ),
        pgtrigger.migrations.RemoveTrigger(
            model_name="reportemissionallocation",
            name="immutable_report_version",
        ),
        pgtrigger.migrations.RemoveTrigger(
            model_name="reportfuel",
            name="immutable_report_version",
        ),
        pgtrigger.migrations.RemoveTrigger(
            model_name="reportmethodology",
            name="immutable_report_version",
        ),
        pgtrigger.migrations.RemoveTrigger(
            model_name="reportnewentrant",
            name="immutable_report_version",
        ),
        pgtrigger.migrations.RemoveTrigger(
            model_name="reportnewentrantemission",
            name="immutable_report_version",
        ),
        pgtrigger.migrations.RemoveTrigger(
            model_name="reportnewentrantproduction",
            name="immutable_report_version",
        ),
        pgtrigger.migrations.RemoveTrigger(
            model_name="reportnonattributableemissions",
            name="immutable_report_version",
        ),
        pgtrigger.migrations.RemoveTrigger(
            model_name="reportoperation",
            name="immutable_report_version",
        ),
        pgtrigger.migrations.RemoveTrigger(
            model_name="reportoperationrepresentative",
            name="immutable_report_version",
        ),
        pgtrigger.migrations.RemoveTrigger(
            model_name="reportpersonresponsible",
            name="immutable_report_version",
        ),
        pgtrigger.migrations.RemoveTrigger(
            model_name="reportproduct",
            name="immutable_report_version",
        ),
        pgtrigger.migrations.RemoveTrigger(
            model_name="reportproductemissionallocation",
            name="immutable_report_version",
        ),
        pgtrigger.migrations.RemoveTrigger(
            model_name="reportrawactivitydata",
            name="immutable_report_version",
        ),
        pgtrigger.migrations.RemoveTrigger(
            model_name="reportsignoff",
            name="immutable_report_version",
        ),
        pgtrigger.migrations.RemoveTrigger(
            model_name="reportsourcetype",
            name="immutable_report_version",
        ),
        pgtrigger.migrations.RemoveTrigger(
            model_name="reportunit",
            name="immutable_report_version",
        ),
        pgtrigger.migrations.RemoveTrigger(
            model_name="reportverification",
            name="immutable_report_version",
        ),
        pgtrigger.migrations.RemoveTrigger(
            model_name="reportverificationvisit",
            name="immutable_report_version",
        ),
        pgtrigger.migrations.AddTrigger(
            model_name="facilityreport",
            trigger=pgtrigger.compiler.Trigger(
                name="immutable_report_version",
                sql=pgtrigger.compiler.UpsertTriggerSql(
                    func="\n            declare\n                status text;\n            begin\n                select rel1.status into status\n                from \"erc\".\"report_version\" rel1\n                where rel1.id=coalesce(new.report_version_id, old.report_version_id)\n                limit 1;\n\n                if status='Submitted' then\n                    raise exception 'facilityreport record is immutable after a report version has been submitted';\n                end if;\n\n                return coalesce(new, old);\n            end;\n            ",
                    hash="49f8cb8326e94d64992cad5966dff66d87385bfa",
                    operation="UPDATE OR INSERT OR DELETE",
                    pgid="pgtrigger_immutable_report_version_0899a",
                    table='erc"."facility_report',
                    when="BEFORE",
                ),
            ),
        ),
        pgtrigger.migrations.AddTrigger(
            model_name="reportactivity",
            trigger=pgtrigger.compiler.Trigger(
                name="immutable_report_version",
                sql=pgtrigger.compiler.UpsertTriggerSql(
                    func="\n            declare\n                status text;\n            begin\n                select rel1.status into status\n                from \"erc\".\"report_version\" rel1\n                where rel1.id=coalesce(new.report_version_id, old.report_version_id)\n                limit 1;\n\n                if status='Submitted' then\n                    raise exception 'reportactivity record is immutable after a report version has been submitted';\n                end if;\n\n                return coalesce(new, old);\n            end;\n            ",
                    hash="fc912857ff86c71bd629359b8b5df24621f38e13",
                    operation="UPDATE OR INSERT OR DELETE",
                    pgid="pgtrigger_immutable_report_version_12848",
                    table='erc"."report_activity',
                    when="BEFORE",
                ),
            ),
        ),
        pgtrigger.migrations.AddTrigger(
            model_name="reportadditionaldata",
            trigger=pgtrigger.compiler.Trigger(
                name="immutable_report_version",
                sql=pgtrigger.compiler.UpsertTriggerSql(
                    func="\n            declare\n                status text;\n            begin\n                select rel1.status into status\n                from \"erc\".\"report_version\" rel1\n                where rel1.id=coalesce(new.report_version_id, old.report_version_id)\n                limit 1;\n\n                if status='Submitted' then\n                    raise exception 'reportadditionaldata record is immutable after a report version has been submitted';\n                end if;\n\n                return coalesce(new, old);\n            end;\n            ",
                    hash="433b92f69f48006526c0e9f82c5b1a834706c93b",
                    operation="UPDATE OR INSERT OR DELETE",
                    pgid="pgtrigger_immutable_report_version_75b4c",
                    table='erc"."report_additional_data',
                    when="BEFORE",
                ),
            ),
        ),
        pgtrigger.migrations.AddTrigger(
            model_name="reportattachment",
            trigger=pgtrigger.compiler.Trigger(
                name="immutable_report_version",
                sql=pgtrigger.compiler.UpsertTriggerSql(
                    func="\n            declare\n                status text;\n            begin\n                select rel1.status into status\n                from \"erc\".\"report_version\" rel1\n                where rel1.id=coalesce(new.report_version_id, old.report_version_id)\n                limit 1;\n\n                if status='Submitted' then\n                    raise exception 'reportattachment record is immutable after a report version has been submitted';\n                end if;\n\n                return coalesce(new, old);\n            end;\n            ",
                    hash="b7e2bc06d30c91fe3ab65125cf818c0f3107b91b",
                    operation="UPDATE OR INSERT OR DELETE",
                    pgid="pgtrigger_immutable_report_version_3148e",
                    table='erc"."report_attachment',
                    when="BEFORE",
                ),
            ),
        ),
        pgtrigger.migrations.AddTrigger(
            model_name="reportattachmentconfirmation",
            trigger=pgtrigger.compiler.Trigger(
                name="immutable_report_version",
                sql=pgtrigger.compiler.UpsertTriggerSql(
                    func="\n            declare\n                status text;\n            begin\n                select rel1.status into status\n                from \"erc\".\"report_version\" rel1\n                where rel1.id=coalesce(new.report_version_id, old.report_version_id)\n                limit 1;\n\n                if status='Submitted' then\n                    raise exception 'reportattachmentconfirmation record is immutable after a report version has been submitted';\n                end if;\n\n                return coalesce(new, old);\n            end;\n            ",
                    hash="b1195517238f1bb9783b91ebdabcc6a166354655",
                    operation="UPDATE OR INSERT OR DELETE",
                    pgid="pgtrigger_immutable_report_version_5f121",
                    table='erc"."report_attachment_confirmation',
                    when="BEFORE",
                ),
            ),
        ),
        pgtrigger.migrations.AddTrigger(
            model_name="reportcompliancesummary",
            trigger=pgtrigger.compiler.Trigger(
                name="immutable_report_version",
                sql=pgtrigger.compiler.UpsertTriggerSql(
                    func="\n            declare\n                status text;\n            begin\n                select rel1.status into status\n                from \"erc\".\"report_version\" rel1\n                where rel1.id=coalesce(new.report_version_id, old.report_version_id)\n                limit 1;\n\n                if status='Submitted' then\n                    raise exception 'reportcompliancesummary record is immutable after a report version has been submitted';\n                end if;\n\n                return coalesce(new, old);\n            end;\n            ",
                    hash="b9c8b096f706e97d2e3df650ec75126ba58c2495",
                    operation="UPDATE OR INSERT OR DELETE",
                    pgid="pgtrigger_immutable_report_version_dfcb4",
                    table='erc"."report_compliance_summary',
                    when="BEFORE",
                ),
            ),
        ),
        pgtrigger.migrations.AddTrigger(
            model_name="reportcompliancesummaryproduct",
            trigger=pgtrigger.compiler.Trigger(
                name="immutable_report_version",
                sql=pgtrigger.compiler.UpsertTriggerSql(
                    func="\n            declare\n                status text;\n            begin\n                select rel1.status into status\n                from \"erc\".\"report_version\" rel1\n                where rel1.id=coalesce(new.report_version_id, old.report_version_id)\n                limit 1;\n\n                if status='Submitted' then\n                    raise exception 'reportcompliancesummaryproduct record is immutable after a report version has been submitted';\n                end if;\n\n                return coalesce(new, old);\n            end;\n            ",
                    hash="2f8fba7f98445c13892ed3cb65b69d03d518a9e6",
                    operation="UPDATE OR INSERT OR DELETE",
                    pgid="pgtrigger_immutable_report_version_9c6f6",
                    table='erc"."report_compliance_summary_product',
                    when="BEFORE",
                ),
            ),
        ),
        pgtrigger.migrations.AddTrigger(
            model_name="reportelectricityimportdata",
            trigger=pgtrigger.compiler.Trigger(
                name="immutable_report_version",
                sql=pgtrigger.compiler.UpsertTriggerSql(
                    func="\n            declare\n                status text;\n            begin\n                select rel1.status into status\n                from \"erc\".\"report_version\" rel1\n                where rel1.id=coalesce(new.report_version_id, old.report_version_id)\n                limit 1;\n\n                if status='Submitted' then\n                    raise exception 'reportelectricityimportdata record is immutable after a report version has been submitted';\n                end if;\n\n                return coalesce(new, old);\n            end;\n            ",
                    hash="5337b732a5ea05b7efb47d90f243e9eb086145a6",
                    operation="UPDATE OR INSERT OR DELETE",
                    pgid="pgtrigger_immutable_report_version_bb993",
                    table='erc"."report_electricity_import_data',
                    when="BEFORE",
                ),
            ),
        ),
        pgtrigger.migrations.AddTrigger(
            model_name="reportemission",
            trigger=pgtrigger.compiler.Trigger(
                name="immutable_report_version",
                sql=pgtrigger.compiler.UpsertTriggerSql(
                    func="\n            declare\n                status text;\n            begin\n                select rel1.status into status\n                from \"erc\".\"report_version\" rel1\n                where rel1.id=coalesce(new.report_version_id, old.report_version_id)\n                limit 1;\n\n                if status='Submitted' then\n                    raise exception 'reportemission record is immutable after a report version has been submitted';\n                end if;\n\n                return coalesce(new, old);\n            end;\n            ",
                    hash="6092e9c25146a276b9310708e1b76ce6d4df78bf",
                    operation="UPDATE OR INSERT OR DELETE",
                    pgid="pgtrigger_immutable_report_version_43304",
                    table='erc"."report_emission',
                    when="BEFORE",
                ),
            ),
        ),
        pgtrigger.migrations.AddTrigger(
            model_name="reportemissionallocation",
            trigger=pgtrigger.compiler.Trigger(
                name="immutable_report_version",
                sql=pgtrigger.compiler.UpsertTriggerSql(
                    func="\n            declare\n                status text;\n            begin\n                select rel1.status into status\n                from \"erc\".\"report_version\" rel1\n                where rel1.id=coalesce(new.report_version_id, old.report_version_id)\n                limit 1;\n\n                if status='Submitted' then\n                    raise exception 'reportemissionallocation record is immutable after a report version has been submitted';\n                end if;\n\n                return coalesce(new, old);\n            end;\n            ",
                    hash="14219ec2cf9bd33d510cf0365c6c9047c97e53a4",
                    operation="UPDATE OR INSERT OR DELETE",
                    pgid="pgtrigger_immutable_report_version_0067e",
                    table='erc"."report_emission_allocation',
                    when="BEFORE",
                ),
            ),
        ),
        pgtrigger.migrations.AddTrigger(
            model_name="reportfuel",
            trigger=pgtrigger.compiler.Trigger(
                name="immutable_report_version",
                sql=pgtrigger.compiler.UpsertTriggerSql(
                    func="\n            declare\n                status text;\n            begin\n                select rel1.status into status\n                from \"erc\".\"report_version\" rel1\n                where rel1.id=coalesce(new.report_version_id, old.report_version_id)\n                limit 1;\n\n                if status='Submitted' then\n                    raise exception 'reportfuel record is immutable after a report version has been submitted';\n                end if;\n\n                return coalesce(new, old);\n            end;\n            ",
                    hash="2c3c2ff9fa69b720b0fa002ed70869a496809550",
                    operation="UPDATE OR INSERT OR DELETE",
                    pgid="pgtrigger_immutable_report_version_6dfcf",
                    table='erc"."report_fuel',
                    when="BEFORE",
                ),
            ),
        ),
        pgtrigger.migrations.AddTrigger(
            model_name="reportmethodology",
            trigger=pgtrigger.compiler.Trigger(
                name="immutable_report_version",
                sql=pgtrigger.compiler.UpsertTriggerSql(
                    func="\n            declare\n                status text;\n            begin\n                select rel1.status into status\n                from \"erc\".\"report_version\" rel1\n                where rel1.id=coalesce(new.report_version_id, old.report_version_id)\n                limit 1;\n\n                if status='Submitted' then\n                    raise exception 'reportmethodology record is immutable after a report version has been submitted';\n                end if;\n\n                return coalesce(new, old);\n            end;\n            ",
                    hash="0d2d16db9fb6376a3fb2b7eb882a267fdad4910e",
                    operation="UPDATE OR INSERT OR DELETE",
                    pgid="pgtrigger_immutable_report_version_549f7",
                    table='erc"."report_methodology',
                    when="BEFORE",
                ),
            ),
        ),
        pgtrigger.migrations.AddTrigger(
            model_name="reportnewentrant",
            trigger=pgtrigger.compiler.Trigger(
                name="immutable_report_version",
                sql=pgtrigger.compiler.UpsertTriggerSql(
                    func="\n            declare\n                status text;\n            begin\n                select rel1.status into status\n                from \"erc\".\"report_version\" rel1\n                where rel1.id=coalesce(new.report_version_id, old.report_version_id)\n                limit 1;\n\n                if status='Submitted' then\n                    raise exception 'reportnewentrant record is immutable after a report version has been submitted';\n                end if;\n\n                return coalesce(new, old);\n            end;\n            ",
                    hash="cd6eca78901c6881c486e9deea1d68eb7db87f3c",
                    operation="UPDATE OR INSERT OR DELETE",
                    pgid="pgtrigger_immutable_report_version_91283",
                    table='erc"."report_new_entrant',
                    when="BEFORE",
                ),
            ),
        ),
        pgtrigger.migrations.AddTrigger(
            model_name="reportnewentrantemission",
            trigger=pgtrigger.compiler.Trigger(
                name="immutable_report_version",
                sql=pgtrigger.compiler.UpsertTriggerSql(
                    func='\n            declare\n                status text;\n            begin\n                select rel1.status into status\n                from "erc"."report_version" rel1\n                join "erc"."report_new_entrant" rel2 on rel2.report_version_id=rel1.id\n                where rel2.id=coalesce(new.report_new_entrant_id, old.report_new_entrant_id)\n                limit 1;\n\n                if status=\'Submitted\' then\n                    raise exception \'reportnewentrantemission record is immutable after a report version has been submitted\';\n                end if;\n\n                return coalesce(new, old);\n            end;\n            ',
                    hash="8bda333f7a6d5e30c5bb73e22a053e608aa00dd3",
                    operation="UPDATE OR INSERT OR DELETE",
                    pgid="pgtrigger_immutable_report_version_cb047",
                    table='erc"."report_new_entrant_emission',
                    when="BEFORE",
                ),
            ),
        ),
        pgtrigger.migrations.AddTrigger(
            model_name="reportnewentrantproduction",
            trigger=pgtrigger.compiler.Trigger(
                name="immutable_report_version",
                sql=pgtrigger.compiler.UpsertTriggerSql(
                    func='\n            declare\n                status text;\n            begin\n                select rel1.status into status\n                from "erc"."report_version" rel1\n                join "erc"."report_new_entrant" rel2 on rel2.report_version_id=rel1.id\n                where rel2.id=coalesce(new.report_new_entrant_id, old.report_new_entrant_id)\n                limit 1;\n\n                if status=\'Submitted\' then\n                    raise exception \'reportnewentrantproduction record is immutable after a report version has been submitted\';\n                end if;\n\n                return coalesce(new, old);\n            end;\n            ',
                    hash="c2220f83d8b8672d589f390849444c57287570fb",
                    operation="UPDATE OR INSERT OR DELETE",
                    pgid="pgtrigger_immutable_report_version_9db82",
                    table='erc"."report_new_entrant_production',
                    when="BEFORE",
                ),
            ),
        ),
        pgtrigger.migrations.AddTrigger(
            model_name="reportnonattributableemissions",
            trigger=pgtrigger.compiler.Trigger(
                name="immutable_report_version",
                sql=pgtrigger.compiler.UpsertTriggerSql(
                    func="\n            declare\n                status text;\n            begin\n                select rel1.status into status\n                from \"erc\".\"report_version\" rel1\n                where rel1.id=coalesce(new.report_version_id, old.report_version_id)\n                limit 1;\n\n                if status='Submitted' then\n                    raise exception 'reportnonattributableemissions record is immutable after a report version has been submitted';\n                end if;\n\n                return coalesce(new, old);\n            end;\n            ",
                    hash="007024ecef80799f1f6feeb78ae893266377fd25",
                    operation="UPDATE OR INSERT OR DELETE",
                    pgid="pgtrigger_immutable_report_version_7acda",
                    table='erc"."report_non_attributable_emissions',
                    when="BEFORE",
                ),
            ),
        ),
        pgtrigger.migrations.AddTrigger(
            model_name="reportoperation",
            trigger=pgtrigger.compiler.Trigger(
                name="immutable_report_version",
                sql=pgtrigger.compiler.UpsertTriggerSql(
                    func="\n            declare\n                status text;\n            begin\n                select rel1.status into status\n                from \"erc\".\"report_version\" rel1\n                where rel1.id=coalesce(new.report_version_id, old.report_version_id)\n                limit 1;\n\n                if status='Submitted' then\n                    raise exception 'reportoperation record is immutable after a report version has been submitted';\n                end if;\n\n                return coalesce(new, old);\n            end;\n            ",
                    hash="5450902c7fe4c6079ec6222561e9efe3574e4897",
                    operation="UPDATE OR INSERT OR DELETE",
                    pgid="pgtrigger_immutable_report_version_2fd67",
                    table='erc"."report_operation',
                    when="BEFORE",
                ),
            ),
        ),
        pgtrigger.migrations.AddTrigger(
            model_name="reportoperationrepresentative",
            trigger=pgtrigger.compiler.Trigger(
                name="immutable_report_version",
                sql=pgtrigger.compiler.UpsertTriggerSql(
                    func="\n            declare\n                status text;\n            begin\n                select rel1.status into status\n                from \"erc\".\"report_version\" rel1\n                where rel1.id=coalesce(new.report_version_id, old.report_version_id)\n                limit 1;\n\n                if status='Submitted' then\n                    raise exception 'reportoperationrepresentative record is immutable after a report version has been submitted';\n                end if;\n\n                return coalesce(new, old);\n            end;\n            ",
                    hash="efe8d671bbc1a4f09516e1e46e880d7ebf08ebb4",
                    operation="UPDATE OR INSERT OR DELETE",
                    pgid="pgtrigger_immutable_report_version_f165f",
                    table='erc"."report_operation_representative',
                    when="BEFORE",
                ),
            ),
        ),
        pgtrigger.migrations.AddTrigger(
            model_name="reportpersonresponsible",
            trigger=pgtrigger.compiler.Trigger(
                name="immutable_report_version",
                sql=pgtrigger.compiler.UpsertTriggerSql(
                    func="\n            declare\n                status text;\n            begin\n                select rel1.status into status\n                from \"erc\".\"report_version\" rel1\n                where rel1.id=coalesce(new.report_version_id, old.report_version_id)\n                limit 1;\n\n                if status='Submitted' then\n                    raise exception 'reportpersonresponsible record is immutable after a report version has been submitted';\n                end if;\n\n                return coalesce(new, old);\n            end;\n            ",
                    hash="10bbdb8c58cc771d6b0b4e1fdd97adca6e2ad5c9",
                    operation="UPDATE OR INSERT OR DELETE",
                    pgid="pgtrigger_immutable_report_version_5977d",
                    table='erc"."report_person_responsible',
                    when="BEFORE",
                ),
            ),
        ),
        pgtrigger.migrations.AddTrigger(
            model_name="reportproduct",
            trigger=pgtrigger.compiler.Trigger(
                name="immutable_report_version",
                sql=pgtrigger.compiler.UpsertTriggerSql(
                    func="\n            declare\n                status text;\n            begin\n                select rel1.status into status\n                from \"erc\".\"report_version\" rel1\n                where rel1.id=coalesce(new.report_version_id, old.report_version_id)\n                limit 1;\n\n                if status='Submitted' then\n                    raise exception 'reportproduct record is immutable after a report version has been submitted';\n                end if;\n\n                return coalesce(new, old);\n            end;\n            ",
                    hash="c5a00aacbe32edcd444d8b46e6008f9d97633794",
                    operation="UPDATE OR INSERT OR DELETE",
                    pgid="pgtrigger_immutable_report_version_804e0",
                    table='erc"."report_product',
                    when="BEFORE",
                ),
            ),
        ),
        pgtrigger.migrations.AddTrigger(
            model_name="reportproductemissionallocation",
            trigger=pgtrigger.compiler.Trigger(
                name="immutable_report_version",
                sql=pgtrigger.compiler.UpsertTriggerSql(
                    func="\n            declare\n                status text;\n            begin\n                select rel1.status into status\n                from \"erc\".\"report_version\" rel1\n                where rel1.id=coalesce(new.report_version_id, old.report_version_id)\n                limit 1;\n\n                if status='Submitted' then\n                    raise exception 'reportproductemissionallocation record is immutable after a report version has been submitted';\n                end if;\n\n                return coalesce(new, old);\n            end;\n            ",
                    hash="7f6179e3f40b8efaee837739c790142016f90f17",
                    operation="UPDATE OR INSERT OR DELETE",
                    pgid="pgtrigger_immutable_report_version_6eb57",
                    table='erc"."report_product_emission_allocation',
                    when="BEFORE",
                ),
            ),
        ),
        pgtrigger.migrations.AddTrigger(
            model_name="reportrawactivitydata",
            trigger=pgtrigger.compiler.Trigger(
                name="immutable_report_version",
                sql=pgtrigger.compiler.UpsertTriggerSql(
                    func='\n            declare\n                status text;\n            begin\n                select rel1.status into status\n                from "erc"."report_version" rel1\n                join "erc"."facility_report" rel2 on rel2.report_version_id=rel1.id\n                where rel2.id=coalesce(new.facility_report_id, old.facility_report_id)\n                limit 1;\n\n                if status=\'Submitted\' then\n                    raise exception \'reportrawactivitydata record is immutable after a report version has been submitted\';\n                end if;\n\n                return coalesce(new, old);\n            end;\n            ',
                    hash="281aa87ec0b2abe445478a58bb5bfc4e2b2bee06",
                    operation="UPDATE OR INSERT OR DELETE",
                    pgid="pgtrigger_immutable_report_version_0fd09",
                    table='erc"."report_raw_activity_data',
                    when="BEFORE",
                ),
            ),
        ),
        pgtrigger.migrations.AddTrigger(
            model_name="reportsignoff",
            trigger=pgtrigger.compiler.Trigger(
                name="immutable_report_version",
                sql=pgtrigger.compiler.UpsertTriggerSql(
                    func="\n            declare\n                status text;\n            begin\n                select rel1.status into status\n                from \"erc\".\"report_version\" rel1\n                where rel1.id=coalesce(new.report_version_id, old.report_version_id)\n                limit 1;\n\n                if status='Submitted' then\n                    raise exception 'reportsignoff record is immutable after a report version has been submitted';\n                end if;\n\n                return coalesce(new, old);\n            end;\n            ",
                    hash="e4d4fb203711cf6522d43e1f8be5efd67eee751c",
                    operation="UPDATE OR INSERT OR DELETE",
                    pgid="pgtrigger_immutable_report_version_a4055",
                    table='erc"."report_sign_off',
                    when="BEFORE",
                ),
            ),
        ),
        pgtrigger.migrations.AddTrigger(
            model_name="reportsourcetype",
            trigger=pgtrigger.compiler.Trigger(
                name="immutable_report_version",
                sql=pgtrigger.compiler.UpsertTriggerSql(
                    func="\n            declare\n                status text;\n            begin\n                select rel1.status into status\n                from \"erc\".\"report_version\" rel1\n                where rel1.id=coalesce(new.report_version_id, old.report_version_id)\n                limit 1;\n\n                if status='Submitted' then\n                    raise exception 'reportsourcetype record is immutable after a report version has been submitted';\n                end if;\n\n                return coalesce(new, old);\n            end;\n            ",
                    hash="3c52bcadbce222d8de9f48c32599a3329b4ea805",
                    operation="UPDATE OR INSERT OR DELETE",
                    pgid="pgtrigger_immutable_report_version_62a56",
                    table='erc"."report_source_type',
                    when="BEFORE",
                ),
            ),
        ),
        pgtrigger.migrations.AddTrigger(
            model_name="reportunit",
            trigger=pgtrigger.compiler.Trigger(
                name="immutable_report_version",
                sql=pgtrigger.compiler.UpsertTriggerSql(
                    func="\n            declare\n                status text;\n            begin\n                select rel1.status into status\n                from \"erc\".\"report_version\" rel1\n                where rel1.id=coalesce(new.report_version_id, old.report_version_id)\n                limit 1;\n\n                if status='Submitted' then\n                    raise exception 'reportunit record is immutable after a report version has been submitted';\n                end if;\n\n                return coalesce(new, old);\n            end;\n            ",
                    hash="9e993701f8723493665db172956ca4c6c3241973",
                    operation="UPDATE OR INSERT OR DELETE",
                    pgid="pgtrigger_immutable_report_version_e7bf2",
                    table='erc"."report_unit',
                    when="BEFORE",
                ),
            ),
        ),
        pgtrigger.migrations.AddTrigger(
            model_name="reportverification",
            trigger=pgtrigger.compiler.Trigger(
                name="immutable_report_version",
                sql=pgtrigger.compiler.UpsertTriggerSql(
                    func="\n            declare\n                status text;\n            begin\n                select rel1.status into status\n                from \"erc\".\"report_version\" rel1\n                where rel1.id=coalesce(new.report_version_id, old.report_version_id)\n                limit 1;\n\n                if status='Submitted' then\n                    raise exception 'reportverification record is immutable after a report version has been submitted';\n                end if;\n\n                return coalesce(new, old);\n            end;\n            ",
                    hash="b035aee4eff4f2f0a2a3463c34f241af202c584b",
                    operation="UPDATE OR INSERT OR DELETE",
                    pgid="pgtrigger_immutable_report_version_8ea52",
                    table='erc"."report_verification',
                    when="BEFORE",
                ),
            ),
        ),
        pgtrigger.migrations.AddTrigger(
            model_name="reportverificationvisit",
            trigger=pgtrigger.compiler.Trigger(
                name="immutable_report_version",
                sql=pgtrigger.compiler.UpsertTriggerSql(
                    func='\n            declare\n                status text;\n            begin\n                select rel1.status into status\n                from "erc"."report_version" rel1\n                join "erc"."report_verification" rel2 on rel2.report_version_id=rel1.id\n                where rel2.id=coalesce(new.report_verification_id, old.report_verification_id)\n                limit 1;\n\n                if status=\'Submitted\' then\n                    raise exception \'reportverificationvisit record is immutable after a report version has been submitted\';\n                end if;\n\n                return coalesce(new, old);\n            end;\n            ',
                    hash="519116ecf6bafd894072e9996c4f8330039a4bf0",
                    operation="UPDATE OR INSERT OR DELETE",
                    pgid="pgtrigger_immutable_report_version_4239c",
                    table='erc"."report_verification_visit',
                    when="BEFORE",
                ),
            ),
        ),
        pgtrigger.migrations.AddTrigger(
            model_name="reportversion",
            trigger=pgtrigger.compiler.Trigger(
                name="no_delete_submitted_report_version",
                sql=pgtrigger.compiler.UpsertTriggerSql(
                    condition="WHEN (OLD.\"status\" = 'Submitted')",
                    func="RAISE EXCEPTION 'pgtrigger: Cannot delete rows from % table', TG_TABLE_NAME;",
                    hash="a303d54b84586cea3db14dc3f4e3d569a98c0d5e",
                    operation="DELETE",
                    pgid="pgtrigger_no_delete_submitted_report_version_8d743",
                    table='erc"."report_version',
                    when="BEFORE",
                ),
            ),
        ),
    ]
