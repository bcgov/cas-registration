DO $$
DECLARE
    table_name_text text;
BEGIN
    FOR table_name_text IN (SELECT table_name FROM information_schema.tables WHERE table_schema = 'erc')
    LOOP
        EXECUTE 'TRUNCATE TABLE erc.' || table_name_text || ' CASCADE';
    END LOOP;
END $$;
