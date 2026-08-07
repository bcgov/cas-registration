from django.db import migrations


def create_penalty_paid_email_template(apps, schema_editor):
    EmailNotificationTemplate = apps.get_model('common', 'EmailNotificationTemplate')
    EmailNotificationTemplate.objects.create(
        name='Notice of Penalty Paid',
        subject='BCIERS Notification – Penalty Paid',
        body='''
            <p style="text-align: center;">Province of British Columbia</p>
            <p style="text-align: center;">B.C. Industrial Emissions Reporting System (BCIERS)</p>
            <br/>
            <p>Dear {{operator_legal_name}},</p>
            <br/>
            <p>This email confirms that the penalty for {{operation_name}} has been paid.
            </p>
            <br/>
            <p><em>Please do not reply to this email. This email is auto-generated. If you have any questions, or need further assistance, please reach out to our support team at <a href="mailto:GHGRegulator@gov.bc.ca">GHGRegulator@gov.bc.ca</a></em></p>
            <br/>
            <p>Best Regards,</p>
            <p>Ministry of Energy and Climate Solutions</p>
            <p>Email: <a href="mailto:GHGRegulator@gov.bc.ca">GHGRegulator@gov.bc.ca</a></p>
            <p>Website: <a href="https://www2.gov.bc.ca/gov/content/environment/climate-change/industry/bc-output-based-pricing-system">BC
              Government Website Link</a>
            </p>
        ''',
    )


def reverse_penalty_paid_email_template(apps, schema_editor):
    EmailNotificationTemplate = apps.get_model('common', 'EmailNotificationTemplate')
    EmailNotificationTemplate.objects.filter(name='Notice of Penalty Paid').delete()


class Migration(migrations.Migration):
    dependencies = [
        ('common', '0111_V5_3_1'),
    ]

    operations = [
        migrations.RunPython(
            create_penalty_paid_email_template,
            reverse_penalty_paid_email_template,
            elidable=True,
        )
    ]
