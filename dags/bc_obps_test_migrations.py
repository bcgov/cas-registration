from dag_configuration import default_dag_args
from trigger_k8s_cronjob import trigger_k8s_cronjob
from airflow.providers.cncf.kubernetes.operators.job import KubernetesJobOperator
from airflow.providers.standard.sensors.time_delta import TimeDeltaSensor
from airflow.decorators import dag, task
from datetime import datetime, timedelta
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))
TWO_DAYS_AGO = datetime.now() - timedelta(days=2)
TEST_MIGRATIONS_DAG_NAME = "cas_bciers_test_migrations"
K8S_IMAGE = "alpine/k8s:1.29.15"
SERVICE_ACCOUNT_NAME = "airflow-deployer"
BCIERS_NAMESPACE = os.getenv("BCIERS_NAMESPACE")

# Postgres operator chart
POSTGRES_CHART_INSTANCE = os.getenv("POSTGRES_CHART_INSTANCE", "postgres-migration-test")
POSTGRES_CHART_SHORTNAME = os.getenv("POSTGRES_CHART_SHORTNAME", "pg-migration-test")
POSTGRES_CHART = "cas-registration/cas-obps-postgres-migration-test"

# Backend chart
BACKEND_CHART_INSTANCE = os.getenv("BACKEND_CHART_INSTANCE", "backend-migration-test")
BACKEND_CHART_SHORTNAME = os.getenv("BACKEND_CHART_SHORTNAME", "be-migration-test")
BACKEND_CHART = "cas-registration/cas-obps-backend-migration-test"
BACKEND_CHART_TAG = os.getenv("BACKEND_CHART_TAG")


default_args = {**default_dag_args, "start_date": TWO_DAYS_AGO}

DAG_DOC = """
DAG to test the database and backend migrations. This DAG will uninstall the helm charts after the tests are complete, but **if the tests fail, the charts will remain installed**.

The _time_delay_postgres_ (8 minutes) and _time_delay_backend_ (150 seconds) tasks are used to give the pods time to start up before initiating checks.

The following parameters are available:

- **destination_namespace**: The namespace to deploy the test charts into. This will ONLY work if the environment matches this Airflow instance.
- **source_namespace**: The namespace to use as the source of backups. Generally, this should be _'-prod'_.
- **backend_chart_tag**: The built image tag to pull within the backend chart (not the chart tag).
- **helm_options**: Helm install options, shouldn't need to be changed.
"""


