from dag_configuration import default_dag_args
from trigger_k8s_cronjob import trigger_k8s_cronjob
from airflow.providers.cncf.kubernetes.operators.job import KubernetesJobOperator
from airflow.providers.standard.operators.python import PythonOperator
from airflow.sdk import Param
from datetime import datetime, timedelta
from airflow import DAG
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))
TWO_DAYS_AGO = datetime.now() - timedelta(days=2)
TEST_MIGRATIONS_DAG_NAME = "cas_bciers_test_migrations"
K8S_IMAGE = "alpine/k8s:1.29.15"
SERVICE_ACCOUNT_NAME = "airflow-deployer"
bciers_namespace = os.getenv("BCIERS_NAMESPACE")

default_args = {**default_dag_args, "start_date": TWO_DAYS_AGO}

test_migrations_dag = DAG(
    TEST_MIGRATIONS_DAG_NAME,
    default_args=default_args,
    schedule=None,
    catchup=False,
    params={
        "destination_namespace": Param(
            bciers_namespace,
            type="string",
            description="The namespace to deploy the test charts into. This will ONLY work if the environment matches this Airflow instance.",
        ),
        "source_namespace": Param(
            bciers_namespace,
            type="string",
            description="The namespace to use as the source of backups. Generally, this should be '-prod'.",
        ),
        "backend_chart_tag": Param(
            "latest",
            type="string",
            description="The built image tag to pull within the backend chart (not the chart tag).",
        ),
        "helm_options": Param(
            "--atomic --wait-for-jobs --timeout 2400s",
            type="string",
            description="Helm install options, shouldn't need to be changed.",
        ),
    },
)

# Postgres operator chart
POSTGRES_CHART_INSTANCE = os.getenv("POSTGRES_CHART_INSTANCE", "postgres-migration-test")
POSTGRES_CHART_SHORTNAME = os.getenv("POSTGRES_CHART_SHORTNAME", "pg-migration-test")
POSTGRES_CHART = "cas-registration/cas-obps-postgres-migration-test"

# Backend chart
BACKEND_CHART_INSTANCE = os.getenv("BACKEND_CHART_INSTANCE", "backend-migration-test")
BACKEND_CHART_SHORTNAME = os.getenv("BACKEND_CHART_SHORTNAME", "be-migration-test")
BACKEND_CHART = "cas-registration/cas-obps-backend-migration-test"
BACKEND_CHART_TAG = os.getenv("BACKEND_CHART_TAG")


postgres_helm_install = KubernetesJobOperator(
    task_id="install_cas_obps_postgres_migration_test_chart",
    name="install_cas_obps_postgres_migration_test_chart",
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
    dag=test_migrations_dag,
)


def trigger_k8s_cronjob_with_params(job_name_template, **context):
    namespace = context["params"]["destination_namespace"]
    job_name = job_name_template.format(**context["params"])
    trigger_k8s_cronjob(job_name, namespace)


trigger_wait_for_postgres_restore = PythonOperator(
    python_callable=trigger_k8s_cronjob_with_params,
    task_id="wait_for_postgres_restore",
    op_args=["pg-migration-test-wait-for-postgres-restore-job"],
    dag=test_migrations_dag,
)

trigger_postgres_migration_test_cronjob = PythonOperator(
    python_callable=trigger_k8s_cronjob_with_params,
    task_id="postgres_migration_test",
    op_args=["pg-migration-test-job"],
    dag=test_migrations_dag,
)

backend_helm_install = KubernetesJobOperator(
    task_id="install_cas_obps_backend_migration_test_chart",
    name="install_cas_obps_backend_migration_test_chart",
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
    dag=test_migrations_dag,
)

trigger_wait_for_backend = PythonOperator(
    python_callable=trigger_k8s_cronjob_with_params,
    task_id="wait_for_backend",
    op_args=["be-migration-test-wait-for-backend-job"],
    dag=test_migrations_dag,
)

trigger_backend_migration_test_cronjob = PythonOperator(
    python_callable=trigger_k8s_cronjob_with_params,
    task_id="backend_migration_test",
    op_args=["be-migration-test-job"],
    dag=test_migrations_dag,
)

uninstall_helm_charts = KubernetesJobOperator(
    task_id="uninstall_helm_charts",
    name="uninstall_helm_charts",
    namespace="{{ params.destination_namespace }}",
    service_account_name=SERVICE_ACCOUNT_NAME,
    image=K8S_IMAGE,
    cmds=["bash", "-c"],
    arguments=[
        f"helm uninstall {POSTGRES_CHART_INSTANCE} -n {{ params.destination_namespace }} && "
        f"helm uninstall {BACKEND_CHART_INSTANCE} -n {{ params.destination_namespace }}"
    ],
    get_logs=True,
    is_delete_operator_pod=True,
    dag=test_migrations_dag,
)

(
    postgres_helm_install
    >> trigger_wait_for_postgres_restore
    >> trigger_postgres_migration_test_cronjob
    >> backend_helm_install
    >> trigger_wait_for_backend
    >> trigger_backend_migration_test_cronjob
    >> uninstall_helm_charts
)
