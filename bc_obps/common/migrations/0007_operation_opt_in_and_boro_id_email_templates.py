# Generated by Django 4.2.8 on 2024-04-26 20:28

from django.db import migrations


def opt_in_and_submit_operation_boro_id_email_notification_templates(apps, schema_editor):
    """
    Create EmailNotificationTemplate objects for confirming the submission of a BORO ID application, and for approving, declining, or requesting changes on the BORO ID application for opted-in operations.
    """
    EmailNotificationTemplate = apps.get_model('common', 'EmailNotificationTemplate')
    EmailNotificationTemplate.objects.create(
        name='Opt-in And BORO ID Application Confirmation',
        subject='BCIERS Receipt Acknowledgement - Opt-in and BORO ID application for {{ operation_name }} of {{ operator_legal_name }}',
        body='''
            <p style="text-align: center;">Province of British Columbia</p>
            <p style="text-align: center;">B.C. Industrial Emissions Reporting System (BCIERS)</p><br>
            <p>Dear {{ external_user_full_name }},</p><br>
            <p>Part of your application to opt-in as a reporting and regulated operation and obtain a BC OBPS Regulated Operation ID (BORO ID) for {{ operation_name }} of {{ operator_legal_name }} has been received by the Climate Action Secretariat (CAS) through BCIERS.</p>
            <p>A complete application requires additional documents to be sent to <a href="mailto:GHGRegulator@gov.bc.ca">GHGRegulator@gov.bc.ca.</a> according to <a href="https://www2.gov.bc.ca/gov/content/environment/climate-change/industry/bc-output-based-pricing-system#opting-in">B.C. Output-Based Pricing System - Province of British Columbia (gov.bc.ca)</a>.</p><br>
            <p>CAS will only review a complete application. Once a complete application has been received, please allow 3-5 business days to process this request. Clarifications and changes may be requested as part of the reviewing process. Once a decision is made, you may expect a notification email.</p><br>
            <p>If you have any questions, please contact our support team at <a href="mailto:GHGRegulator@gov.bc.ca">GHGRegulator@gov.bc.ca.</a></p><br>
            <p>Sent to: {{ external_user_email_address }}</p>
            <p>On behalf of the Climate Action Secretariat</p>
        ''',
    )

    EmailNotificationTemplate.objects.create(
        name='Opt-in And BORO ID Application Approved',
        subject='BCIERS Approval Notification – Opt-in and BORO ID application for {{ operation_name }} of {{ operator_legal_name }}',
        body='''
            <p style="text-align: center;">Province of British Columbia</p>
            <p style="text-align: center;">B.C. Industrial Emissions Reporting System (BCIERS)</p><br>
            <p>Dear {{ external_user_full_name }},</p><br>
            <p>Your application to opt-in as a reporting and regulated operation and obtain a BC OBPS Regulated Operation ID (BORO ID) for {{ operation_name }} of {{ operator_legal_name }} has been approved by the Climate Action Secretariat.</p>
            <p>Please log back into <a href="https://registration.industrialemissions.gov.bc.ca/">BCIERS</a> to see {{ operation_name }}’s assigned BORO ID. For more information on how to use the BORO ID, please refer to <a href="https://www2.gov.bc.ca/assets/gov/environment/climate-change/ind/obps/guidance/bc_obps_guidance.pdf">Getting Started with the B.C. Output-Based Pricing System (gov.bc.ca)</a>.</p><br>
            <p>If you have any questions, please contact our support team at <a href="mailto:GHGRegulator@gov.bc.ca">GHGRegulator@gov.bc.ca.</a></p><br>
            <p>Sent to: {{ external_user_email_address }}</p>
            <p>On behalf of the Climate Action Secretariat</p>
        ''',
    )
    EmailNotificationTemplate.objects.create(
        name='Opt-in And BORO ID Application Declined',
        subject='BCIERS Decline Notification – Opt-in and BORO ID application for {{ operation_name }} of {{ operator_legal_name }}',
        body='''
            <p style="text-align: center;">Province of British Columbia</p>
            <p style="text-align: center;">B.C. Industrial Emissions Reporting System (BCIERS)</p><br>
            <p>Dear {{ external_user_full_name }},</p><br>
            <p>Your application to opt-in as a reporting and regulated operation and obtain a BC OBPS Regulated Operation ID (BORO ID) for {{ operation_name }} of {{ operator_legal_name }} has been declined by the Climate Action Secretariat.</p><br>
            <p>If you have any questions, please contact our support team at <a href="mailto:GHGRegulator@gov.bc.ca">GHGRegulator@gov.bc.ca.</a></p><br>
            <p>Sent to: {{ external_user_email_address }}</p>
            <p>On behalf of the Climate Action Secretariat</p>
        ''',
    )
    EmailNotificationTemplate.objects.create(
        name='Opt-in And BORO ID Application Changes Requested',
        subject='BCIERS Changes Request – Opt-in and BORO ID application for {{ operation_name }} of {{ operator_legal_name }}',
        body='''
            <p style="text-align: center;">Province of British Columbia</p>
            <p style="text-align: center;">B.C. Industrial Emissions Reporting System (BCIERS)</p><br>
            <p>Dear {{ external_user_full_name }},</p><br>
            <p>Changes are requested to your application to opt-in as a reporting and regulated operation and obtain a BC OBPS Regulated Operation ID (BORO ID) for {{ operation_name }} of {{ operator_legal_name }}.</p>
            <p>A staff member of the Climate Action Secretariat has sent, or will send shortly, an email explaining the details of the changes requested. Please revise and resubmit your application accordingly.</p><br>
            <p>If you have any questions, please contact our support team at <a href="mailto:GHGRegulator@gov.bc.ca">GHGRegulator@gov.bc.ca.</a></p><br>
            <p>Sent to: {{ external_user_email_address }}</p>
            <p>On behalf of the Climate Action Secretariat</p>
        ''',
    )


def reverse_opt_in_and_submit_operation_boro_id_email_notification_templates(apps, schema_editor):
    """
    Reverse EmailNotificationTemplate objects for confirming the submission of a BORO ID application, and for approving, declining, or requesting changes on the BORO ID application for opted-in operations.
    """
    EmailNotificationTemplate = apps.get_model('common', 'EmailNotificationTemplate')
    EmailNotificationTemplate.objects.filter(
        name_in=[
            'BORO ID Application Submission Confirmation',
            'BORO ID Application Approval',
            'BORO ID Application Declined',
            'BORO ID Application Changes Requested',
        ]
    ).delete()


class Migration(migrations.Migration):
    dependencies = [
        ('common', '0006_operation_boro_id_email_templates'),
    ]

    operations = [
        migrations.RunPython(
            opt_in_and_submit_operation_boro_id_email_notification_templates,
            reverse_opt_in_and_submit_operation_boro_id_email_notification_templates,
            elidable=True,
        )
    ]