@dag(
    dag_id=TEST_MIGRATIONS_DAG_NAME,
    default_args=default_args,
    schedule=None,
    catchup=False,
    is_paused_upon_creation=False,
    doc_md=DAG_DOC,
)
def test_migrations(
    destination_namespace: str = BCIERS_NAMESPACE,
    source_namespace: str = BCIERS_NAMESPACE,
    backend_chart_tag: str = "latest",
    helm_options: str = "--atomic --wait-for-jobs --timeout 2400s",
):
    @task
    def trigger_k8s_cronjob_with_params(job_name_template, **context):
        namespace = context["params"]["destination_namespace"]
        job_name = job_name_template.format(**context)
        trigger_k8s_cronjob(job_name, namespace)

    postgres_helm_install = KubernetesJobOperator(
        task_id="install_cas_obps_postgres_migration_test_chart",
        name="install-cas-obps-postgres-migration-test-chart",
        namespace="{{ params.destination_namespace }}",
        service_account_name=SERVICE_ACCOUNT_NAME,
        image=K8S_IMAGE,
        env_vars={"HOME": "/tmp"},  # nosec B108
        cmds=["bash", "-c"],
        arguments=[
            "helm repo add cas-registration https://bcgov.github.io/cas-registration/ && "
            "helm repo update && "
            "helm install {{ params.helm_options }} "
            "--namespace {{ params.destination_namespace }} "
            "--set sourceNamespace={{ params.source_namespace }} "
            "{{ params.postgres_chart_instance | default('postgres-migration-test') }} "
            "cas-registration/cas-obps-postgres-migration-test"
        ],
        get_logs=True,
        is_delete_operator_pod=True,
    )

    time_delay_postgres = TimeDeltaSensor(
        task_id="wait_time_before_postgres_initial_ready_check",
        delta=timedelta(minutes=8),
        doc_md="""Waits for 8 minutes before checking if the postgres pod is ready.""",
    )

    wait_for_postgres_restore = trigger_k8s_cronjob_with_params.override(task_id="wait_for_postgres_restore")(
        "pg-migration-test-wait-for-postgres-restore-job"
    )

    postgres_migration_test = trigger_k8s_cronjob_with_params.override(task_id="postgres_migration_test")(
        "pg-migration-test-job"
    )

    backend_helm_install = KubernetesJobOperator(
        task_id="install_cas_obps_backend_migration_test_chart",
        name="install-cas-obps-backend-migration-test-chart",
        namespace="{{ params.destination_namespace }}",
        service_account_name=SERVICE_ACCOUNT_NAME,
        image=K8S_IMAGE,
        env_vars={"HOME": "/tmp"},  # nosec B108
        cmds=["bash", "-c"],
        arguments=[
            "helm repo add cas-registration https://bcgov.github.io/cas-registration/ && "
            "helm repo update && "
            "helm install {{ params.helm_options }} "
            "--namespace {{ params.destination_namespace }} "
            "--set sourceNamespace={{ params.source_namespace }} "
            "{{ params.backend_chart_instance | default('backend-migration-test') }} "
            "cas-registration/cas-obps-backend-migration-test "
            "--set defaultImageTag={{ params.backend_chart_tag }}"
        ],
        get_logs=True,
        is_delete_operator_pod=True,
    )

    time_delay_backend = TimeDeltaSensor(
        task_id="wait_time_before_backend_initial_ready_check",
        delta=timedelta(seconds=150),
        doc_md="""Waits for 150 seconds (based on the initial ready check time set in the backend) before checking if the backend pod is ready.""",
    )

    wait_for_backend = trigger_k8s_cronjob_with_params.override(task_id="wait_for_backend")(
        "be-migration-test-wait-for-backend-job"
    )

    backend_migration_test = trigger_k8s_cronjob_with_params.override(task_id="backend_migration_test")(
        "be-migration-test-job"
    )

    uninstall_postgres_helm_charts = KubernetesJobOperator(
        task_id="uninstall_postgres_helm_charts",
        name="uninstall-postgres-helm-charts",
        namespace="{{ params.destination_namespace }}",
        service_account_name=SERVICE_ACCOUNT_NAME,
        image=K8S_IMAGE,
        cmds=["bash", "-c"],
        arguments=[
            "helm uninstall {{ params.postgres_chart_instance | default('postgres-migration-test') }} ",
            "--namespace {{ params.destination_namespace }}",
        ],
        get_logs=True,
        is_delete_operator_pod=True,
    )

    uninstall_backend_helm_charts = KubernetesJobOperator(
        task_id="uninstall_backend_helm_charts",
        name="uninstall-backend-helm-charts",
        namespace="{{ params.destination_namespace }}",
        service_account_name=SERVICE_ACCOUNT_NAME,
        image=K8S_IMAGE,
        cmds=["bash", "-c"],
        arguments=[
            "helm uninstall {{ params.backend_chart_instance | default('backend-migration-test') }} ",
            "--namespace {{ params.destination_namespace }}",
        ],
        get_logs=True,
        is_delete_operator_pod=True,
    )

    (
        postgres_helm_install
        >> time_delay_postgres
        >> wait_for_postgres_restore
        >> postgres_migration_test
        >> backend_helm_install
        >> time_delay_backend
        >> wait_for_backend
        >> backend_migration_test
        >> [uninstall_postgres_helm_charts, uninstall_backend_helm_charts]
    )


test_migrations()
