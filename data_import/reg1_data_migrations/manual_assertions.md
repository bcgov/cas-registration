Purpose: to assert that the manual migrations on prod data for Registration1 over to Administration/Registration2 are successful.

## Create Contacts from Existing Users

1. Assert that the number of industry_users (in `users` table) is less than or equal to the number of contacts (in `contacts` table).
2. Assert that the number of users in `user_operator` table with a status of "Approved" is less than or equal to the number of contacts (in `contacts` table).
3. Assert that no `cas_x` users appear in the `contacts` table.
4. Assert that each combination of (email_address, operator_id) in `operator_contacts` table is unique.
5. Assert that every record in `contacts` table has a FK reference to `operator_id`, and that all the operator IDs are valid (i.e., they appear in the `operators` table).

