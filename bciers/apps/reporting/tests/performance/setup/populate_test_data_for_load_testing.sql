DO $$
DECLARE
op_id UUID;
  fac_id UUID;
BEGIN
  -- Loop through creating operations
FOR i IN 1..999 LOOP
    -- Generate the operation UUID
    op_id := concat('00000000-0000-0000-0000-', LPAD(i::TEXT, 12, '0'))::uuid;

    -- Insert into the operation table
INSERT INTO erc.operation (
    id, created_at, name, type, operator_id, operation_has_multiple_operators,
    naics_code_id, status, registration_purpose
)
VALUES (
           op_id,
           '2025-03-11T19:54:04.734Z',
           concat('test operation ', i),
           'Linear Facilities Operation',
           '4242ea9d-b917-4129-93c2-db00b7451051',
           false,
           20,
           'Registered',
           'OBPS Regulated Operation'
       );

-- Insert contacts for this operation (contact IDs 1 and 2)
INSERT INTO erc.operation_contacts (operation_id, contact_id)
VALUES (op_id, 1), (op_id, 2);

-- Insert activities for this operation (activity IDs 1 and 34)
INSERT INTO erc.operation_activities (operation_id, activity_id)
VALUES (op_id, 1), (op_id, 34);

-- Insert regulated products for this operation (regulated product IDs 1 and 2)
INSERT INTO erc.operation_regulated_products (operation_id, regulatedproduct_id)
VALUES (op_id, 1), (op_id, 2);

-- Insert 10 facilities for each operation
FOR j IN 1..10 LOOP
        fac_id := gen_random_uuid();

        -- Insert into the facility table
INSERT INTO erc.facility (
    id, created_at, name, type, operation_id
)
VALUES (
           fac_id,
           '2025-03-11T19:54:04.734Z',
           concat('Test Facility ', i, '-', j),
           'Large Facility',
           op_id
       );

-- Insert into the facility_designated_operation_timeline table
INSERT INTO erc.facility_designated_operation_timeline (
    facility_id, operation_id, start_date, end_date
)
VALUES (
           fac_id,
           op_id,
           '2025-03-11T19:54:04.734Z',
           NULL
       );

END LOOP;
END LOOP;
END $$;
