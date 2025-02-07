from typing import Iterator
import pgtrigger


def get_sql_relation_alias_generator() -> Iterator[str]:
    i = 0
    while True:
        i += 1
        yield f"rel{str(i)}"


def immutable_report_version_trigger(
    orm_path_to_version: str = "report_version",
) -> pgtrigger.Trigger:
    """
    Function to generate an immutable report version trigger based on a django-style traversal path.

    Default argument assumes a single-step foreign key to the report_version table.
    """

    if not orm_path_to_version.endswith("report_version"):
        raise ValueError("The immutable report version trigger path should point at the erc.report_version table")

    relation_alias_generator = get_sql_relation_alias_generator()

    relations = [
        *[(table, next(relation_alias_generator)) for table in reversed(orm_path_to_version.split("__"))],
        ("current_table", next(relation_alias_generator)),
    ]

    sql = ""

    for index, relation in enumerate(relations):
        (prev_table, prev_rel_id) = relations[index - 1] if index > 0 else (None, None)
        (table, rel_id) = relation

        if index == 0:
            sql += f"""
                select {rel_id}.status into status
                from "erc"."{table}" {rel_id}
            """
        elif index == len(relations) - 1:
            # Leaving {meta.db_table} in the func template will let django-pgtrigger reflect which one is the current table
            # when building the trigger, instead of having the user need to specify it
            #
            # https://django-pgtrigger.readthedocs.io/en/4.13.3/cookbook/#model-properties-in-the-func

            sql += f"""
                join "{{meta.db_table}}" {rel_id} on {rel_id}.{prev_table}_id={prev_rel_id}.id
                where {rel_id}.id=new.id
            """
        else:
            sql += f"""
                join "erc"."{table}" {rel_id} on {rel_id}.{prev_table}_id={prev_rel_id}.id
            """

    return pgtrigger.Trigger(
        name="immutable_report_version",
        operation=pgtrigger.Update,
        when=pgtrigger.Before,
        func=pgtrigger.Func(
            """
            declare
                status text;
            begin
            """
            + sql
            + """
                limit 1;

                if status='Submitted' then
                    raise exception '{meta.model_name} record is immutable after a report version has been submitted';
                end if;

                return new;
            end;
            """
        ),
    )
