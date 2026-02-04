from typing import Self
from service.activity_service import ActivityService


class ApplicableActivitiesMixin:
    response: dict

    def applicable_activities(self, version_id: int) -> Self:
        applicable_activities = ActivityService.get_applicable_activities(version_id)

        self.response["applicable_activities"] = applicable_activities

        return self
