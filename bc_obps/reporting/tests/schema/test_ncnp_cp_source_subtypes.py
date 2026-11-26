import pytest

from reporting.models import ActivitySourceTypeJsonSchema

MATCHING_SOURCE_SUBTYPE_ACTIVITIES = (
    ('ng_other_than_non_compression', 'ng_non_compression'),
    ('og_extraction_other_than_ncnp', 'og_extraction_non_compression'),
    ('gsc_other_than_non_compression', 'gsc_non_compression_non_combustion'),
)


def _source_subtypes(schema):
    return (
        schema.get('properties', {})
        .get('units', {})
        .get('items', {})
        .get('properties', {})
        .get('sourceSubType', {})
        .get('enum')
    )


@pytest.mark.django_db
def test_ncnp_cp_have_identical_source_subtypes():
    # Ensures that for each source type shared by NCNP and CP paired activities,
    # that their source subtype options are identical.
    activity_slugs = {slug for pair in MATCHING_SOURCE_SUBTYPE_ACTIVITIES for slug in pair}
    schemas_by_activity_and_source_type = dict(
        ((activity_slug, source_type), json_schema)
        for activity_slug, source_type, json_schema in ActivitySourceTypeJsonSchema.objects.filter(
            activity__slug__in=activity_slugs,
            valid_from__slug='2024',
            valid_to__slug='2025',
        ).values_list('activity__slug', 'source_type__json_key', 'json_schema')
    )

    discrepancies = []
    for left_activity_slug, right_activity_slug in MATCHING_SOURCE_SUBTYPE_ACTIVITIES:
        left_source_types = {
            source_type
            for activity, source_type in schemas_by_activity_and_source_type
            if activity == left_activity_slug
        }
        right_source_types = {
            source_type
            for activity, source_type in schemas_by_activity_and_source_type
            if activity == right_activity_slug
        }

        for source_type in sorted(left_source_types & right_source_types):
            left_subtypes = _source_subtypes(schemas_by_activity_and_source_type[(left_activity_slug, source_type)])
            right_subtypes = _source_subtypes(schemas_by_activity_and_source_type[(right_activity_slug, source_type)])
            if left_subtypes is not None and right_subtypes is not None and left_subtypes != right_subtypes:
                discrepancy = (
                    f'{left_activity_slug} / {right_activity_slug} source type "{source_type}"\n'
                    f'  {left_activity_slug}: {left_subtypes}\n'
                    f'  {right_activity_slug}: {right_subtypes}'
                )
                print(f'Source subtype discrepancy found:\n{discrepancy}')
                discrepancies.append(discrepancy)

    assert not discrepancies, '\n'.join(discrepancies)
