from django.db import migrations


def create_compliance_met_penalty_due_notice_email_template(apps, schema_editor):
    EmailNotificationTemplate = apps.get_model("common", "EmailNotificationTemplate")
    EmailNotificationTemplate.objects.create(
        name="Notice of Obligation Met Penalty Due",
        subject="BCIERS Notification – Penalty Due",
        body="""
            <p style="text-align: center;">Province of British Columbia</p>
            <p style="text-align: center;">B.C. Industrial Emissions Reporting System (BCIERS)</p>
            <br/>
            <p>Dear {{operator_legal_name}},</p>
            <br/>
            <p>
              As the compliance obligation for compliance period {{compliance_year}} was not met by the {{compliance_deadline}} deadline,
              <b>{{operation_name}}</b> has an outstanding automatic administrative penalty in the amount of <b>{{penalty_amount}}</b>.
            </p>
            <p>
              This penalty amount is the result of daily compounding penalties under the
              <em>Greenhouse Gas Emission Administrative Penalties and Appeals Regulation (GGEAPAR)</em>.
            </p>
            <p>
              To review this penalty, including how it was calculated, log-into BCIERS at
              <a href="https://industrialemissions.gov.bc.ca/onboarding">https://industrialemissions.gov.bc.ca/onboarding</a>.
            </p>
            <p>To pay the penalty amount:</p>
            <ol type="1">
              <li>Navigate to the Compliance module and click <em>My Compliance</em> &gt; <em>Compliance Summaries</em>.</li>
              <li>Find your operation in the grid and click <em>Manage Obligation</em>.</li>
              <li>Navigate to the automatic overdue penalty page.</li>
              <li>Click <em>Generate Penalty Invoice</em>. Download and follow the payment instructions.</li>
            </ol>
            <p>
              <b>Please Note:</b> It may take up to five business days for payments to be processed and reconciled.
              Once payment is received, BCIERS updates the penalty status accordingly.
            </p>
            <p>
              If you do not pay the automatic overdue penalty invoice within 30 days, the amount will be subject to interest
              under the <em>Financial Administration Act</em> (FAA). We strongly encourage you to make your payment on time to avoid
              these additional charges. Please refer to the B.C. OBPS compliance module guidance document on our website for further information.
            </p>
            <p>
              <em>Please do not reply to this email. This email is auto-generated. If you have
              any questions, or need further assistance, please reach out to our support team at
              <a href="mailto:GHGRegulator@gov.bc.ca">GHGRegulator@gov.bc.ca</a>.</em>
            </p>
            <br/>
            <p>Best Regards,</p>
            <p>Ministry of Energy and Climate Solutions</p>
            <p>Email: <a href="mailto:GHGRegulator@gov.bc.ca">GHGRegulator@gov.bc.ca</a></p>
            <p>
              Website:
              <a href="https://www2.gov.bc.ca/gov/content/environment/climate-change/industry/bc-output-based-pricing-system">
                BC Government Website Link
              </a>
            </p>
        """,
    )


def reverse_compliance_met_penalty_due_notice_email_template(apps, schema_editor):
    EmailNotificationTemplate = apps.get_model("common", "EmailNotificationTemplate")
    EmailNotificationTemplate.objects.filter(name="Notice of Obligation Met Penalty Due").delete()


class Migration(migrations.Migration):
    dependencies = [
        ("common", "0107_update_notice_of_obligation_generated_notification_email_template"),
    ]

    operations = [
        migrations.RunPython(
            create_compliance_met_penalty_due_notice_email_template,
            reverse_compliance_met_penalty_due_notice_email_template,
        )
    ]
