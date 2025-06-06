from django.test import SimpleTestCase
import pgtrigger
import pytest
from reporting.models.triggers import immutable_report_version_trigger


class ImmutableReportVersionTriggerTest(SimpleTestCase):
    def test_generates_sql_properly_for_main_case(self):
        trigger = immutable_report_version_trigger()

        assert trigger.name == "immutable_report_version"
        assert trigger.operation.operations == (pgtrigger.Update, pgtrigger.Insert, pgtrigger.Delete)
        assert trigger.when == pgtrigger.Before
        assert (
            trigger.func.func
            == """
            declare
                status text;
            begin
                select rel1.status into status
                from "erc"."report_version" rel1
                where rel1.id=coalesce(new.report_version_id, old.report_version_id)
                limit 1;

                if status='Submitted' then
                    raise exception '{meta.model_name} record is immutable after a report version has been submitted';
                end if;

                return coalesce(new, old);
            end;
            """
        )

    def test_generates_sql_properly_for_custom_relation_path(self):
        trigger = immutable_report_version_trigger("some_intermediate_model__report_version")

        assert trigger.name == "immutable_report_version"
        assert trigger.operation.operations == (pgtrigger.Update, pgtrigger.Insert, pgtrigger.Delete)
        assert trigger.when == pgtrigger.Before
        assert (
            trigger.func.func
            == """
            declare
                status text;
            begin
                select rel1.status into status
                from "erc"."report_version" rel1
                join "erc"."some_intermediate_model" rel2 on rel2.report_version_id=rel1.id
                where rel2.id=coalesce(new.some_intermediate_model_id, old.some_intermediate_model_id)
                limit 1;

                if status='Submitted' then
                    raise exception '{meta.model_name} record is immutable after a report version has been submitted';
                end if;

                return coalesce(new, old);
            end;
            """
        )

    def test_fails_if_not_for_report_version(self):
        with pytest.raises(
            ValueError,
            match="The immutable report version trigger path should point at the erc.report_version table",
        ):
            immutable_report_version_trigger("random_model")
