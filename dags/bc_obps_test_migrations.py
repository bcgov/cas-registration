from dag_configuration import default_dag_args
from airflow.providers.cncf.kubernetes.operators.kubernetes_pod import (
    KubernetesPodOperator,
)
from datetime import datetime, timedelta
from airflow import DAG
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))
TWO_DAYS_AGO = datetime.now() - timedelta(days=2)
TEST_MIGRATIONS_DAG_NAME = "cas-_bciers_test_migrations"

# Environment variables
DESTINATION_NAMESPACE = os.getenv("DESTINATION_NAMESPACE")
SOURCE_NAMESPACE = os.getenv("SOURCE_NAMESPACE")
CHART_INSTANCE = os.getenv("CHART_INSTANCE", "postgres-migration-test")
if not DESTINATION_NAMESPACE or not SOURCE_NAMESPACE:
    raise ValueError("DESTINATION_NAMESPACE and SOURCE_NAMESPACE must be set")

HELM_OPTIONS = f"--atomic --wait-for-jobs --timeout 2400s --namespace {DESTINATION_NAMESPACE} --set sourceNamespace={SOURCE_NAMESPACE}"

default_args = {**default_dag_args, "start_date": TWO_DAYS_AGO}

test_migrations_dag = DAG(
    TEST_MIGRATIONS_DAG_NAME,
    default_args=default_args,
    schedule_interval=None,
    catchup=False,
)

CHART = "cas-registration/migration-test/cas-obps-postgres-migration-test"

helm_install = KubernetesPodOperator(
    task_id="install_cas_obps_postgres_migration_test_chart",
    name="install_cas_obps_postgres_migration_test_chart",
    namespace=DESTINATION_NAMESPACE,
    image="alpine/k8s:1.29.15",
    cmds=["bash", "-c"],
    arguments=[
        "helm repo add cas-registration https://bcgov.github.io/cas-registration/ && "
        "helm repo update && "
        f"helm install {HELM_OPTIONS} {CHART_INSTANCE} {CHART}"
    ],
    get_logs=True,
    is_delete_operator_pod=True,
    dag=test_migrations_dag,
)

helm_install_dag
