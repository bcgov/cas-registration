# Generated by Django 4.2.6 on 2023-10-13 22:22

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
                    'role',
                    models.CharField(
                        choices=[
                            ('senior_officer', 'senior officer'),
                            ('operation_representative', 'operation representative'),
                            ('authorized_signing_officer', 'authorized signing officer'),
                            ('operation_registration_lead', 'operation registration lead'),
                        ],
                        db_comment="A user or contact's role with an operation (e.g. senior operator). Certain roles need authority from other roles to do things.",
                        max_length=1000,
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
                        db_comment='Name of document type (e.g. opt in signed statuatory declaration)', max_length=1000
                    ),
                ),
            ],
            options={
                'db_table': 'erc"."document_type',
                'db_table_comment': 'Table that contains types of documents',
            },
        ),
        migrations.CreateModel(
            name='NaicsCategory',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('naics_category', models.CharField(db_comment='The naics_catory name', max_length=1000)),
            ],
            options={
                'db_table': 'erc"."naics_category',
                'db_table_comment': 'Naics categories',
            },
        ),
        migrations.CreateModel(
            name='NaicsCode',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('naics_code', models.CharField(db_comment='NAICS code', max_length=1000)),
                (
                    'ciip_sector',
                    models.CharField(db_comment='Sector that the code belongs to in the CIIP program', max_length=1000),
                ),
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
                ('trade_name', models.CharField(db_comment='The trade name of an operator', max_length=1000)),
                ('cra_business_number', models.IntegerField(db_comment='The CRA business number of an operator')),
                (
                    'bc_corporate_registry_number',
                    models.IntegerField(db_comment='The BC corporate registry number of an operator'),
                ),
                ('duns_number', models.IntegerField(db_comment='The DUNS number of an operator')),
                ('business_structure', models.CharField(db_comment='The legal name of an operator', max_length=1000)),
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
                ('bceid', models.IntegerField(db_comment='The BCEID identifier of an operator')),
                (
                    'compliance_entity',
                    models.ForeignKey(
                        db_comment='The entity that will be paying compliance charges (can be the operator itself or another operator, parent company, partner company, etc.)',
                        on_delete=django.db.models.deletion.DO_NOTHING,
                        related_name='operator_compliance_entity',
                        to='registration.operator',
                    ),
                ),
                ('contacts', models.ManyToManyField(related_name='operator_contacts', to='registration.contact')),
                (
                    'documents',
                    models.ManyToManyField(blank=True, related_name='operator_documents', to='registration.document'),
                ),
            ],
            options={
                'db_table': 'erc"."operator',
                'db_table_comment': 'Operators (also called organizations)',
            },
        ),
        migrations.CreateModel(
            name='PetrinexId',
            fields=[
                (
                    'id',
                    models.CharField(db_comment='Petrinex id', default=uuid.uuid4, primary_key=True, serialize=False),
                ),
            ],
            options={
                'db_table': 'erc"."petrinex_id',
                'db_table_comment': 'Petrinex ids',
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
                    'role',
                    models.CharField(
                        choices=[
                            ('senior_officer', 'senior officer'),
                            ('operation_representative', 'operation representative'),
                            ('authorized_signing_officer', 'authorized signing officer'),
                            ('operation_registration_lead', 'operation registration lead'),
                        ],
                        db_comment="A user or contact's role with an operation (e.g. senior operator). Certain roles need authority from other roles to do things.",
                        max_length=1000,
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
                    'documents',
                    models.ManyToManyField(blank=True, related_name='user_documents', to='registration.document'),
                ),
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
                        db_comment='The percentage of an operator owned by the parent company',
                        decimal_places=5,
                        max_digits=10,
                    ),
                ),
                (
                    'child_operator',
                    models.ForeignKey(
                        db_comment='The child operator of an operator in a parent-child relationship',
                        on_delete=django.db.models.deletion.DO_NOTHING,
                        related_name='parent_child_operator_child_operator',
                        to='registration.operator',
                    ),
                ),
                (
                    'parent_operator',
                    models.ForeignKey(
                        db_comment='The parent operator of an operator in a parent-child relationship',
                        on_delete=django.db.models.deletion.DO_NOTHING,
                        related_name='parent_child_operator_parent_operator',
                        to='registration.operator',
                    ),
                ),
            ],
            options={
                'db_table': 'erc"."parent_child_operator',
                'db_table_comment': 'Through table to connect parent and child operators',
            },
        ),
        migrations.CreateModel(
            name='Operation',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(db_comment="An operation or facility's name", max_length=1000)),
                ('type', models.CharField(db_comment="An operation or facility's type", max_length=1000)),
                (
                    'reporting_activities',
                    models.CharField(db_comment="An operation or facility's reporting activities", max_length=1000),
                ),
                (
                    'permit_issuing_agency',
                    models.CharField(
                        blank=True,
                        db_comment='The agency that issued a permit to the operation or facility',
                        max_length=1000,
                        null=True,
                    ),
                ),
                (
                    'permit_number',
                    models.CharField(
                        blank=True, db_comment="An operation or facility's permit number", max_length=1000, null=True
                    ),
                ),
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
                    'current_year_estimated_emissions',
                    models.DecimalField(
                        blank=True,
                        db_comment="An operation or facility's estimated emissions for the current year. Only needed if the operation/facility did not report the previous year.",
                        decimal_places=5,
                        max_digits=10,
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
                    'new_entrant',
                    models.BooleanField(
                        blank=True,
                        db_comment='Whether or not an operation or facility is a new entrant. Only needed if the operation/facility did not report the previous year.',
                        null=True,
                    ),
                ),
                (
                    'start_of_commercial_operation',
                    models.DateTimeField(
                        blank=True,
                        db_comment="An operation or facility's start of commercial operation. Only needed if the operation/facility did not report the previous year.",
                        null=True,
                    ),
                ),
                (
                    'physical_street_address',
                    models.CharField(db_comment="An operation or facility's physical street address", max_length=1000),
                ),
                (
                    'physical_municipality',
                    models.CharField(db_comment="An operation or facility's physical municipality", max_length=1000),
                ),
                (
                    'physical_province',
                    localflavor.ca.models.CAProvinceField(
                        db_comment="An operation or facility's physical province, restricted to two-letter province postal abbreviations",
                        max_length=2,
                    ),
                ),
                (
                    'physical_postal_code',
                    localflavor.ca.models.CAPostalCodeField(
                        db_comment="An operation or facility's postal code, limited to valid Canadian postal codes",
                        max_length=7,
                    ),
                ),
                (
                    'legal_land_description',
                    models.CharField(db_comment="An operation or facility's legal land description", max_length=1000),
                ),
                (
                    'latitude',
                    models.DecimalField(
                        db_comment="An operation or facility's reporting activities", decimal_places=5, max_digits=10
                    ),
                ),
                (
                    'longitude',
                    models.DecimalField(
                        db_comment="An operation or facility's latitude", decimal_places=5, max_digits=10
                    ),
                ),
                (
                    'npri_id',
                    models.IntegerField(blank=True, db_comment="An operation or facility's longitude", null=True),
                ),
                (
                    'bcer_permit_id',
                    models.IntegerField(blank=True, db_comment="An operation or facility's BCER permit id", null=True),
                ),
                (
                    'major_new_operation',
                    models.BooleanField(
                        blank=True, db_comment='Whether or not the operation is a Major New Operation', null=True
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
                            ('not_registered', 'Not Registered'),
                            ('pending', 'Pending'),
                            ('approved', 'Approved'),
                            ('rejected', 'Rejected'),
                        ],
                        db_comment='The status of an operation in the app (e.g. pending review)',
                        default='pending',
                        max_length=1000,
                    ),
                ),
                ('contacts', models.ManyToManyField(related_name='operation_contacts', to='registration.contact')),
                (
                    'documents',
                    models.ManyToManyField(blank=True, related_name='operation_documents', to='registration.document'),
                ),
                (
                    'naics_category',
                    models.ForeignKey(
                        db_comment="An operation or facility's NAICS category",
                        on_delete=django.db.models.deletion.DO_NOTHING,
                        related_name='operations_facilities_naics_catetories',
                        to='registration.naicscategory',
                    ),
                ),
                (
                    'naics_code',
                    models.ForeignKey(
                        db_comment="An operation or facility's NAICS code",
                        on_delete=django.db.models.deletion.DO_NOTHING,
                        related_name='operations_facilities_naics_code',
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
                    'petrinex_ids',
                    models.ManyToManyField(
                        blank=True, related_name='operations_facilities_petrinex_ids', to='registration.petrinexid'
                    ),
                ),
                (
                    'regulated_products',
                    models.ManyToManyField(
                        blank=True,
                        related_name='operations_facilities_regulated_products',
                        to='registration.regulatedproduct',
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
        migrations.AddField(
            model_name='document',
            name='type',
            field=models.ForeignKey(
                db_comment='Type of document, e.g., boundary map',
                on_delete=django.db.models.deletion.DO_NOTHING,
                related_name='contacts',
                to='registration.documenttype',
            ),
        ),
        migrations.AddField(
            model_name='contact',
            name='documents',
            field=models.ManyToManyField(blank=True, related_name='contact_documents', to='registration.document'),
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
                        choices=[('pending', 'Pending'), ('approved', 'Approved'), ('rejected', 'Rejected')],
                        db_comment='The status of an operator in the app (e.g. pending review)',
                        default='pending',
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
                    'operators',
                    models.ForeignKey(
                        db_comment='An operator associated with a user',
                        on_delete=django.db.models.deletion.DO_NOTHING,
                        related_name='user_operators',
                        to='registration.operator',
                    ),
                ),
                (
                    'users',
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
                        db_comment='The IRC user who verified the operator',
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
                    models.Index(fields=['users'], name='user_operator_user_idx'),
                    models.Index(fields=['operators'], name='user_operator_operator_idx'),
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
            model_name='operator',
            index=models.Index(fields=['compliance_entity'], name='compliance_entity_idx'),
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
            index=models.Index(fields=['role'], name='contact_role_idx'),
        ),
        migrations.AddConstraint(
            model_name='contact',
            constraint=models.UniqueConstraint(fields=('email',), name='contact_email_constraint'),
        ),
    ]
