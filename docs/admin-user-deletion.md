# Enable admin user deletion

You need changes in **both VS Code and Supabase**. A delete policy alone cannot delete a Supabase Auth account. This change leaves dashboard queries, including `product_payment`, unchanged.

## 1. Get this code in VS Code

Check out the pull request branch, or merge it into `test/front-end` and pull that branch. The existing Users page already invokes the `admin-user-actions` Edge Function. The function implementation is now provided in this repository.

If the admin app already loads your users, keep its existing Supabase configuration. Otherwise copy `apps/admin/.env.example` to `apps/admin/.env.local` and set your project's URL and publishable key. Never put a service-role key in a `VITE_` variable.

## 2. Run the migration in Supabase

Open your existing project → **SQL Editor** → **New query**. Paste the entire contents of:

`supabase/migrations/20260930150000_admin_user_deletion.sql`

Click **Run**. Do not execute the original schema export marked “context only.” The migration runs in a transaction and does not delete current accounts. It:

- Adds `ON DELETE CASCADE` to the eight user/booking foreign keys in the supplied schema.
- Adds a profile read policy for signed-in users (their own profile) and active admins (all profiles).
- Protects `id`, `role` and `is_active` from direct client edits; blocks direct client profile deletion.

Future Auth deletions will remove the user's profile, addresses, bookings, booking payments, feedback, likes and notifications. Notifications referencing a deleted booking also disappear. Pets and categories remain. This permanently removes payment history, so sales totals derived from those payments will decrease. Review this behavior before applying the migration to a live project.

Existing policies are preserved. Review pre-existing SECURITY DEFINER functions that can edit profile roles: customers must not be able to promote themselves through another RPC. Existing restrictive SELECT policies can still prevent profile reads. The supplied schema export did not include policies or functions, so these could not be checked here.

Ensure your administrator's `public.user_profiles` row has `role = 'admin'` and `is_active = true`. Set this through the Supabase dashboard/SQL Editor, not customer-editable signup metadata.

## 3. Deploy the Edge Function

In Supabase → **Edge Functions**, create a function named exactly:

`admin-user-actions`

Paste the complete code from `supabase/functions/admin-user-actions/index.ts` and deploy. If a function with this name already exists, review/back up its current code before replacing it.

Set the function's platform **Verify JWT** setting to **off**, matching `supabase/config.toml`. The function itself verifies the bearer token with Supabase Auth on every request, then checks the caller's live admin profile. Do not remove these checks. This supports publishable API keys without relying on the legacy gateway JWT check.

Alternatively, with the Supabase CLI installed, deploy from the repository root:

```sh
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase functions deploy admin-user-actions
```

Hosted Supabase functions provide `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` server-side. Do not paste the service-role key into the frontend or GitHub. Frontend and function must use the same project.

The function rejects anonymous callers, customers and inactive administrators, and prevents deleting administrator accounts. It also supports the existing Edit button with an explicit field allowlist, so adding the endpoint does not leave that button unsupported. `is_active` remains a profile flag, not a Supabase Auth ban for customers.

## 4. Test using a disposable customer

Restart the admin app, log in as an active administrator, open **Users**, and delete a disposable test customer after reviewing the confirmation.

Confirm:

- The account disappears from **Authentication → Users**.
- Its `user_profiles` row and related records disappear in **Table Editor**.
- Pets and categories remain.
- A customer session cannot call this function successfully.

No real accounts were deleted while implementing this change.

The function calls `auth.admin.deleteUser()` once. Database cascades remove child rows within that deletion; it does not manually delete child rows first. If a foreign key blocks deletion, the database rolls back the related row deletions.

If the user owns **Supabase Storage objects**, Supabase may reject the Auth deletion. The UI then displays a failure. Review/remove or transfer those owned objects using Supabase Storage before retrying. The function does not guess storage paths or automatically remove files.

Deleting Auth users does not immediately invalidate already-issued JWTs. Audit your existing customer RLS policies to ensure sensitive operations require an existing active profile, especially for retained objects such as Storage. Those policies were not included in the supplied schema.

## Local validation

With Node 22.13+:

```sh
cd supabase/tests
npm install
npm test
```

The tests use embedded Postgres and mocked Auth calls. They exercise profile access checks, privilege-field protection, deletion of all related rows, rollback on an extra FK blocker, and authorization failures before the Auth deletion call. They do not connect to your live Supabase project. Apply and deploy the above steps before live verification.
