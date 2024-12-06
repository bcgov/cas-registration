# RLS Demo Instructions

Run the migrations so the database has the necessary roles \
Run `poetry run python manage.py custom_migrate` \
This will apply the demo RLS to the following tables:

- emission_category
- operation
- operation_regulated_products (applied via a m2mRls class on operation)

You can check the table grants on each table with:

```sql
select grantee, privilege_type
from information_schema.role_table_grants
where table_name='<TABLE NAME>';
```

You can check if RLS was enabled on the table with:

```sql
select relname, relrowsecurity, relforcerowsecurity
from pg_class where relname = '<TABLE NAME>';
```

You can check the policies on a table with:

```sql
select c.relname, c.relrowsecurity, p.polname from pg_class c
join pg_policy p
on p.polrelid = c.oid
and c.relname = '<TABLE NAME>';
```

In an SQL terminal:
Run:

```sql
grant select on all tables in schema erc to industry_user;
update erc.operation set operator_id = '685d581b-5698-411f-ae00-de1d97334a71' where id != '3b5b95ea-2a1a-450d-8e2e-2e15feed96c9';
```

We're granting select permissions on all tables in the erc schema since not all RLS is set up (otherwise we'll get permission errors for our examples) \
The second part will make it so the operator that user ...00001 is an admin for only has one operation (which will help with testing the RLS)

In an SQL terminal:
Run:

```sql
select count(*) from erc.operation;
select count(*) from erc.operation_regulated_products;
select count(*) from erc.emission_category;
```

As a superuser, these count values will be ALL the records for those tables

In an SQL terminal:
Run

```sql
set my.guid = '00000000-0000-0000-0000-000000000001';
set role industry_user;
select count(*) from erc.operation;
select count(*) from erc.operation_regulated_products;
select count(*) from erc.emission_category;
```

We've now set the user guid & role like the middleware will once it's enabled \
The counts should be lower than the counts you just saw as a superuser because they are now bound by the following rules:

- operation: User can only view operations that are the child of an operator where the user is an approved admin in the user_operator table
- operation_regulated_products: Same as above
- emission_category: can only view records with id < 4 (contrived example)

**NOTE**:
If you need to run `make reset_db` to reset your database again, you'll have to drop the roles first otherwise the migration that adds them will complain that they already exist.\
To do this, run:

```sql
drop owned by industry_user, cas_director, cas_admin, cas_analyst, cas_pending, cas_view_only;
drop role industry_user, cas_director, cas_admin, cas_analyst, cas_pending, cas_view_only;
```
