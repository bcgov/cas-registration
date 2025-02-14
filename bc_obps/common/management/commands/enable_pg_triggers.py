from django.core.management.base import BaseCommand
from django.db import connection

class Command(BaseCommand):
    help = "Enables all pgtrigger_set_updated_audit_columns_ triggers"

    def handle(self, *args, **options):
        self.stdout.write(self.style.WARNING("Enabling all pgtrigger_set_updated_audit_columns triggers..."))
        with connection.cursor() as cursor:
            cursor.execute(
                """
                do $$ 
                declare 
                    r record;
                begin 
                    for r in (
                        select trigger_schema, trigger_name, event_object_table 
                        from information_schema.triggers 
                        where trigger_name like 'pgtrigger_set_updated_audit_columns%'
                    ) 
                    loop 
                        execute format('alter table erc.%I enable trigger %I;', r.event_object_table, r.trigger_name);
                    end loop;
                end $$;
                """
            )
        self.stdout.write(self.style.SUCCESS("Successfully enabled all pgtrigger_set_updated_audit_columns triggers."))
