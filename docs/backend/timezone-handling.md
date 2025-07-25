# Overview

The BCIERS application follows a **UTC-first** approach for all timestamp storage and processing. This ensures consistency, prevents timezone-related bugs, and follows international standards for database design.

## Backend (Django) Configuration

### Settings

The Django application is configured in `bc_obps/bc_obps/settings.py`:

```python
TIME_ZONE = "UTC"
USE_TZ = True
```

### Key Implications

- `timezone.now()` returns UTC timestamps
- All `DateTimeField` values are timezone-aware and stored in UTC
- Django automatically handles timezone conversions when needed

### Best Practices

#### Always Use Timezone-Aware Datetimes

```python
# ✅ Good - timezone-aware
from django.utils import timezone
current_time = timezone.now()

# ❌ Bad - naive datetime
from datetime import datetime
current_time = datetime.now()
```

## Frontend Handling

### Timezone Conversion

The frontend converts UTC timestamps to the user's local timezone (typically Pacific Time for BC users) for display:

```typescript
// From bciers/libs/utils/src/formatTimestamp.ts
const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp).toLocaleString("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "America/Vancouver",
  });

  const timeWithTimeZone = new Date(timestamp).toLocaleString("en-CA", {
    hour: "numeric",
    minute: "numeric",
    timeZoneName: "short",
    timeZone: "America/Vancouver",
  });

  return `${date}\n${timeWithTimeZone}`;
};
```

## Querying Database

When querying the database directly (e.g., in Metabase, SQL queries, debugging):

1. **Remember you're seeing UTC times**: A timestamp showing `2024-01-15 22:00:00` is 10:00 PM UTC, which is 2:00 PM Pacific Time
2. **Use timezone functions for local time**: PostgreSQL's `AT TIME ZONE` function can convert UTC to local time
3. **Be consistent**: Always work in UTC for data processing, convert only for display

## Common Scenario

### User Submits Form at 2:00 PM Pacific Time

**What happens:**

- Frontend captures: `2024-01-15T14:00:00-08:00` (Pacific Time)
- Backend receives: `2024-01-15T22:00:00Z` (UTC)
- Database stores: `2024-01-15 22:00:00+00:00`
- Frontend displays: "Jan 15, 2024 2:00 PM PST"

## References

- [Django Timezone Documentation](https://docs.djangoproject.com/en/stable/topics/i18n/timezones/)
- [PostgreSQL Timezone Functions](https://www.postgresql.org/docs/current/functions-datetime.html#FUNCTIONS-DATETIME-ZONECONVERT)
