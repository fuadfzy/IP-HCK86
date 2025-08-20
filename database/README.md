# Database Setup Instructions

1. Ensure PostgreSQL is installed and running.
2. Create the database:
   ```sh
   createdb restaurant_ordering
   ```
3. Run the schema to create tables:
   ```sh
   psql -d restaurant_ordering -f database/schema.sql
   ```
4. (Optional) Add seed data as needed.

**Connection String Example:**
```
postgresql://<user>:<password>@localhost:5432/restaurant_ordering
```

Update your backend `.env` file with the correct connection string.
