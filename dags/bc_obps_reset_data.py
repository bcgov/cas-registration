from dag_configuration import default_dag_args
from trigger_k8s_cronjob import trigger_k8s_cronjob
from airflow.providers.standard.operators.python import PythonOperator
from airflow.providers.cncf.kubernetes.operators.job import KubernetesJobOperator
from datetime import datetime, timedelta, timezone
from airflow.sdk import dag
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))
RESET_DATA_DAG_NAME = "bc_obps_reset_data"
TWO_DAYS_AGO = datetime.now(timezone.utc) - timedelta(days=2)
SERVICE_ACCOUNT_NAME = "airflow-deployer"
BACKEND_DEPLOYMENT_NAME = "cas-bciers-backend"
K8S_IMAGE = "alpine/k8s:1.29.15"
bciers_namespace = os.getenv("BCIERS_NAMESPACE")

default_args = {**default_dag_args}


@dag(
    dag_id=RESET_DATA_DAG_NAME,
    schedule=None,  # This dag is intended to be run manually
    default_args=default_args,
    is_paused_upon_creation=False,
)
def reset_data():
    """
    DAG to reset the data in the BCIERS database to a freshly deployed state.
    """

    reset_data_task = PythonOperator(
        task_id="reset_data_task",
        python_callable=trigger_k8s_cronjob,
        op_args=['reset-database', bciers_namespace],
    )

    cycle_backend_pod_task = KubernetesJobOperator(
        task_id="cycle_backend_pod",
        name="cycle-backend-pod",
        namespace=bciers_namespace,
        service_account_name=SERVICE_ACCOUNT_NAME,
        image=K8S_IMAGE,
        cmds=["bash", "-c"],
        arguments=["kubectl rollout restart deployment/{BACKEND_DEPLOYMENT_NAME} -n {bciers_namespace}"],
        get_logs=True,
    )

    reset_data_task >> cycle_backend_pod_task


reset_data()  # NOSONAR
