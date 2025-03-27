# Ignoring triggers (patched version of django-pgtrigger)

We ship a patched version of django-pgtrigger, since the original has issues with the double quotes in the meta class of our models.
This is temporary, and will either be fixed in version 5 of django-pgtrigger, or the team will submit an official PR upstream.

Just import our version before ignoring a trigger:

```py
import common.lib.pgtrigger as pgtrigger

with pgtrigger.ignore("app.Model:trigger_name"):
    do_stuff()

```
