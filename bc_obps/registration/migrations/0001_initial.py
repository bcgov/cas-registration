# Generated by Django 4.2.7 on 2023-12-06 22:16

from django.db import migrations, models
import django.db.models.deletion
import localflavor.ca.models
import phonenumber_field.modelfields
import uuid


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name='AppRole',
            fields=[
                (
                    'role_name',
                    models.CharField(
                        db_comment='The name identifying the role assigned to a user. This role defines their permissions within the app. Also acts as the primary key.',
                        max_length=100,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                ('role_description', models.CharField(db_comment='Description of the app role', max_length=1000)),
            ],
            options={
                'db_table': 'erc"."app_role',
                'db_table_comment': 'This table contains the definitions for roles within the app/database. These roles are used to define the permissions a user has within the app',
            },
        ),
        migrations.CreateModel(
            name='BusinessRole',
            fields=[
                (
                    'role_name',
                    models.CharField(
                        db_comment='The name identifying the role assigned to a Contact. Also acts as the primary key.',
                        max_length=100,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                ('role_description', models.CharField(db_comment='Description of the business role', max_length=1000)),
            ],
            options={
                'db_table': 'erc"."business_role',
                'db_table_comment': 'This table contains the definitions for roles within the operator/operation. These roles are used to define the permissions a user has within the operator/operation',
            },
        ),
        migrations.CreateModel(
            name='BusinessStructure',
            fields=[
                (
                    'name',
                    models.CharField(
                        db_comment='The name of a business structure',
                        max_length=1000,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
            ],
            options={
                'db_table': 'erc"."business_structure',
                'db_table_comment': 'The legal name of an operator',
            },
        ),
        migrations.CreateModel(
            name='Contact',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('first_name', models.CharField(db_comment="A user or contact's first name", max_length=1000)),
                ('last_name', models.CharField(db_comment="A user or contact's last name", max_length=1000)),
                ('position_title', models.CharField(db_comment="A user or contact's position title", max_length=1000)),
                ('street_address', models.CharField(db_comment="A user or contact's street address", max_length=1000)),
                ('municipality', models.CharField(db_comment="A user or contact's municipality", max_length=1000)),
                (
                    'province',
                    localflavor.ca.models.CAProvinceField(
                        db_comment="A user or contact's province, restricted to two-letter province postal abbreviations",
                        max_length=2,
                    ),
                ),
                (
                    'postal_code',
                    localflavor.ca.models.CAPostalCodeField(
                        db_comment="A user or contact's postal code, limited to valid Canadian postal codes",
                        max_length=7,
                    ),
                ),
                (
                    'email',
                    models.EmailField(db_comment="A user or contact's email, limited to valid emails", max_length=254),
                ),
                (
                    'phone_number',
                    phonenumber_field.modelfields.PhoneNumberField(
                        blank=True,
                        db_comment="A user or contact's phone number, limited to valid phone numbers",
                        max_length=128,
                        region=None,
                    ),
                ),
                (
                    'business_role',
                    models.ForeignKey(
                        db_comment='The role assigned to this contact which defines the permissions the contact has.',
                        on_delete=django.db.models.deletion.DO_NOTHING,
                        related_name='contacts',
                        to='registration.businessrole',
                    ),
                ),
            ],
            options={
                'db_table': 'erc"."contact',
                'db_table_comment': "Contacts (people who don't use the app, e.g. authorized signing officers)",
            },
        ),
        migrations.CreateModel(
            name='Document',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('file', models.FileField(db_comment='The file format, metadata, etc.', upload_to='documents')),
                ('description', models.CharField(db_comment='Description of the document', max_length=1000)),
            ],
            options={
                'db_table': 'erc"."document',
                'db_table_comment': 'Documents',
            },
        ),
        migrations.CreateModel(
            name='DocumentType',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                (
                    'name',
                    models.CharField(
                        db_comment='Name of document type (e.g. opt in signed statutory declaration)', max_length=1000
                    ),
                ),
            ],
            options={
                'db_table': 'erc"."document_type',
                'db_table_comment': 'Table that contains types of documents',
            },
        ),
        migrations.CreateModel(
            name='NaicsCode',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('naics_code', models.CharField(db_comment='NAICS code', max_length=1000)),
                ('naics_description', models.CharField(db_comment='Description of the NAICS code', max_length=1000)),
            ],
            options={
                'db_table': 'erc"."naics_code',
                'db_table_comment': 'Naics codes',
            },
        ),
        migrations.CreateModel(
            name='Operator',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('legal_name', models.CharField(db_comment='The legal name of an operator', max_length=1000)),
                (
                    'trade_name',
                    models.CharField(blank=True, db_comment='The trade name of an operator', max_length=1000),
                ),
                ('cra_business_number', models.IntegerField(db_comment='The CRA business number of an operator')),
                (
                    'bc_corporate_registry_number',
                    models.IntegerField(db_comment='The BC corporate registry number of an operator'),
                ),
                (
                    'physical_street_address',
                    models.CharField(
                        db_comment='The physical street address of an operator (where the operator is physically located)',
                        max_length=1000,
                    ),
                ),
                (
                    'physical_municipality',
                    models.CharField(db_comment='The physical municipality of an operator ', max_length=1000),
                ),
                (
                    'physical_province',
                    localflavor.ca.models.CAProvinceField(
                        db_comment='The physical street address of an operator, restricted to two-letter province postal abbreviations',
                        max_length=2,
                    ),
                ),
                (
                    'physical_postal_code',
                    localflavor.ca.models.CAPostalCodeField(
                        db_comment='The physical postal code address of an operator, limited to valid Canadian postal codes',
                        max_length=7,
                    ),
                ),
                (
                    'mailing_street_address',
                    models.CharField(db_comment='The mailing street address of an operator', max_length=1000),
                ),
                (
                    'mailing_municipality',
                    models.CharField(db_comment='The mailing municipality of an operator', max_length=1000),
                ),
                (
                    'mailing_province',
                    localflavor.ca.models.CAProvinceField(
                        db_comment='The mailing province of an operator, restricted to two-letter province postal abbreviations',
                        max_length=2,
                    ),
                ),
                (
                    'mailing_postal_code',
                    localflavor.ca.models.CAPostalCodeField(
                        db_comment='The mailing postal code of an operator, limited to valid Canadian postal codes',
                        max_length=7,
                    ),
                ),
                ('website', models.URLField(blank=True, db_comment='The website address of an operator', null=True)),
                (
                    'status',
                    models.CharField(
                        choices=[
                            ('Draft', 'Draft'),
                            ('Pending', 'Pending'),
                            ('Approved', 'Approved'),
                            ('Rejected', 'Rejected'),
                        ],
                        db_comment='The status of an operator in the app (e.g. draft)',
                        default='Draft',
                        max_length=1000,
                    ),
                ),
                (
                    'verified_at',
                    models.DateTimeField(
                        blank=True, db_comment='The time an operator was verified by an IRC user', null=True
                    ),
                ),
                (
                    'business_structure',
                    models.ForeignKey(
                        db_comment='The business structure of an operator',
                        on_delete=django.db.models.deletion.DO_NOTHING,
                        related_name='operators',
                        to='registration.businessstructure',
                    ),
                ),
                ('contacts', models.ManyToManyField(blank=True, related_name='operators', to='registration.contact')),
                ('documents', models.ManyToManyField(blank=True, related_name='operators', to='registration.document')),
            ],
            options={
                'db_table': 'erc"."operator',
                'db_table_comment': 'Operators (also called organizations)',
            },
        ),
        migrations.CreateModel(
            name='RegulatedProduct',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(db_comment='The name of a regulated product', max_length=1000)),
            ],
            options={
                'db_table': 'erc"."regulated_product',
                'db_table_comment': 'Regulated products',
            },
        ),
        migrations.CreateModel(
            name='ReportingActivity',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(db_comment='The name of a reporting activity', max_length=1000)),
                (
                    'applicable_to',
                    models.CharField(
                        choices=[('sfo', 'Sfo'), ('lfo', 'Lfo'), ('all', 'All')],
                        db_comment='Which type of facility the activity applies to',
                        max_length=1000,
                    ),
                ),
            ],
            options={
                'db_table': 'erc"."reporting_activity',
                'db_table_comment': 'Reporting activities',
            },
        ),
        migrations.CreateModel(
            name='User',
            fields=[
                ('first_name', models.CharField(db_comment="A user or contact's first name", max_length=1000)),
                ('last_name', models.CharField(db_comment="A user or contact's last name", max_length=1000)),
                ('position_title', models.CharField(db_comment="A user or contact's position title", max_length=1000)),
                ('street_address', models.CharField(db_comment="A user or contact's street address", max_length=1000)),
                ('municipality', models.CharField(db_comment="A user or contact's municipality", max_length=1000)),
                (
                    'province',
                    localflavor.ca.models.CAProvinceField(
                        db_comment="A user or contact's province, restricted to two-letter province postal abbreviations",
                        max_length=2,
                    ),
                ),
                (
                    'postal_code',
                    localflavor.ca.models.CAPostalCodeField(
                        db_comment="A user or contact's postal code, limited to valid Canadian postal codes",
                        max_length=7,
                    ),
                ),
                (
                    'email',
                    models.EmailField(db_comment="A user or contact's email, limited to valid emails", max_length=254),
                ),
                (
                    'phone_number',
                    phonenumber_field.modelfields.PhoneNumberField(
                        blank=True,
                        db_comment="A user or contact's phone number, limited to valid phone numbers",
                        max_length=128,
                        region=None,
                    ),
                ),
                (
                    'user_guid',
                    models.UUIDField(
                        db_comment='A GUID to identify the user', default=uuid.uuid4, primary_key=True, serialize=False
                    ),
                ),
                ('business_guid', models.UUIDField(db_comment='A GUID to identify the business', default=uuid.uuid4)),
                (
                    'app_role',
                    models.ForeignKey(
                        db_comment='The role assigned to this user which defines the permissions the use has.',
                        on_delete=django.db.models.deletion.DO_NOTHING,
                        related_name='users',
                        to='registration.approle',
                    ),
                ),
                ('documents', models.ManyToManyField(blank=True, related_name='users', to='registration.document')),
            ],
            options={
                'db_table': 'erc"."user',
                'db_table_comment': 'App users',
            },
        ),
        migrations.CreateModel(
            name='ParentChildOperator',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                (
                    'percentage_owned_by_parent_company',
                    models.DecimalField(
                        blank=True,
                        db_comment='The percentage of an operator owned by the parent company',
                        decimal_places=5,
                        max_digits=10,
                        null=True,
                    ),
                ),
                (
                    'child_operator',
                    models.ForeignKey(
                        db_comment='The child operator of an operator in a parent-child relationship',
                        on_delete=django.db.models.deletion.DO_NOTHING,
                        related_name='parent_child_operator_child_operators',
                        to='registration.operator',
                    ),
                ),
                (
                    'parent_operator',
                    models.ForeignKey(
                        db_comment='The parent operator of an operator in a parent-child relationship',
                        on_delete=django.db.models.deletion.DO_NOTHING,
                        related_name='parent_child_operator_parent_operators',
                        to='registration.operator',
                    ),
                ),
            ],
            options={
                'db_table': 'erc"."parent_child_operator',
                'db_table_comment': 'Through table to connect parent and child operators',
            },
        ),
        migrations.AddField(
            model_name='operator',
            name='verified_by',
            field=models.ForeignKey(
                blank=True,
                db_comment='The IRC user who verified the operator',
                null=True,
                on_delete=django.db.models.deletion.DO_NOTHING,
                related_name='operators_verified_by',
                to='registration.user',
            ),
        ),
        migrations.CreateModel(
            name='Operation',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(db_comment="An operation or facility's name", max_length=1000)),
                ('type', models.CharField(db_comment="An operation or facility's type", max_length=1000)),
                (
                    'previous_year_attributable_emissions',
                    models.DecimalField(
                        blank=True,
                        db_comment="An operation or facility's attributable emissions from the previous year. Only needed if the operation/facility submitted a report the previous year.",
                        decimal_places=5,
                        max_digits=10,
                        null=True,
                    ),
                ),
                (
                    'swrs_facility_id',
                    models.IntegerField(
                        blank=True,
                        db_comment="An operation or facility's SWRS facility ID. Only needed if the operation/facility submitted a report the previous year.",
                        null=True,
                    ),
                ),
                (
                    'bcghg_id',
                    models.CharField(
                        blank=True,
                        db_comment="An operation or facility's BCGHG identifier. Only needed if the operation/facility submitted a report the previous year.",
                        max_length=1000,
                        null=True,
                    ),
                ),
                (
                    'opt_in',
                    models.BooleanField(
                        blank=True,
                        db_comment='Whether or not the operation/facility is required to register or is simply opting in. Only needed if the operation/facility did not report the previous year.',
                        null=True,
                    ),
                ),
                (
                    'operation_has_multiple_operators',
                    models.BooleanField(
                        db_comment='Whether or not the operation has multiple operators', default=False
                    ),
                ),
                (
                    'verified_at',
                    models.DateTimeField(
                        blank=True,
                        db_comment='The time the operation was verified by an IRC user. If exists, the operation is registered for OBPS.',
                        null=True,
                    ),
                ),
                (
                    'status',
                    models.CharField(
                        choices=[
                            ('Not Registered', 'Not Registered'),
                            ('Pending', 'Pending'),
                            ('Approved', 'Approved'),
                            ('Rejected', 'Rejected'),
                        ],
                        db_comment='The status of an operation in the app (e.g. pending review)',
                        default='Not Registered',
                        max_length=1000,
                    ),
                ),
                (
                    'application_lead',
                    models.ForeignKey(
                        blank=True,
                        db_comment='Foreign key to the contact that is the application lead',
                        null=True,
                        on_delete=django.db.models.deletion.DO_NOTHING,
                        related_name='operations',
                        to='registration.contact',
                    ),
                ),
                (
                    'documents',
                    models.ManyToManyField(blank=True, related_name='operations', to='registration.document'),
                ),
                (
                    'naics_code',
                    models.ForeignKey(
                        db_comment="An operation or facility's NAICS code",
                        on_delete=django.db.models.deletion.DO_NOTHING,
                        related_name='operations_and_facilities',
                        to='registration.naicscode',
                    ),
                ),
                (
                    'operator',
                    models.ForeignKey(
                        db_comment='The operator who owns the operation',
                        on_delete=django.db.models.deletion.DO_NOTHING,
                        related_name='operations',
                        to='registration.operator',
                    ),
                ),
                (
                    'regulated_products',
                    models.ManyToManyField(
                        blank=True, related_name='operations_and_facilities', to='registration.regulatedproduct'
                    ),
                ),
                (
                    'reporting_activities',
                    models.ManyToManyField(
                        blank=True, related_name='operations_and_facilities', to='registration.reportingactivity'
                    ),
                ),
                (
                    'verified_by',
                    models.ForeignKey(
                        blank=True,
                        db_comment='The IRC user who verified the operator',
                        null=True,
                        on_delete=django.db.models.deletion.DO_NOTHING,
                        related_name='operation_verified_by',
                        to='registration.user',
                    ),
                ),
            ],
            options={
                'db_table': 'erc"."operation',
                'db_table_comment': 'Operations (also called facilities)',
            },
        ),
        migrations.CreateModel(
            name='MultipleOperator',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                (
                    'operator_index',
                    models.IntegerField(
                        db_comment='Index used to differentiate operators for this operation for saving/updating purposes'
                    ),
                ),
                ('legal_name', models.CharField(db_comment='The legal name of an operator', max_length=1000)),
                ('trade_name', models.CharField(db_comment='The trade name of an operator', max_length=1000)),
                ('cra_business_number', models.IntegerField(db_comment='The CRA business number of an operator')),
                (
                    'bc_corporate_registry_number',
                    models.IntegerField(db_comment='The BC corporate registry number of an operator'),
                ),
                (
                    'business_structure',
                    models.CharField(
                        blank=True, db_comment='The legal name of an operator', default='', max_length=1000
                    ),
                ),
                ('website', models.URLField(blank=True, db_comment='The website address of an operator', default='')),
                (
                    'percentage_ownership',
                    models.DecimalField(
                        blank=True,
                        db_comment='The percentage of the operation which this operator owns',
                        decimal_places=5,
                        max_digits=10,
                        null=True,
                    ),
                ),
                (
                    'physical_street_address',
                    models.CharField(
                        db_comment='The physical street address of an operator (where the operator is physically located)',
                        max_length=1000,
                    ),
                ),
                (
                    'physical_municipality',
                    models.CharField(db_comment='The physical municipality of an operator ', max_length=1000),
                ),
                (
                    'physical_province',
                    localflavor.ca.models.CAProvinceField(
                        db_comment='The physical street address of an operator, restricted to two-letter province postal abbreviations',
                        max_length=2,
                    ),
                ),
                (
                    'physical_postal_code',
                    localflavor.ca.models.CAPostalCodeField(
                        db_comment='The physical postal code address of an operator, limited to valid Canadian postal codes',
                        max_length=7,
                    ),
                ),
                (
                    'mailing_address_same_as_physical',
                    models.BooleanField(
                        db_comment='Whether or not the mailing address is the same as the physical address',
                        default=True,
                    ),
                ),
                (
                    'mailing_street_address',
                    models.CharField(db_comment='The mailing street address of an operator', max_length=1000),
                ),
                (
                    'mailing_municipality',
                    models.CharField(db_comment='The mailing municipality of an operator', max_length=1000),
                ),
                (
                    'mailing_province',
                    localflavor.ca.models.CAProvinceField(
                        db_comment='The mailing province of an operator, restricted to two-letter province postal abbreviations',
                        max_length=2,
                    ),
                ),
                (
                    'mailing_postal_code',
                    localflavor.ca.models.CAPostalCodeField(
                        db_comment='The mailing postal code of an operator, limited to valid Canadian postal codes',
                        max_length=7,
                    ),
                ),
                (
                    'operation',
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.DO_NOTHING,
                        related_name='multiple_operator',
                        to='registration.operation',
                    ),
                ),
            ],
            options={
                'db_table': 'erc"."multiple_operator',
                'db_table_comment': 'Table to store multiple operator metadata',
            },
        ),
        migrations.AddField(
            model_name='document',
            name='type',
            field=models.ForeignKey(
                db_comment='Type of document, e.g., boundary map',
                on_delete=django.db.models.deletion.DO_NOTHING,
                related_name='documents',
                to='registration.documenttype',
            ),
        ),
        migrations.AddField(
            model_name='contact',
            name='documents',
            field=models.ManyToManyField(blank=True, related_name='contacts', to='registration.document'),
        ),
        migrations.CreateModel(
            name='UserOperator',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                (
                    'role',
                    models.CharField(
                        choices=[('admin', 'Admin'), ('reporter', 'Reporter')],
                        db_comment='The role of a user associated with an operator (e.g. admin)',
                        max_length=1000,
                    ),
                ),
                (
                    'status',
                    models.CharField(
                        choices=[
                            ('draft', 'Draft'),
                            ('pending', 'Pending'),
                            ('approved', 'Approved'),
                            ('rejected', 'Rejected'),
                        ],
                        db_comment='The status of a user operator in the app (e.g. pending review)',
                        default='draft',
                        max_length=1000,
                    ),
                ),
                (
                    'verified_at',
                    models.DateTimeField(
                        blank=True, db_comment='The time a user operator was verified by an IRC user', null=True
                    ),
                ),
                (
                    'operator',
                    models.ForeignKey(
                        db_comment='An operator associated with a user',
                        on_delete=django.db.models.deletion.DO_NOTHING,
                        related_name='user_operators',
                        to='registration.operator',
                    ),
                ),
                (
                    'user',
                    models.ForeignKey(
                        db_comment='A user associated with an operator',
                        on_delete=django.db.models.deletion.DO_NOTHING,
                        related_name='user_operators',
                        to='registration.user',
                    ),
                ),
                (
                    'verified_by',
                    models.ForeignKey(
                        blank=True,
                        db_comment='The IRC user who verified the user operator',
                        null=True,
                        on_delete=django.db.models.deletion.DO_NOTHING,
                        related_name='user_operators_verified_by',
                        to='registration.user',
                    ),
                ),
            ],
            options={
                'db_table': 'erc"."user_operator',
                'db_table_comment': 'Through table to connect Users and Operators and track access requests',
                'indexes': [
                    models.Index(fields=['user'], name='user_operator_user_idx'),
                    models.Index(fields=['operator'], name='user_operator_operator_idx'),
                ],
            },
        ),
        migrations.AddConstraint(
            model_name='user',
            constraint=models.UniqueConstraint(
                fields=('user_guid', 'business_guid'), name='uuid_user_and_business_constraint'
            ),
        ),
        migrations.AddIndex(
            model_name='parentchildoperator',
            index=models.Index(fields=['parent_operator'], name='parent_operator_idx'),
        ),
        migrations.AddIndex(
            model_name='parentchildoperator',
            index=models.Index(fields=['child_operator'], name='child_operator_idx'),
        ),
        migrations.AddIndex(
            model_name='operation',
            index=models.Index(fields=['operator'], name='operator_idx'),
        ),
        migrations.AddIndex(
            model_name='operation',
            index=models.Index(fields=['naics_code'], name='naics_code_idx'),
        ),
        migrations.AddIndex(
            model_name='operation',
            index=models.Index(fields=['verified_by'], name='operation_verified_by_idx'),
        ),
        migrations.AddIndex(
            model_name='contact',
            index=models.Index(fields=['business_role'], name='contact_role_idx'),
        ),
        migrations.AddConstraint(
            model_name='contact',
            constraint=models.UniqueConstraint(fields=('email',), name='contact_email_constraint'),
        ),
    ]
