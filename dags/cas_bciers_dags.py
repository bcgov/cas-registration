# -*- coding: utf-8 -*-
from dag_configuration import default_dag_args
from trigger_k8s_cronjob import trigger_k8s_cronjob
from datetime import timedelta, datetime, timezone
from airflow.decorators import dag, task
from airflow.models.dagrun import DagRun

import os
import sys

sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))
PROCESS_DUE_TRANSFERS_DAG_NAME = 'cas_bciers_process_due_transfer_events'
NIGHTLY_BUILD_DAG_NAME = "cas_bciers_nightly_build_report"
BCIERS_NAMESPACE = os.getenv('BCIERS_NAMESPACE')
TWO_DAYS_AGO = datetime.now(timezone.utc) - timedelta(days=2)

default_args = {**default_dag_args, 'start_date': TWO_DAYS_AGO}

PROCESS_DUE_DAG_DOC = """
DAG triggering cron job to process due transfers
"""


@dag(
    dag_id=PROCESS_DUE_TRANSFERS_DAG_NAME,
    schedule='0 8 * * *',
    default_args=default_args,
    is_paused_upon_creation=False,
    doc_md=PROCESS_DUE_DAG_DOC,
    tags=['bciers'],
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

NIGHTLY_BUILD_DAG_DOC = """
Dag reporting the status of the nightly CI workflow from GitHub.

The following parameters are available:

- **status**: The status of the nightly build. This will be set to `success` if the workflow completes successfully.
- **run_id**: The run ID of the nightly build. This will be set to the GitHub run ID.
"""


@dag(
    dag_id=NIGHTLY_BUILD_DAG_NAME,
    schedule=None,  # This dag is intended triggered
    default_args=default_args,
    is_paused_upon_creation=False,
    doc_md=NIGHTLY_BUILD_DAG_DOC,
    tags=['bciers'],
)
def nightly_build_report(
    status: str = None,
    run_id: str = None,
):
    @task(retries=0)
    def record_status(dag_run: DagRun):
        status = dag_run.conf["status"]
        if status != "success":
            run_id = dag_run.conf["run_id"]
            raise Exception(f"Nightly workflow resulted in failure. See workflow run {run_id} for details.")

    record_status()


nightly_build_report()  # NOSONAR
