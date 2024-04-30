---
Django ER Diagram
---
erDiagram
EmailNotificationTemplate {
    BigAutoField id
    CharField name
    CharField subject
    TextField body
}
EmailNotification {
    UUIDField transaction_id
    UUIDField message_id
    ArrayField recipients_email
    ForeignKey template
}
EmailNotification }|--|| EmailNotificationTemplate : template