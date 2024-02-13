# Generated by Django 4.2.8 on 2024-02-13 19:08

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        ('registration', '0002_prod_data'),
    ]

    operations = [
        migrations.AlterField(
            model_name='contact',
            name='address',
            field=models.ForeignKey(
                blank=True,
                db_comment='Foreign key to the address of a user or contact',
                null=True,
                on_delete=django.db.models.deletion.DO_NOTHING,
                related_name='contacts',
                to='registration.address',
            ),
        ),
        migrations.AlterField(
            model_name='historicaluseroperator',
            name='role',
            field=models.CharField(
                choices=[('admin', 'Admin'), ('reporter', 'Reporter'), ('pending', 'Pending')],
                db_comment='The role of a user associated with an operator (e.g. admin)',
                default='pending',
                max_length=1000,
            ),
        ),
        migrations.AlterField(
            model_name='historicaluseroperator',
            name='status',
            field=models.CharField(
                choices=[('Pending', 'Pending'), ('Approved', 'Approved'), ('Declined', 'Declined')],
                db_comment='The status of a user operator in the app (e.g. pending review)',
                default='Pending',
                max_length=1000,
            ),
        ),
        migrations.AlterField(
            model_name='useroperator',
            name='role',
            field=models.CharField(
                choices=[('admin', 'Admin'), ('reporter', 'Reporter'), ('pending', 'Pending')],
                db_comment='The role of a user associated with an operator (e.g. admin)',
                default='pending',
                max_length=1000,
            ),
        ),
        migrations.AlterField(
            model_name='useroperator',
            name='status',
            field=models.CharField(
                choices=[('Pending', 'Pending'), ('Approved', 'Approved'), ('Declined', 'Declined')],
                db_comment='The status of a user operator in the app (e.g. pending review)',
                default='Pending',
                max_length=1000,
            ),
        ),
        migrations.AddIndex(
            model_name='document',
            index=models.Index(fields=['type'], name='document_type_idx'),
        ),
        migrations.AddIndex(
            model_name='operation',
            index=models.Index(fields=['created_at'], name='operation_created_at_idx'),
        ),
        migrations.AddIndex(
            model_name='operation',
            index=models.Index(fields=['status'], name='operation_status_idx'),
        ),
        migrations.AddIndex(
            model_name='parentoperator',
            index=models.Index(fields=['child_operator'], name='po_child_operator_idx'),
        ),
        migrations.AddIndex(
            model_name='parentoperator',
            index=models.Index(fields=['business_structure'], name='po_business_structure_idx'),
        ),
        migrations.AddIndex(
            model_name='parentoperator',
            index=models.Index(fields=['physical_address'], name='po_physical_address_idx'),
        ),
        migrations.AddIndex(
            model_name='parentoperator',
            index=models.Index(fields=['mailing_address'], name='po_mailing_address_idx'),
        ),
        migrations.AddIndex(
            model_name='user',
            index=models.Index(fields=['app_role'], name='user_app_role_idx'),
        ),
        migrations.AddConstraint(
            model_name='useroperator',
            constraint=models.UniqueConstraint(fields=('user', 'operator'), name='user_and_operator_unique_constraint'),
        ),
    ]
