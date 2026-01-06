from abc import ABC, abstractmethod
from typing import Any, Dict
from django.http import HttpRequest
from ..schemas import ScenarioPayload


class ScenarioHandler(ABC):
    @abstractmethod
    def execute(self, request: HttpRequest, data: ScenarioPayload) -> Dict[str, Any]:
        pass
