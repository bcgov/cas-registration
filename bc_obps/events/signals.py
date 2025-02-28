"""
Centralized signal definitions for the entire application.

This module defines all signals that can be used across different apps,
promoting loose coupling between components.

Usage:
    from events.signals import report_submitted
    
    # To send a signal
    report_submitted.send(
        sender=YourClass,
        param1=value1,
        param2=value2
    )
    
    # To receive a signal
    @receiver(report_submitted)
    def your_handler(sender, **kwargs):
        # Handle the signal
        pass
"""

from django.dispatch import Signal

# Reporting signals
report_submitted = Signal()
report_submitted.providing_args = ['version_id', 'user_guid']

# Add more signals as needed for different app domains 