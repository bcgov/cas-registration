from django.core.cache import cache
from django.db.models import QuerySet
from registration.models import Activity
from registration.schema import ActivitySchemaOut


class ActivityDataAccessService:
    @classmethod
    def get_activities(cls) -> QuerySet[Activity]:
        cached_data: QuerySet[Activity] | None = cache.get("activities")
        if cached_data:
            return cached_data
        else:
            activities = Activity.objects.only(*ActivitySchemaOut.Meta.fields).order_by(
                "weight", "name"
            )
            cache.set("activities", activities, 60 * 60 * 24 * 1)
            return activities
