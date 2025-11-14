from django.db import migrations


TEMPLATE_NAME = "Compliance Obligation Due Date Passed - Penalty now Accruing"
TEMPLATE_SUBJECT = "BCIERS Notification – Compliance Obligation Unmet"

TEMPLATE_BODY = '''
    <p style="text-align: center;">Province of British Columbia</p>
    <p style="text-align: center;">B.C. Industrial Emissions Reporting System (BCIERS)</p>
    <br/>
    <p>Dear {{operator_legal_name}},</p>
    <br/>
    <p>
        Based on our records, <b>{{operation_name}}</b> has an unmet compliance obligation
        <b>{{tonnes_of_co2}}</b> in the amount of <b>{{outstanding_balance}}</b>.
    </p>
    <br/>
    <p>
        The unmet compliance obligation is now subject to daily compounding penalties, as well as interest under
        the <i>Financial Administration Act</i> (FAA). These charges will continue to accrue until the outstanding
        obligation is met. Upon meeting the obligation, the BCIERS will calculate and invoice the amount of the
        penalty. You will be able to pay the penalty and interest once you receive the penalty invoice.
    </p>
    <br/>
    <p>
        To review your compliance obligation and/or penalty, including how it was calculated, log-into BCIERS at
        <a href="https://industrialemissions.gov.bc.ca/onboarding">https://industrialemissions.gov.bc.ca/onboarding</a>.
    </p>
    <p>To meet your compliance obligation:</p>
    <ol>
        <li>Navigate to the Compliance module and click <i>My Compliance &gt; Compliance Summaries</i>.</li>
        <li>Find your operation in the grid and click <em>Manage Obligation</em>.</li>
    </ol>
    <br/>
    <p>
        <b>Please Note:</b> It may take up to five business days for payments to be processed and reconciled.
        Once payment is received, BCIERS updates the obligation status accordingly. The Ministry uses the payment
        date to determine compliance with the deadline and whether a penalty exists. For clarity, the payment date
        is the date when payment is deposited to the B.C. OBPS bank account. If a payment date is on or before
        the November 30 deadline and processed after the deadline, BCIERS may temporarily show that a penalty
        exists until the payment is processed and the system refreshes the information. Please refer to the
        B.C. OBPS compliance module guidance document on our website for further information.
    </p>
    <br/>
    <p>
        If you have recently submitted payment and/or compliance units, please check that the details provided in
        your Payment Notification are accurate and that you have paid in full.
    </p>
    <p>
        If the details in your Payment Notification are correct and you have met your compliance obligation,
        you may disregard this email.
    </p>
    <p>
        If the payment information does not match the details provided in your Payment Notification email as
        required in the Payment Instructions available in BCIERS, we cannot process your payment.
    </p>
    <br/>
    <p>
        If you need to correct the payment information you have provided, please contact us at
        <a href="mailto:OBPSPayments@gov.bc.ca">OBPSPayments@gov.bc.ca</a>.
    </p>
    <br/>
    <p><em>
        Please do not reply to this email. This email is auto-generated. If you have any questions, or need
        further assistance, please reach out to our support team at
        <a href="mailto:GHGRegulator@gov.bc.ca">GHGRegulator@gov.bc.ca</a>.
    </em></p>
    <br/>
    <p>Best Regards,</p>
    <p>Ministry of Energy and Climate Solutions</p>
    <p>Email: <a href="mailto:GHGRegulator@gov.bc.ca">GHGRegulator@gov.bc.ca</a></p>
    <p>Website: <a href="https://www2.gov.bc.ca/gov/content/environment/climate-change/industry/bc-output-based-pricing-system">
        BC Government Website Link</a>
    </p>
'''


def create_penalty_accrual_template(apps, schema_editor):
    EmailNotificationTemplate = apps.get_model('common', 'EmailNotificationTemplate')
    EmailNotificationTemplate.objects.create(
        name=TEMPLATE_NAME,
        subject=TEMPLATE_SUBJECT,
        body=TEMPLATE_BODY,
    )


def reverse_penalty_accrual_template(apps, schema_editor):
    EmailNotificationTemplate = apps.get_model('common', 'EmailNotificationTemplate')
    EmailNotificationTemplate.objects.filter(name=TEMPLATE_NAME).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('common', '0094_update_dashboard_data'),
    ]

    operations = [
        migrations.RunPython(
            create_penalty_accrual_template,
            reverse_penalty_accrual_template,
            elidable=True,
        ),
    ]
