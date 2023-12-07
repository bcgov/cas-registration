import argparse
import subprocess  # nosec
import os
import pandas as pd
from pathlib import Path


table_mapping = [
    {
        'filename': './tmp/organisation.csv',
        'obps_table_name': 'reg_organization',
        'columns': {
            'swrs_organisation_id': 'swrs_org_id',
            'business_legal_name': 'business_legal_name',
            'french_trade_name': 'french_trade_name',
            'english_trade_name': 'english_trade_name',
            'cra_business_number': 'cra_business_number',
        },
    },
    {
        'filename': './tmp/facility.csv',
        'obps_table_name': 'reg_facility',
        'columns': {
            'swrs_facility_id': 'swrs_facility_id',
            'facility_name': 'facility_name',
            'facility_type': 'facility_type',
            'latitude': 'latitude',
            'longitude': 'longitude',
            'organisation_id': 'organization_id_id',
        },
    },
]


def csv_migrate_column_names():
    new_files = []
    for tabledata in table_mapping:
        usecols = [original_colname for original_colname in tabledata['columns'].keys()]
        usecols.append('id')
        df = pd.read_csv(tabledata['filename'], index_col='id', usecols=usecols)
        df.rename(columns=tabledata['columns'], inplace=True)
        df.insert(loc=len(df.columns), column='status', value='pending')
        new_filepath = os.path.join(Path.cwd(), 'tmp/{}.csv'.format(tabledata['obps_table_name']))
        df.to_csv(new_filepath)
        print('Wrote modified data to {}'.format(new_filepath))
        new_files.append(new_filepath)
    return new_files


def copy_data_from_csvs(database, csvs):
    print('running postgres copy...')

    for csv in csvs:
        tablename = csv.split('/')[-1]
        tablename = tablename[:-4]

        df = pd.read_csv(csv)
        ordered_list_of_columns = list(df.columns)
        column_names = ', '.join([str(item) for item in ordered_list_of_columns])

        sql_cmd = '"copy {tablename}({columns}) from \'{csv}\' DELIMITER \',\' csv header"\n'.format(
            tablename=tablename, columns=column_names, csv=csv
        )
        cmd = 'psql -d {database} -c {sql_cmd}'.format(database=database, sql_cmd=sql_cmd)
        process = subprocess.Popen(cmd, shell=True, stdout=subprocess.PIPE)  # nosec
        result = process.communicate()
        print(str(result))


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('-d', '--database', help='Name of local database to copy data into', required=True)
    args = parser.parse_args()
    database = args.database

    csvs = csv_migrate_column_names()
    copy_data_from_csvs(database, csvs)


if __name__ == '__main__':
    main()
