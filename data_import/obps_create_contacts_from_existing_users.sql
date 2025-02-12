INSERT INTO "erc"."contact" (
    first_name,
    last_name,
    email,
    phone_number,
    business_role_id,
    address_id,
    operator_id,
    created_at,
)
SELECT
    u.first_name,
    u.last_name,
    u.email,
    u.phone_number,
    NULL AS business_role_id,  -- Assign business_role_id as needed
    NULL AS address_id,        -- Assign address_id if applicable
    uo.operator_id,
    NOW() AS created_at,
FROM "erc"."user_operator" uo
JOIN "erc"."user" u ON uo.user_id = u.user_guid
WHERE uo.status = 'Approved'
AND NOT EXISTS (
    SELECT 1 FROM "erc"."contact" c WHERE c.email = u.email
);
