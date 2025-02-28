# Events App

This Django app centralizes all signals used across the application, promoting loose coupling between components.

## Purpose

The Events app serves as a central hub for defining signals that enable communication between different Django apps without creating direct dependencies.

## Usage

### Defining Signals

All signals should be defined in `events/signals.py`. Each signal should include documentation about its purpose and the parameters it provides.

```python
# In events/signals.py
from django.dispatch import Signal

my_signal = Signal()
my_signal.providing_args = ['param1', 'param2']
```

### Sending Signals

To send a signal from any app:

```python
from events.signals import my_signal

my_signal.send(
    sender=YourClass,
    param1=value1,
    param2=value2
)
```

### Receiving Signals

To receive and handle a signal in any app:

1. Create a `signals.py` file in your app
2. Define handler functions with the `@receiver` decorator
3. Import the signals module in your app's `apps.py` file

```python
# In your_app/signals.py
from django.dispatch import receiver
from events.signals import my_signal

@receiver(my_signal)
def handle_my_signal(sender, **kwargs):
    param1 = kwargs.get('param1')
    param2 = kwargs.get('param2')
    # Handle the signal
```

```python
# In your_app/apps.py
class YourAppConfig(AppConfig):
    name = 'your_app'
    
    def ready(self):
        # Import signals to register handlers
        from . import signals  # noqa: F401
```

## Available Signals

- `report_submitted`: Sent when a report is submitted

See `events/signals.py` for the complete list of signals and their parameters. 