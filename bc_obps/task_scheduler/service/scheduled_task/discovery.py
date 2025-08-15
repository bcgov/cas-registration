import importlib
import logging
import os
from typing import Dict, Any
from django.conf import settings
from .dataclass import ScheduledTaskConfig
from task_scheduler.utils.paths import get_function_path

logger = logging.getLogger(__name__)


class ScheduledTaskDiscovery:
    """Discovery by scanning for SCHEDULED_TASKS lists with ScheduledTaskConfig instances."""

    @classmethod
    def discover_all_tasks(cls) -> Dict[str, Dict[str, Any]]:
        """Discover all scheduled tasks from LOCAL_APPS."""
        discovered_tasks = {}

        for app_name in getattr(settings, 'LOCAL_APPS', []):
            app_tasks = cls.discover_app_tasks(app_name)
            discovered_tasks.update(app_tasks)

        return discovered_tasks

    @classmethod
    def discover_app_tasks(cls, app_name: str) -> Dict[str, Dict[str, Any]]:
        """Discover scheduled tasks from a specific app."""
        app_tasks: Dict[str, Dict[str, Any]] = {}
        # Construct app path from app name
        app_path = os.path.join(settings.BASE_DIR, app_name)
        if not os.path.exists(app_path):
            logger.warning(f"App directory '{app_path}' not found for app '{app_name}'")
            return app_tasks

        # Look for tasks.py in the app directory
        tasks_file = os.path.join(app_path, 'tasks.py')
        if os.path.exists(tasks_file):
            module_name = f"{app_name}.tasks"
            try:
                app_tasks.update(cls.import_tasks_module(module_name))
            except Exception as e:
                logger.error(f"Error importing {module_name}: {e}")

        return app_tasks

    @classmethod
    def import_tasks_module(cls, module_name: str) -> Dict[str, Dict[str, Any]]:
        """Import a tasks module and extract SCHEDULED_TASKS list with ScheduledTaskConfig instances."""
        try:
            module = importlib.import_module(module_name)

            if hasattr(module, 'SCHEDULED_TASKS'):
                scheduled_tasks = module.SCHEDULED_TASKS
                result = {}
                for task_config in scheduled_tasks:
                    if isinstance(task_config, ScheduledTaskConfig):
                        # Calculate function path when needed
                        function_path = get_function_path(task_config.func)
                        config = task_config.to_dict()
                        result[function_path] = config
                    else:
                        logger.warning(f"{module_name} contains non-ScheduledTaskConfig item: {type(task_config)}")
                return result
        except Exception as e:
            logger.error(f"Error importing {module_name}: {e}")
        return {}
