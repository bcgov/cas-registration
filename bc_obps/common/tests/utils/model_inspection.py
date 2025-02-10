from django.db.models import CASCADE, Field, Model


def get_cascading_models(model: Model | Field) -> set[Model]:
    if not hasattr(model, "_meta"):
        return {}

    delete_cascade_models = {
        r.related_model for r in model._meta.get_fields() if hasattr(r, "on_delete") and r.on_delete == CASCADE
    }
    nested_models_list = [get_cascading_models(m) for m in delete_cascade_models]
    nested_models = {item for nested_list in nested_models_list for item in nested_list}

    return {*delete_cascade_models, *nested_models}
