from dag_configuration import default_dag_args
from trigger_k8s_cronjob import trigger_k8s_cronjob
from airflow.providers.cncf.kubernetes.operators.job import KubernetesJobOperator
from airflow.providers.standard.operators.trigger_dagrun import TriggerDagRunOperator
from datetime import datetime, timezone
from airflow.sdk import dag, task
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))
RESET_DATA_DAG_NAME = "bc_obps_reset_data"
WAIT_FOR_BACKEND_ROLLOUT_DAG_NAME = "bc_obps_reset_data_wait_for_backend_rollout"
START_DATE = datetime(2025, 10, 1, tzinfo=timezone.utc)
SERVICE_ACCOUNT_NAME = "airflow-deployer"
BACKEND_DEPLOYMENT_NAME = "cas-bciers-backend"
K8S_IMAGE = "alpine/k8s:1.29.15"
BCIERS_NAMESPACE = os.getenv("BCIERS_NAMESPACE")

default_args = {**default_dag_args, "start_date": START_DATE}

RESET_DAG_DOC = """
DAG to reset the data in the BCIERS database to a freshly deployed state.

- **cycle_backend**: Whether to restart the backend deployment once the database has been wiped
"""


@dag(
    dag_id=RESET_DATA_DAG_NAME,
    schedule=None,  # This dag is intended to be run manually
    default_args=default_args,
    catchup=False,
    is_paused_upon_creation=False,
    doc_md=RESET_DAG_DOC,
    tags=['bciers'],
)
def reset_data(cycle_backend: bool = True):

    @task
    def reset_attachment_storage_task():
        trigger_k8s_cronjob("reset-attachment-storage", BCIERS_NAMESPACE)

    @task
    def reset_data_task():
        trigger_k8s_cronjob("reset-database", BCIERS_NAMESPACE)

    @task.short_circuit
    def should_cycle_backend(**context):
        return context["params"]["cycle_backend"]

    cycle_backend_pod_task = KubernetesJobOperator(
        task_id="cycle-backend-pod",
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
        task_id="trigger-wait-for-backend-rollout",
        trigger_dag_id=WAIT_FOR_BACKEND_ROLLOUT_DAG_NAME,
    )

    (
        [reset_attachment_storage_task(), reset_data_task()]
        >> should_cycle_backend()
        >> cycle_backend_pod_task
        >> trigger_wait_for_backend_rollout
    )


ROLLOUT_DAG_DOC = """
DAG to wait for the backend rollout to complete, then recreate the django superuser that was
dropped along with the database. Intended to be triggered after the DB reset.
"""


@dag(
    dag_id=WAIT_FOR_BACKEND_ROLLOUT_DAG_NAME,
    schedule=None,  # This dag is intended to be run manually
    default_args=default_args,
    is_paused_upon_creation=False,
    doc_md=ROLLOUT_DAG_DOC,
    tags=['bciers'],
)
def wait_for_backend_rollout():
    wait_for_backend_rollout_task = KubernetesJobOperator(
        task_id="wait-for-backend-rollout",
        name="wait-for-backend-rollout",
        namespace=BCIERS_NAMESPACE,
        service_account_name=SERVICE_ACCOUNT_NAME,
        image=K8S_IMAGE,
        cmds=["bash", "-c"],
        arguments=[f"kubectl rollout status deployment/{BACKEND_DEPLOYMENT_NAME} -n {BCIERS_NAMESPACE} --timeout=10m"],
        get_logs=True,
        wait_until_job_complete=True,
    )

    # Must run after the rollout completes, since it hits the backend over its route
    @task
    def add_django_admin_task():
        trigger_k8s_cronjob("add-django-admin", BCIERS_NAMESPACE)

    wait_for_backend_rollout_task >> add_django_admin_task()


reset_data()  # NOSONAR
wait_for_backend_rollout()  # NOSONAR
