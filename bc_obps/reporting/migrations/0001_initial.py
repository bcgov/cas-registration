# Generated by Django 4.2.11 on 2024-03-08 19:55

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name='Report',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(db_comment='The title of the report', max_length=100)),
                ('description', models.TextField(db_comment='The description of the report')),
                (
                    'created_at',
                    models.DateTimeField(auto_now_add=True, db_comment='The timestamp when the report was created'),
                ),
            ],
            options={
                'db_table': 'erc"."report',
                'db_table_comment': 'A table to store reports',
            },
        ),
    ]
