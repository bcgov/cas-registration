from dag_configuration import default_dag_args
from trigger_k8s_cronjob import trigger_k8s_cronjob
from airflow.providers.cncf.kubernetes.operators.job import KubernetesJobOperator
from airflow.providers.standard.operators.trigger_dagrun import TriggerDagRunOperator
from datetime import datetime, timedelta, timezone
from airflow.decorators import dag, task
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))
RESET_DATA_DAG_NAME = "bc_obps_reset_data"
WAIT_FOR_BACKEND_ROLLOUT_DAG_NAME = "bc_obps_reset_data_wait_for_backend_rollout"
TWO_DAYS_AGO = datetime.now(timezone.utc) - timedelta(days=2)
SERVICE_ACCOUNT_NAME = "airflow-deployer"
BACKEND_DEPLOYMENT_NAME = "cas-bciers-backend"
K8S_IMAGE = "alpine/k8s:1.29.15"
BCIERS_NAMESPACE = os.getenv("BCIERS_NAMESPACE")

default_args = {**default_dag_args}

RESET_DAG_DOC = """
DAG to reset the data in the BCIERS database to a freshly deployed state.
"""


@dag(
    dag_id=RESET_DATA_DAG_NAME,
    schedule=None,  # This dag is intended to be run manually
    default_args=default_args,
    is_paused_upon_creation=False,
    doc_md=RESET_DAG_DOC,
)
def reset_data():

    @task
    def reset_attachment_storage_task():
        trigger_k8s_cronjob('reset-attachment-storage', BCIERS_NAMESPACE)

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

    # Triggers a check to see if the backend rollout has completed, but does not block the helm release use of the DAG
    trigger_wait_for_backend_rollout = TriggerDagRunOperator(
        task_id="trigger_wait_for_backend_rollout",
        trigger_dag_id=WAIT_FOR_BACKEND_ROLLOUT_DAG_NAME,
    )

    reset_data_task >> cycle_backend_pod_task >> trigger_wait_for_backend_rollout
    reset_attachment_storage_task >> cycle_backend_pod_task


ROLLOUT_DAG_DOC = """
DAG to wait for the backend rollout to complete. Intended to be triggered after the DB reset.
"""


@dag(
    dag_id=WAIT_FOR_BACKEND_ROLLOUT_DAG_NAME,
    schedule=None,  # This dag is intended to be run manually
    default_args=default_args,
    is_paused_upon_creation=False,
    doc_md=ROLLOUT_DAG_DOC,
)
def wait_for_backend_rollout():
    wait_for_backend_rollout_task = KubernetesJobOperator(
        task_id="wait_for_backend_rollout",
        name="wait-for-backend-rollout",
        namespace=BCIERS_NAMESPACE,
        service_account_name=SERVICE_ACCOUNT_NAME,
        image=K8S_IMAGE,
        cmds=["bash", "-c"],
        arguments=[f"kubectl rollout status deployment/{BACKEND_DEPLOYMENT_NAME} -n {BCIERS_NAMESPACE} --timeout=10m"],
        get_logs=True,
        wait_until_job_complete=True,
    )

    wait_for_backend_rollout_task  # NOSONAR


reset_data()  # NOSONAR
wait_for_backend_rollout()  # NOSONAR
