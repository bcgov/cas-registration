# -*- coding: utf-8 -*-
from dag_configuration import default_dag_args
from trigger_k8s_cronjob import trigger_k8s_cronjob
from airflow.operators.python_operator import PythonOperator
from datetime import datetime, timedelta
from airflow import DAG
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))
TWO_DAYS_AGO = datetime.now() - timedelta(days=2)
PROCESS_DUE_TRANSFERS_DAG_NAME = 'cas_bciers_process_due_transfer_events'
bciers_namespace = os.getenv('BCIERS_NAMESPACE')

default_args = {
    **default_dag_args,
    'start_date': TWO_DAYS_AGO
}

"""
###############################################################################
#                                                                             #
# DAG triggering cron job to process due transfers                            #
#                                                                             #
###############################################################################
"""


process_transfer_event_dag = DAG(PROCESS_DUE_TRANSFERS_DAG_NAME, schedule_interval='0 0 * * *',
    default_args=default_args, is_paused_upon_creation=False)

process_transfer_event = PythonOperator(
    python_callable=trigger_k8s_cronjob,
    task_id='process_transfer_event',
    op_args=['process-due-transfer-events', bciers_namespace],
    dag=process_transfer_event_dag)

process_transfer_event_dag
