BEGIN;
WITH new_contacts AS (
    INSERT INTO erc.contact (
        first_name, 
        last_name, 
        email, 
        phone_number, 
        business_role_id, 
        address_id, 
        position_title, 
        created_at
    ) SELECT 
        u.first_name, 
        u.last_name, 
        u.email, 
        u.phone_number, 
        'Operation Representative' AS business_role_id, 
        NULL AS address_id, 
        u.position_title, 
        NOW() as created_at 
    FROM erc.user_operator uo 
    JOIN erc.user u ON uo.user_id = u.user_guid 
    WHERE uo.status = 'Approved' 
    AND NOT EXISTS (
        SELECT 1 from erc.contact c 
        WHERE c.email = u.email) 
        RETURNING id, email) 
        INSERT INTO erc.operator_contacts (
            operator_id, contact_id) 
        SELECT uo.operator_id, nc.id 
        FROM new_contacts nc 
        JOIN erc.user u on nc.email = u.email 
        JOIN erc.user_operator uo ON u.user_guid = uo.user_id;
COMMIT;