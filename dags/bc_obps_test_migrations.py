from dag_configuration import default_dag_args
from trigger_k8s_cronjob import trigger_k8s_cronjob
from airflow.providers.cncf.kubernetes.operators.kubernetes_pod import (
    KubernetesPodOperator,
)
from airflow.operators.python_operator import PythonOperator
from datetime import datetime, timedelta
from airflow import DAG
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))
TWO_DAYS_AGO = datetime.now() - timedelta(days=2)
TEST_MIGRATIONS_DAG_NAME = "cas_bciers_test_migrations"
K8S_IMAGE = "alpine/k8s:1.29.15"
SERVICE_ACCOUNT_NAME = "airflow-deployer"

# Environment variables
DESTINATION_NAMESPACE = os.getenv("DESTINATION_NAMESPACE")
SOURCE_NAMESPACE = os.getenv("SOURCE_NAMESPACE")
if not DESTINATION_NAMESPACE or not SOURCE_NAMESPACE:
    raise ValueError("DESTINATION_NAMESPACE and SOURCE_NAMESPACE must be set")

HELM_OPTIONS = f"--atomic --wait-for-jobs --timeout 2400s --namespace {DESTINATION_NAMESPACE} --set sourceNamespace={SOURCE_NAMESPACE}"

# Postgres operator chart
POSTGRES_CHART_INSTANCE = os.getenv("POSTGRES_CHART_INSTANCE", "postgres-migration-test")
POSTGRES_CHART_SHORTNAME = os.getenv("POSTGRES_CHART_SHORTNAME", "pg-migration-test")
POSTGRES_CHART = "cas-registration/migration-test/cas-obps-postgres-migration-test"

# Backend chart
BACKEND_CHART_INSTANCE = os.getenv("BACKEND_CHART_INSTANCE", "backend-migration-test")
BACKEND_CHART_SHORTNAME = os.getenv("BACKEND_CHART_SHORTNAME", "be-migration-test")
BACKEND_CHART = "cas-registration/migration-test/cas-obps-backend-migration-test"

default_args = {**default_dag_args, "start_date": TWO_DAYS_AGO}

test_migrations_dag = DAG(
    TEST_MIGRATIONS_DAG_NAME,
    default_args=default_args,
    schedule_interval=None,
    catchup=False,
)


postgres_helm_install = KubernetesPodOperator(
    task_id="install_cas_obps_postgres_migration_test_chart",
    name="install_cas_obps_postgres_migration_test_chart",
    namespace=DESTINATION_NAMESPACE,
    service_account_name=SERVICE_ACCOUNT_NAME,
    image=K8S_IMAGE,
    cmds=["bash", "-c"],
    arguments=[
        "helm repo add cas-registration https://bcgov.github.io/cas-registration/ && "
        "helm repo update && "
        f"helm install {HELM_OPTIONS} {POSTGRES_CHART_INSTANCE} {POSTGRES_CHART}"
    ],
    get_logs=True,
    is_delete_operator_pod=True,
    dag=test_migrations_dag,
)

wait_for_postgres_restore = KubernetesPodOperator(
    task_id="wait_for_postgres_restore",
    name="wait_for_postgres_restore",
    namespace=DESTINATION_NAMESPACE,
    service_account_name=SERVICE_ACCOUNT_NAME,
    image=K8S_IMAGE,
    cmds=["bash", "-c"],
    arguments=[
        f"""
        timeout=600
        interval=10
        elapsed=0
        while [[ $elapsed -lt $timeout ]]; do
            ready=$(kubectl get postgrescluster {POSTGRES_CHART_SHORTNAME} -n {DESTINATION_NAMESPACE} -o json \
                | jq -r '.status.instances[] | select(.name=="pgha1") | select(.readyReplicas == 1 and .replicas == 1)')
            if [[ -n "$ready" ]]; then
                echo "PostgresCluster {POSTGRES_CHART_SHORTNAME} is ready."
                exit 0
            fi
            echo "Waiting for PostgresCluster to become ready..."
            sleep $interval
            elapsed=$((elapsed + interval))
        done
        echo "Timed out waiting for PostgresCluster readiness"
        exit 1
        """
    ],
    get_logs=True,
    is_delete_operator_pod=True,
    dag=test_migrations_dag,
)

trigger_postgres_migration_test_cronjob = PythonOperator(
    python_callable=trigger_k8s_cronjob,
    task_id="postgres_migration_test",
    op_args=["pg-migration-test-job", DESTINATION_NAMESPACE],
    dag=test_migrations_dag,
)

backend_helm_install = KubernetesPodOperator(
    task_id="install_cas_obps_backend_migration_test_chart",
    name="install_cas_obps_backend_migration_test_chart",
    namespace=DESTINATION_NAMESPACE,
    service_account_name=SERVICE_ACCOUNT_NAME,
    image=K8S_IMAGE,
    cmds=["bash", "-c"],
    arguments=[
        "helm repo add cas-registration https://bcgov.github.io/cas-registration/ && "
        "helm repo update && "
        f"helm install {HELM_OPTIONS} {BACKEND_CHART_INSTANCE} {BACKEND_CHART}"
    ],
    get_logs=True,
    is_delete_operator_pod=True,
    dag=test_migrations_dag,
)

wait_for_backend = KubernetesPodOperator(
    task_id="wait_for_backend",
    name="wait_for_backend",
    namespace=DESTINATION_NAMESPACE,
    service_account_name=SERVICE_ACCOUNT_NAME,
    image=K8S_IMAGE,
    cmds=["bash", "-c"],
    arguments=[
        f"""
        timeout=600
        interval=10
        elapsed=0
        while [[ $elapsed -lt $timeout ]]; do
            ready=$(kubectl get deployment {BACKEND_CHART_SHORTNAME}-backend -n {DESTINATION_NAMESPACE} -o json \
                | jq -r '.status.readyReplicas == .spec.replicas')
            if [[ -n "$ready" ]]; then
                echo "Deployment {BACKEND_CHART_SHORTNAME}-backend is ready."
                exit 0
            fi
            echo "Waiting for Deployment to become ready..."
            sleep $interval
            elapsed=$((elapsed + interval))
        done
        echo "Timed out waiting for Deployment readiness"
        exit 1
        """
    ],
    get_logs=True,
    is_delete_operator_pod=True,
    dag=test_migrations_dag,
)

trigger_backend_migration_test_cronjob = PythonOperator(
    python_callable=trigger_k8s_cronjob,
    task_id="backend_migration_test",
    op_args=["be-migration-test-job", DESTINATION_NAMESPACE],
    dag=test_migrations_dag,
)

uninstall_helm_charts = KubernetesPodOperator(
    task_id="uninstall_helm_charts",
    name="uninstall_helm_charts",
    namespace=DESTINATION_NAMESPACE,
    service_account_name=SERVICE_ACCOUNT_NAME,
    image=K8S_IMAGE,
    cmds=["bash", "-c"],
    arguments=[
        f"helm uninstall {POSTGRES_CHART_INSTANCE} -n {DESTINATION_NAMESPACE} && "
        f"helm uninstall {BACKEND_CHART_INSTANCE} -n {DESTINATION_NAMESPACE}"
    ],
    get_logs=True,
    is_delete_operator_pod=True,
    dag=test_migrations_dag,
)

(
    postgres_helm_install
    >> wait_for_postgres_restore
    >> trigger_postgres_migration_test_cronjob
    >> backend_helm_install
    >> wait_for_backend
    >> trigger_backend_migration_test_cronjob
    >> uninstall_helm_charts
)
