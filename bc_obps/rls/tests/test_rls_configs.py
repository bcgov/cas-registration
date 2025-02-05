import pytest
from django.conf import settings
from rls.tests.helpers import get_models_for_rls


@pytest.mark.skipif(not settings.RLS_FLAG, reason="RLS implementation")
class TestRlsConfigs:
    def test_all_models_have_rls(self):
        models = get_models_for_rls()
        missing_rls, missing_grants, missing_m2m = [], [], []

        for model in models:
            rls = getattr(model, "Rls", None)
            if rls is None:
                missing_rls.append(model.__name__)
                continue

            if not hasattr(rls, "grants"):
                missing_grants.append(model.__name__)

            many_to_many_fields = model._meta.many_to_many
            if many_to_many_fields:
                m2m_rls_list = getattr(rls, "m2m_rls_list", None)
                if not m2m_rls_list or len(many_to_many_fields) != len(m2m_rls_list):
                    missing_m2m.append(model.__name__)

        errors = []
        if missing_rls:
            errors.append(f"Models missing Rls class:\n{'\n'.join(missing_rls)}")
        if missing_grants:
            errors.append(f"Models missing Rls.grants attribute:\n{'\n'.join(missing_grants)}")
        if missing_m2m:
            errors.append(
                f"Models missing Rls.m2m_rls_list attribute or has incorrect number of M2mRls:\n{'\n'.join(missing_m2m)}"
            )

        assert not errors, "\n\n".join(errors)
