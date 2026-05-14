# Data Models

This document outlines the data models used in the backend of the OBPS application. The data models are implemented using Django's Object-Relational Mapping (ORM) system, which allows us to define the data models as Python classes. The data models are stored in the `models` file within each Django app.

Common data models used in the OBPS application are located in the `bc_obps/common/models.py` file.

## Email Notifications

Email notifications are an essential part of the application's communication strategy. They provide users with important information, updates, and alerts. We use CHES (Common Hosted Email Service) to send email notifications to users.

If you want to send emails locally, you need to set up CHES credentials in your environment variables. You can find the required CHES credentials in the 1Password document `OBPS backend ENV`. (Comment them out to stop sending emails.)

You also need to set up the `EmailService` singleton object (like `email_service = EmailService()`) in the `.py` file to access the `EmailService` object.

## Audit Trail Implementation

Within our Django application, we employ the `TimeStampedModel` abstract data model to integrate audit columns into our various models. This model resides in `bc_obps/registration/models.py` and serves as the foundation for all data models requiring audit trails. It incorporates the following columns:

`created_at`: Captures the timestamp when an object is initially created.
`created_by`: Records the creator of the object.
`updated_at`: Indicates the timestamp of the object's last update.
`updated_by`: Stores the user who last modified the object.
`archived_at`: Documents the timestamp when an object is archived.
`archived_by`: Registers the user who initiated the archiving process.

The pg-triggers to set the created_at/by & updated_at/by values are defined in the Meta object of the `TimestampedModel`. The Meta object must also be inherited in order for these triggers to be applied to the child models. This can be done like so in the child model definition: `Meta(TimestampedModel.Meta):`.

This data model is equipped with an archive method:

`set_archive`: Specifically designed for archiving objects, this method captures the archival details and requires the user initiating the archival process as a parameter.

Furthermore, a custom manager (`TimeStampedModelManager`) is implemented to filter out archived objects, ensuring a streamlined retrieval process focused only on active data.

**Note:** Every data model that inherits from `TimeStampedModel` will automatically have the audit columns and methods integrated into its structure. These models will also be managed by the `TimeStampedModelManager` to exclude archived objects from queries.

## Data Models Primary Key

In Django, each model requires a primary key to uniquely identify each record in the database. By default, Django automatically adds an `id` field as the primary key for each model. However, you can customize the primary key by explicitly defining it in the model class.
In some data models we use UUID as the primary key instead of the default auto-incrementing integer field to prevent information leakage and improve security. This is achieved by using the `uuid` module in Python and the `uuid.uuid4` method to generate unique identifiers for each record. The UUID field is defined in the model class as follows:

```python
import uuid
id = models.UUIDField(primary_key=True, default=uuid.uuid4)
```

## Change History

We track change history for all our models with the [django-simple-history](https://django-simple-history.readthedocs.io/en/latest/) package.

### History Schema

An `erc_history` schema was created alongside the "live" `erc` schema to house all the history tables. Each `erc` model has a corresponding `<table>_history` table in the `erc_history` schema that tracks and timestamps all changes. These changes are a snapshot of the data as it was at the time the change to the data was made. This enables point in time diffing either in the app or in metabase.

## Reporting Models

The reporting app contains models that manage OBPS reports, versions, and their associated data. The design of these models is intended to optimize both the application's functionality and analytical querying capabilities.

### Report Hierarchy

The reporting models follow a hierarchical structure:

- **Report**: Represents a single report instance for an operation and reporting year. Each operation can have at most one report per year.
- **ReportVersion**: Represents a version of a report. A report can have multiple versions such as draft versions and multiple submitted versions for supplementary reports.
- **Report Data Models**: Data records belonging to a report version (e.g. `ReportActivity`, `ReportMethodology`, `ReportOperation`).

### Convention: Foreign Key to ReportVersion

A key convention in the Reporting app is that **any model storing data related to a specific report version should include a `report_version` foreign key**. This is a deliberate departure from database normalization in order to simplify querying report data through Metabase.

#### Example

See: `ReportVerificationVisit`. Conceptually, a verification visit belongs to a `ReportVerification`. However, the model includes both:

```python
report_version = models.ForeignKey(
    "reporting.ReportVersion",
    on_delete=models.CASCADE,
    related_name="report_verification_visits",
    db_comment="The report version this verification visit belongs to",
)

report_verification = models.ForeignKey(
    ReportVerification,
    on_delete=models.CASCADE,
    related_name="report_verification_visits",
    db_comment="The report verification associated with this visit",
)
```

#### Rationale

This denormalization serves a purpose: **it enables Metabase users to easily construct queries around report version data without requiring multiple joins**. Metabase users often need to:

- Aggregate data by report version
- Filter data by report status or submission date
- Compare data across multiple report versions

By including the `report_version` foreign key on every data record, these queries become simpler and more performant.

### Immutability of Submitted Reports

Submitted report versions are designed to be immutable. This is enforced through PostgreSQL triggers at the database level to ensure data integrity. Models that reference a report version implement triggers to prevent modifications once the report is submitted:

```python
triggers = [
    immutable_report_version_trigger(),
]
```

This ensures that once a report version is submitted, its associated data cannot be modified, maintaining an audit trail and compliance with reporting requirements.

### Design Considerations

When adding new models to the reporting app, keep these principles in mind:

- **Include `report_version` FK**: Ensure any data model related to a report version includes a direct foreign key to `ReportVersion`, even if it's also related to another entity.
- **Consider Metabase queries**: Design your model relationships with analytics in mind. Denormalization is acceptable when it significantly improves query usability and performance for analytical purposes.
