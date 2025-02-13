BEGIN;

INSERT INTO erc.contact (first_name, last_name, position_title, email, phone_number, business_role_id, address_id, operator_id)
SELECT u.first_name, u.last_name, u.position_title, u.email, u.phone_number, 'Operation Representative', NULL, uo.operator_id
FROM erc.user u
JOIN erc.user_operator uo ON u.user_guid = uo.user_id
WHERE uo.status = 'Approved'
AND NOT EXISTS (
	SELECT 1 FROM erc.contact c WHERE c.email = u.email
);

COMMIT;
