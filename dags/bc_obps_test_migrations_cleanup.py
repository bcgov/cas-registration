from dag_configuration import default_dag_args
from airflow.providers.cncf.kubernetes.operators.job import KubernetesJobOperator
from airflow.sdk import dag
from datetime import datetime, timezone
import os

START_DATE = datetime(2025, 6, 1, tzinfo=timezone.utc)
default_args = {**default_dag_args, "start_date": START_DATE}

## BCIERS setup
K8S_IMAGE = "alpine/k8s:1.29.15"
BCIERS_NAMESPACE = os.getenv("BCIERS_NAMESPACE")
SERVICE_ACCOUNT_NAME = "airflow-deployer"


## DAG templates and setup
DESTINATION_NAMESPACE_TEMPLATE = "{{ params.destination_namespace }}"
CLEANUP_DAG_DOC = """
Uninstalls the helm charts and cluster resources installed by the test migrations DAG.

This will be called automatically by the test migrations DAG on success, but can be triggered manually
after investigation of a failed `test_migrations` DAG run.
"""


@dag(
    dag_id="cas_bciers_test_migrations_cleanup",
    default_args=default_args,
    schedule=None,
    catchup=False,
    is_paused_upon_creation=False,
    doc_md=CLEANUP_DAG_DOC,
    tags=["bciers"],
)
def test_migrations_cleanup(
    destination_namespace: str = BCIERS_NAMESPACE,
    backend_chart_tag: str = "latest",
):
    uninstall_postgres_helm_charts = KubernetesJobOperator(
        task_id="uninstall-postgres-helm-charts",
        name="uninstall-postgres-helm-charts",
        namespace=DESTINATION_NAMESPACE_TEMPLATE,
        service_account_name=SERVICE_ACCOUNT_NAME,
        image=K8S_IMAGE,
        cmds=["bash", "-c"],
        arguments=[
            "helm uninstall {{ params.postgres_chart_instance | default('postgres-migration-test') }} ",
            "--namespace {{ params.destination_namespace }}",
        ],
        get_logs=True,
        is_delete_operator_pod=True,
        wait_until_job_complete=True,
        backoff_limit=2,
    )

    uninstall_backend_helm_charts = KubernetesJobOperator(
        task_id="uninstall-backend-helm-charts",
        name="uninstall-backend-helm-charts",
        namespace=DESTINATION_NAMESPACE_TEMPLATE,
        service_account_name=SERVICE_ACCOUNT_NAME,
        image=K8S_IMAGE,
        cmds=["bash", "-c"],
        arguments=[
            "helm uninstall {{ params.backend_chart_instance | default('backend-migration-test') }} ",
            "--namespace {{ params.destination_namespace }}",
        ],
        get_logs=True,
        is_delete_operator_pod=True,
        wait_until_job_complete=True,
        backoff_limit=2,
    )

    [uninstall_postgres_helm_charts, uninstall_backend_helm_charts]


test_migrations_cleanup()
