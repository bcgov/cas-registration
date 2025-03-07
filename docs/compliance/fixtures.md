# Compliance Fixtures

This document describes the fixture data for the compliance module.

## Compliance Periods

Compliance periods are seeded through migrations rather than created dynamically in code. This approach allows for consistent data across environments.

### Adding New Compliance Periods

To add new compliance periods:

1. Update the `compliance_periods.json` fixture file in the `mock` directory
2. Create a new migration to load the updated fixture:

```python
# Example migration
from django.db import migrations

def update_compliance_periods(apps, schema_editor):
    from django.core.management import call_command
    call_command('loaddata', 'compliance/fixtures/mock/compliance_periods.json')

class Migration(migrations.Migration):
    dependencies = [
        ('compliance', '0002_seed_compliance_periods'),  # Update with the latest migration
    ]

    operations = [
        migrations.RunPython(update_compliance_periods),
    ]
```

### Fixture Format

The compliance period fixture follows this format:

```json
[
  {
    "model": "compliance.complianceperiod",
    "pk": 1,
    "fields": {
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z",
      "start_date": "2023-01-01",
      "end_date": "2023-12-31",
      "compliance_deadline": "2024-06-30",
      "reporting_year": 2023
    }
  }
]
```

Special cases, such as different deadlines or date ranges, can be handled by adjusting the values in the fixture.
