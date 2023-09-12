# Generated by Django 4.2.4 on 2023-09-12 17:21

from django.db import migrations, models
import django.db.models.deletion
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
                ('first_name', models.CharField(db_comment='', max_length=1000)),
                ('last_name', models.CharField(db_comment='', max_length=1000)),
                ('mailing_address', models.CharField(db_comment='', max_length=1000)),
                ('email', models.EmailField(db_comment='', max_length=254)),
                (
                    'phone_number',
                    phonenumber_field.modelfields.PhoneNumberField(
                        blank=True, db_comment='', max_length=128, region=None
                    ),
                ),
                ('is_operational_representative', models.BooleanField(db_comment='')),
                ('verified_at', models.DateTimeField(blank=True, db_comment='', null=True)),
            ],
            options={
                'db_table_comment': "Contacts (people who don't use the app, e.g. authorized signing officers)",
            },
        ),
        migrations.CreateModel(
            name='Document',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('file', models.FileField(db_comment='', upload_to='documents')),
                ('document_type', models.CharField(db_comment='Type of document, e.g., boundary map', max_length=1000)),
                ('description', models.CharField(db_comment='', max_length=1000)),
            ],
            options={
                'db_table_comment': 'Documents',
            },
        ),
        migrations.CreateModel(
            name='NaicsCode',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('naics_code', models.CharField(db_comment='', max_length=1000)),
                ('ciip_sector', models.CharField(db_comment='', max_length=1000)),
                ('naics_description', models.CharField(db_comment='', max_length=1000)),
            ],
            options={
                'db_table_comment': 'Naics codes',
            },
        ),
        migrations.CreateModel(
            name='Operator',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('legal_name', models.CharField(db_comment='', max_length=1000)),
                ('trade_name', models.CharField(db_comment='', max_length=1000)),
                ('cra_business_number', models.CharField(db_comment='', max_length=1000)),
                ('bc_corporate_registry_number', models.CharField(db_comment='', max_length=1000)),
                ('business_structure', models.CharField(db_comment='', max_length=1000)),
                ('mailing_address', models.CharField(db_comment='', max_length=1000)),
                ('bceid', models.CharField(db_comment='', max_length=1000)),
                (
                    'relationship_with_parent_operator',
                    models.CharField(blank=True, db_comment='', max_length=1000, null=True),
                ),
                ('date_aso_became_responsible_for_operator', models.DateTimeField(db_comment='')),
                (
                    'compliance_obligee',
                    models.ForeignKey(
                        db_comment='',
                        on_delete=django.db.models.deletion.DO_NOTHING,
                        related_name='obligee',
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
                'db_table_comment': 'Operators (also called organizations)',
            },
        ),
        migrations.CreateModel(
            name='User',
            fields=[
                ('first_name', models.CharField(db_comment='', max_length=1000)),
                ('last_name', models.CharField(db_comment='', max_length=1000)),
                ('mailing_address', models.CharField(db_comment='', max_length=1000)),
                ('email', models.EmailField(db_comment='', max_length=254)),
                (
                    'phone_number',
                    phonenumber_field.modelfields.PhoneNumberField(
                        blank=True, db_comment='', max_length=128, region=None
                    ),
                ),
                ('user_guid', models.UUIDField(db_comment='', default=uuid.uuid4, primary_key=True, serialize=False)),
                ('business_guid', models.UUIDField(db_comment='', default=uuid.uuid4)),
                ('position_title', models.CharField(db_comment='', max_length=1000)),
                (
                    'documents',
                    models.ManyToManyField(blank=True, related_name='user_documents', to='registration.document'),
                ),
            ],
            options={
                'db_table_comment': 'App users',
            },
        ),
        migrations.CreateModel(
            name='UserOperator',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                (
                    'role',
                    models.CharField(
                        choices=[('admin', 'Admin'), ('reporter', 'Reporter')], db_comment='', max_length=1000
                    ),
                ),
                (
                    'status',
                    models.CharField(
                        choices=[('pending', 'Pending'), ('approved', 'Approved'), ('rejected', 'Rejected')],
                        db_comment='',
                        default='pending',
                        max_length=1000,
                    ),
                ),
                ('user_is_aso', models.BooleanField(db_comment='')),
                ('aso_is_owner_or_operator', models.BooleanField(db_comment='')),
                ('user_is_third_party', models.BooleanField(db_comment='')),
                (
                    'operators',
                    models.ForeignKey(
                        db_comment='',
                        on_delete=django.db.models.deletion.DO_NOTHING,
                        related_name='user_operators',
                        to='registration.operator',
                    ),
                ),
                (
                    'proof_of_authority',
                    models.ForeignKey(
                        db_comment='',
                        on_delete=django.db.models.deletion.DO_NOTHING,
                        related_name='user_operators_proof_of_authority',
                        to='registration.document',
                    ),
                ),
                (
                    'signed_statuatory_declaration',
                    models.ForeignKey(
                        db_comment='',
                        on_delete=django.db.models.deletion.DO_NOTHING,
                        related_name='user_operators_signed_statuatory_declaration',
                        to='registration.document',
                    ),
                ),
                (
                    'users',
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.DO_NOTHING,
                        related_name='user_operators',
                        to='registration.user',
                    ),
                ),
            ],
            options={
                'db_table_comment': 'Through table to connect Users and Operators and track access requests',
            },
        ),
        migrations.AddField(
            model_name='operator',
            name='operators',
            field=models.ManyToManyField(
                related_name='operator_users', through='registration.UserOperator', to='registration.user'
            ),
        ),
        migrations.AddField(
            model_name='operator',
            name='parent_operator',
            field=models.ForeignKey(
                blank=True,
                db_comment='',
                null=True,
                on_delete=django.db.models.deletion.DO_NOTHING,
                related_name='parent',
                to='registration.operator',
            ),
        ),
        migrations.CreateModel(
            name='Operation',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(db_comment='', max_length=1000)),
                ('operation_type', models.CharField(db_comment='', max_length=1000)),
                ('eligible_commercial_product_name', models.CharField(db_comment='', max_length=1000)),
                ('permit_id', models.CharField(db_comment='', max_length=1000)),
                ('npr_id', models.CharField(blank=True, db_comment='', max_length=1000, null=True)),
                ('ghfrp_id', models.CharField(blank=True, db_comment='', max_length=1000, null=True)),
                ('bcghrp_id', models.CharField(blank=True, db_comment='', max_length=1000, null=True)),
                ('petrinex_id', models.CharField(blank=True, db_comment='', max_length=1000, null=True)),
                ('latitude', models.DecimalField(db_comment='', decimal_places=10, max_digits=10)),
                ('longitude', models.DecimalField(db_comment='', decimal_places=10, max_digits=10)),
                ('legal_land_description', models.CharField(db_comment='', max_length=1000)),
                ('nearest_municipality', models.CharField(db_comment='', max_length=1000)),
                ('operator_percent_of_ownership', models.DecimalField(db_comment='', decimal_places=10, max_digits=10)),
                ('registered_for_obps', models.BooleanField(db_comment='')),
                ('verified_at', models.DateTimeField(blank=True, db_comment='', null=True)),
                ('estimated_emissions', models.DecimalField(db_comment='', decimal_places=10, max_digits=10)),
                ('contacts', models.ManyToManyField(related_name='operation_contacts', to='registration.contact')),
                (
                    'documents',
                    models.ManyToManyField(blank=True, related_name='operation_documents', to='registration.document'),
                ),
                (
                    'naics_code',
                    models.ForeignKey(
                        db_comment='',
                        on_delete=django.db.models.deletion.DO_NOTHING,
                        related_name='operations',
                        to='registration.naicscode',
                    ),
                ),
                (
                    'operator_id',
                    models.ForeignKey(
                        db_comment='',
                        on_delete=django.db.models.deletion.DO_NOTHING,
                        related_name='operations',
                        to='registration.operator',
                    ),
                ),
                (
                    'verified_by',
                    models.ForeignKey(
                        blank=True,
                        db_comment='',
                        null=True,
                        on_delete=django.db.models.deletion.DO_NOTHING,
                        related_name='operations',
                        to='registration.user',
                    ),
                ),
            ],
            options={
                'db_table_comment': 'Operations (also called facilities)',
            },
        ),
        migrations.AddField(
            model_name='contact',
            name='verified_by',
            field=models.ForeignKey(
                blank=True,
                db_comment='',
                null=True,
                on_delete=django.db.models.deletion.DO_NOTHING,
                related_name='contacts',
                to='registration.user',
            ),
        ),
        migrations.AddIndex(
            model_name='useroperator',
            index=models.Index(fields=['users'], name='user_operator_user_id_idx'),
        ),
        migrations.AddIndex(
            model_name='useroperator',
            index=models.Index(fields=['operators'], name='user_operator_operator_id_idx'),
        ),
        migrations.AddConstraint(
            model_name='user',
            constraint=models.UniqueConstraint(
                fields=('user_guid', 'business_guid'), name='uuid_user_and_business_constraint'
            ),
        ),
        migrations.AddIndex(
            model_name='operator',
            index=models.Index(fields=['parent_operator'], name='parent_operator_idx'),
        ),
        migrations.AddIndex(
            model_name='operator',
            index=models.Index(fields=['compliance_obligee'], name='compliance_obligee_idx'),
        ),
        migrations.AddIndex(
            model_name='operation',
            index=models.Index(fields=['operator_id'], name='operator_id_idx'),
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
            index=models.Index(fields=['verified_by'], name='contact_verified_by_idx'),
        ),
        migrations.AddConstraint(
            model_name='contact',
            constraint=models.UniqueConstraint(fields=('email',), name='contact_email_constraint'),
        ),
    ]
