import os
from typing import Literal
import sentry_sdk
from sentry_sdk.integrations.django import DjangoIntegration


def configure_error_tracking(
    environment: Literal['local', 'CI', 'dev', 'test', 'prod'] | str | None,
) -> bool:
    """
    Configure Sentry error tracking for prod and test environments.

    Args:
        environment: The ENVIRONMENT variable value (e.g., 'local', 'dev', 'test', 'prod')

    Returns:
        ENABLE_SENTRY flag
    """
    sentry_environment = os.environ.get('SENTRY_ENVIRONMENT')
    sentry_trace_sample_rate = os.environ.get('SENTRY_TRACE_SAMPLE_RATE')
    enable_sentry = sentry_environment in ['prod', 'test']

    if enable_sentry:
        # Map environment values to maintain backward compatibility with existing Sentry issues
        environment_mapping = {'prod': 'production', 'test': 'test'}
        mapped_environment = environment_mapping.get(sentry_environment, sentry_environment)  # type: ignore[arg-type]

        sentry_dsn = "https://cf402cd8318aab5c911728a16cbf8fcc@o646776.ingest.sentry.io/4506624068026368"

        sentry_sdk.init(
            dsn=sentry_dsn,
            integrations=[DjangoIntegration()],
            traces_sample_rate=float(sentry_trace_sample_rate) if sentry_trace_sample_rate is not None else 0,
            environment=mapped_environment,
        )

    return enable_sentry
