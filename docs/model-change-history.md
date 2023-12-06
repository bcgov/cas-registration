# Change History

We track change history for all our models with the [django-simple-history](https://django-simple-history.readthedocs.io/en/latest/) package.

## History Schema

An `erc_history` schema was created alongside the "live" `erc` schema to house all the history tables. Each `erc` model has a corresponding `<table>_history` table in the `erc_history` schema that tracks and timestamps all changes. These changes are a snapshot of the data as it was at the time the change to the data was made. This enables point in time diffing either in the app or in metabase.

