from django.test import SimpleTestCase
import pgtrigger
import pytest
from reporting.models.triggers import immutable_report_version_trigger, no_overlapping_configuration_records_trigger


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


class NoOverlappingConfigurationRecordsTriggerTest(SimpleTestCase):
    def test_generates_sql_without_additional_filters(self):
        trigger = no_overlapping_configuration_records_trigger(message="test message")

        assert trigger.name == "no_overlapping_configuration_records"
        assert trigger.operation.operations == (pgtrigger.Insert, pgtrigger.Update)
        assert trigger.when == pgtrigger.Before
        assert trigger.func.func == (
            """
        declare
            new_valid_from date;
            new_valid_to date;
        begin
            select valid_from into new_valid_from
            from "erc"."configuration" where id = new.valid_from_id;

            select valid_to into new_valid_to
            from "erc"."configuration" where id = new.valid_to_id;

            if exists (
                select 1
                from "{meta.db_table}" t
                join "erc"."configuration" cf on cf.id = t.valid_from_id
                join "erc"."configuration" ct on ct.id = t.valid_to_id
                where t.activity_id = new.activity_id
        """
            + """          and (tg_op = 'INSERT' or t.id != old.id)
                  and new_valid_from <= ct.valid_to
                  and new_valid_to >= cf.valid_from
            ) then
                raise exception 'test message', new_valid_from, new_valid_to;
            end if;

            return new;
        end;
        """
        )

    def test_generates_sql_with_single_additional_filter(self):
        trigger = no_overlapping_configuration_records_trigger(
            message="test message", additional_filters=["source_type"]
        )

        assert trigger.func.func == (
            """
        declare
            new_valid_from date;
            new_valid_to date;
        begin
            select valid_from into new_valid_from
            from "erc"."configuration" where id = new.valid_from_id;

            select valid_to into new_valid_to
            from "erc"."configuration" where id = new.valid_to_id;

            if exists (
                select 1
                from "{meta.db_table}" t
                join "erc"."configuration" cf on cf.id = t.valid_from_id
                join "erc"."configuration" ct on ct.id = t.valid_to_id
                where t.activity_id = new.activity_id
        """
            + "  and t.source_type_id = new.source_type_id\n"
            + """          and (tg_op = 'INSERT' or t.id != old.id)
                  and new_valid_from <= ct.valid_to
                  and new_valid_to >= cf.valid_from
            ) then
                raise exception 'test message', new_valid_from, new_valid_to;
            end if;

            return new;
        end;
        """
        )

    def test_generates_sql_with_multiple_additional_filters(self):
        trigger = no_overlapping_configuration_records_trigger(
            message="test message", additional_filters=["source_type", "gas_type", "methodology"]
        )

        assert trigger.func.func == (
            """
        declare
            new_valid_from date;
            new_valid_to date;
        begin
            select valid_from into new_valid_from
            from "erc"."configuration" where id = new.valid_from_id;

            select valid_to into new_valid_to
            from "erc"."configuration" where id = new.valid_to_id;

            if exists (
                select 1
                from "{meta.db_table}" t
                join "erc"."configuration" cf on cf.id = t.valid_from_id
                join "erc"."configuration" ct on ct.id = t.valid_to_id
                where t.activity_id = new.activity_id
        """
            + "  and t.source_type_id = new.source_type_id\n"
            + "  and t.gas_type_id = new.gas_type_id\n"
            + "  and t.methodology_id = new.methodology_id\n"
            + """          and (tg_op = 'INSERT' or t.id != old.id)
                  and new_valid_from <= ct.valid_to
                  and new_valid_to >= cf.valid_from
            ) then
                raise exception 'test message', new_valid_from, new_valid_to;
            end if;

            return new;
        end;
        """
        )
