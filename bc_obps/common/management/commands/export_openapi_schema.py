import json
from pathlib import Path
from typing import Any

from django.core.management.base import BaseCommand, CommandError, CommandParser


class Command(BaseCommand):

    help = """Exports the django-ninja OpenAPI schema to a JSON file."""

    def add_arguments(self, parser: CommandParser) -> None:
        parser.add_argument(
            '--output',
            type=str,
            required=True,
            help="Path to write the OpenAPI JSON document to.",
        )
        parser.add_argument(
            '--check',
            action='store_true',
            help="Exit non-zero if the file on disk is out of date, without writing it.",
        )

    def handle(self, *args: Any, **options: Any) -> None:
        # Imported lazily so that Django app loading finishes before the routers
        # are walked.
        from bc_obps.api import api

        schema = api.get_openapi_schema()

        output = Path(options['output'])

        # sort_keys keeps the output stable across runs so the committed file only
        # changes when the API actually changes
        content = json.dumps(schema, indent=2, sort_keys=True) + "\n"

        if options['check']:
            current = output.read_text() if output.exists() else None
            if current != content:
                raise CommandError(
                    f"{output} is out of date. Run 'make generate_api_types' and commit the result."
                )
            self.stdout.write(self.style.SUCCESS(f"{output} is up to date"))
            return

        output.parent.mkdir(parents=True, exist_ok=True)
        output.write_text(content)

        self.stdout.write(self.style.SUCCESS(f"Wrote OpenAPI schema to {output}"))
