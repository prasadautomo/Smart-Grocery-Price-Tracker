# Database schema location

The previous `database/schema.sql` demo script granted public read and write access, so it has been removed. Use the account-scoped schema at [`../supabase/schema.sql`](../supabase/schema.sql) for new projects and upgrades. It removes the former public policies and applies owner-based Row Level Security.
