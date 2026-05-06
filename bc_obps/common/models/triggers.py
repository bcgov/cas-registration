import pgtrigger


def immutable_slug_trigger() -> pgtrigger.Trigger:
    """
    Function generates a trigger to protect immutable 'slug' columns.
    The 'slug' fields are used as anchors across the app & should not be changed.
    """

    return pgtrigger.Trigger(
        name="immutable_slug",
        operation=pgtrigger.Operations(pgtrigger.Update),
        when=pgtrigger.Before,
        func=pgtrigger.Func(
            """
            begin

                if new.slug != old.slug then
                    raise exception 'slug field is immutable';
                end if;
                return new;

            end;
            """
        ),
    )
