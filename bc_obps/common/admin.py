from django.contrib import admin
from common.models import EmailNotificationTemplate, EmailNotification


@admin.register(EmailNotificationTemplate)
class EmailNotificationTemplateAdmin(admin.ModelAdmin):
    list_display = ('name', 'subject', 'body')
    search_fields = ('name',)
    ordering = ('name',)


@admin.register(EmailNotification)
class EmailNotificationAdmin(admin.ModelAdmin):
    list_display = ('transaction_id', 'message_id', 'template')
    search_fields = ('transaction_id',)
    ordering = ('transaction_id',)
