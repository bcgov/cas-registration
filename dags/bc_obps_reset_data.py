from dag_configuration import default_dag_args
from trigger_k8s_cronjob import trigger_k8s_cronjob
from airflow.providers.cncf.kubernetes.operators.job import KubernetesJobOperator
from datetime import datetime, timedelta, timezone
from airflow.decorators import dag, task
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))
RESET_DATA_DAG_NAME = "bc_obps_reset_data"
TWO_DAYS_AGO = datetime.now(timezone.utc) - timedelta(days=2)
SERVICE_ACCOUNT_NAME = "airflow-deployer"
BACKEND_DEPLOYMENT_NAME = "cas-bciers-backend"
K8S_IMAGE = "alpine/k8s:1.29.15"
BCIERS_NAMESPACE = os.getenv("BCIERS_NAMESPACE")

default_args = {**default_dag_args}

DAG_DOC = """
DAG to reset the data in the BCIERS database to a freshly deployed state.
"""


@dag(
    dag_id=RESET_DATA_DAG_NAME,
    schedule=None,  # This dag is intended to be run manually
    default_args=default_args,
    is_paused_upon_creation=False,
    doc_md=DAG_DOC,
)
def reset_data():
    @task
    def reset_data_task():
        trigger_k8s_cronjob('reset-database', BCIERS_NAMESPACE)

    cycle_backend_pod_task = KubernetesJobOperator(
        task_id="cycle_backend_pod",
        name="cycle-backend-pod",
        namespace=BCIERS_NAMESPACE,
        service_account_name=SERVICE_ACCOUNT_NAME,
        image=K8S_IMAGE,
        cmds=["bash", "-c"],
        arguments=[f"kubectl rollout restart deployment/{BACKEND_DEPLOYMENT_NAME} -n {BCIERS_NAMESPACE}"],
        get_logs=True,
    )

    wait_for_backend_rollout = KubernetesJobOperator(
        task_id="wait_for_backend_rollout",
        name="wait-for-backend-rollout",
        namespace=BCIERS_NAMESPACE,
        service_account_name=SERVICE_ACCOUNT_NAME,
        image=K8S_IMAGE,
        cmds=["bash", "-c"],
        arguments=[f"kubectl rollout status deployment/{BACKEND_DEPLOYMENT_NAME} -n {BCIERS_NAMESPACE}"],
        get_logs=True,
        wait_until_job_complete=True,
    )

    reset_data_task() >> cycle_backend_pod_task >> wait_for_backend_rollout


reset_data()  # NOSONAR
