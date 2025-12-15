# -*- coding: utf-8 -*-
from dag_configuration import default_dag_args
from trigger_k8s_cronjob import trigger_k8s_cronjob
from datetime import timedelta, datetime, timezone
from airflow.decorators import dag, task
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))
PROCESS_DUE_TRANSFERS_DAG_NAME = 'cas_bciers_process_due_transfer_events'
BCIERS_NAMESPACE = os.getenv('BCIERS_NAMESPACE')
TWO_DAYS_AGO = datetime.now(timezone.utc) - timedelta(days=2)

default_args = {**default_dag_args, 'start_date': TWO_DAYS_AGO}

DAG_DOC = """
DAG triggering cron job to process due transfers
"""


@dag(
    dag_id=PROCESS_DUE_TRANSFERS_DAG_NAME,
    schedule='0 8 * * *',
    default_args=default_args,
    is_paused_upon_creation=False,
    doc_md=DAG_DOC,
)
def process_transfer_event():
    @task
    def process_due_transfers():
        trigger_k8s_cronjob(
            'process-due-transfer-events',
            BCIERS_NAMESPACE,
        )

    process_due_transfers()


process_transfer_event()  # NOSONAR
