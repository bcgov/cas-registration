# Entity-Relationship Diagram (ERD) Generation

We use [Mermaid](https://mermaid-js.github.io/mermaid/) to create ERD diagrams for our data models. The [django-diagram](https://github.com/nick-solly/django-diagram) package enables the generation of ERD diagrams specific to our Django models.

To generate the most recent ERD diagram, navigate to the `bc_obps` directory (where the `manage.py` file is located) and execute the following command in your terminal:

```bash
poetry run python -m django_diagram --app=registration --output=../erd.md --settings=bc_obps.settings

```
