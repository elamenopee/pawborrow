import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { stripTypeScriptTypes } from 'node:module';
import vm from 'node:vm';

const adminId = '00000000-0000-4000-8000-000000000001';
const customerId = '00000000-0000-4000-8000-000000000002';
const migration = readFileSync(new URL('../migrations/20260930150000_admin_user_deletion.sql', import.meta.url), 'utf8');

// Minimal fixture of the supplied schema; no connection to a real project.
const fixture = `
create role anon; create role authenticated; create role service_role bypassrls;
create schema auth;
create function auth.uid() returns uuid language sql stable as $$
 select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
$$;
grant usage on schema auth to authenticated;
create table auth.users(id uuid primary key);
create table public.user_profiles(id uuid primary key references auth.users(id),
 role text not null default 'customer', is_active boolean not null default true);
create table public.pet_category(category_id bigint primary key, category_name text);
create table public.pet(pet_id bigint primary key, category_id bigint references public.pet_category, status text);
create table public.address(address_id bigint primary key, user_id uuid not null references public.user_profiles);
create table public.booking(booking_id bigint primary key, user_id uuid not null references public.user_profiles, pet_id bigint references public.pet);
create table public.payment(payment_id bigint primary key, booking_id bigint not null references public.booking,
 amount numeric not null, payment_status text not null, transaction_date timestamptz not null default now());
create table public.rating_feedback(feedback_id bigint primary key, booking_id bigint not null references public.booking);
create table public.liked_pet(liked_pet_id bigint primary key, user_id uuid not null references public.user_profiles, pet_id bigint references public.pet);
create table public.notification(notification_id bigint primary key, user_id uuid not null references public.user_profiles, booking_id bigint references public.booking);
insert into auth.users values ('${adminId}'), ('${customerId}');
insert into public.user_profiles values ('${adminId}', 'admin', true), ('${customerId}', 'customer', true);
insert into public.pet_category values(1, 'Dogs');
insert into public.pet values(1, 1, 'available'),(2, 1, 'unavailable');
insert into public.booking values(1, '${customerId}', 1);
insert into public.payment select n, 1, 10, 'paid', now() from generate_series(1, 1100) n;
insert into public.payment values(1101,1,999,'pending',now());
insert into public.address values(1,'${customerId}');
insert into public.rating_feedback values(1,1);
insert into public.liked_pet values(1,'${customerId}',1);
insert into public.notification values(1,'${customerId}',1);
`;

test('migration: profile authorization, privilege protection and atomic cascades', async () => {
  const db = new PGlite();
  try {
    await db.exec(fixture);
    await db.exec(migration);
    await db.exec(`set role authenticated; set request.jwt.claim.sub = '${customerId}';`);
    assert.equal((await db.query('select public.pawborrow_is_admin() as allowed')).rows[0].allowed, false);
    assert.equal((await db.query('select * from public.user_profiles')).rows.length, 1);
    await db.exec('reset role; grant update, delete on public.user_profiles to authenticated;');
    // Even an overly permissive old policy cannot grant role escalation.
    await db.exec('create policy fixture_update on public.user_profiles for all to authenticated using(true) with check(true); set role authenticated;');
    await assert.rejects(db.query(`update public.user_profiles set role='admin' where id='${customerId}'`), /server-managed/);
    await assert.rejects(db.query(`delete from public.user_profiles where id='${customerId}'`), /admin-user-actions/);
    await db.exec(`set request.jwt.claim.sub = '${adminId}';`);
    assert.equal((await db.query('select public.pawborrow_is_admin() as allowed')).rows[0].allowed, true);
    await db.exec('reset role;');
    await db.exec(`update public.user_profiles set is_active=false where id='${adminId}'; set role authenticated;`);
    assert.equal((await db.query('select public.pawborrow_is_admin() as allowed')).rows[0].allowed, false);
    await db.exec(`reset role; update public.user_profiles set is_active=true where id='${adminId}';`);
    // Extra FK blockers must roll back the entire deletion, including children.
    await db.exec(`create table public.blocker(id uuid references auth.users); insert into public.blocker values('${customerId}');`);
    await assert.rejects(db.query(`delete from auth.users where id='${customerId}'`), /foreign key/);
    assert.equal((await db.query('select count(*)::int as count from public.payment')).rows[0].count, 1101);
    await db.exec(`drop table public.blocker; delete from auth.users where id='${customerId}';`);
    for (const table of ['booking','payment','address','rating_feedback','liked_pet','notification']) {
      assert.equal((await db.query(`select count(*)::int as count from public.${table}`)).rows[0].count, 0, table);
    }
    assert.equal((await db.query('select count(*)::int as count from public.pet')).rows[0].count, 2);
    await db.exec(`set role authenticated;`);
    await db.exec('reset role; set role anon;');
    await assert.rejects(db.query('select public.pawborrow_is_admin()'), /permission denied/);
  } finally { await db.close(); }
});

const source = readFileSync(new URL('../functions/admin-user-actions/index.ts', import.meta.url), 'utf8')
  .replace(/import \{ createClient \} from .*?;\n/, '');
const compiled = stripTypeScriptTypes(source);
function handlerFor({ role='admin', active=true, targetRole='customer', validToken=true, deleteError=null } = {}) {
  let handler, deletes=0, updates=0;
  const client = {
    auth: {
      getUser: async () => ({ data: { user: validToken ? {id: adminId} : null }, error: null }),
      admin: { deleteUser: async () => { deletes++; return { error: deleteError }; } },
    },
    from: () => ({ select: () => ({ eq: () => ({
      single: async () => ({ data: { role, is_active: active }, error: null }),
      maybeSingle: async () => ({ data: { id: customerId, role: targetRole }, error: null }),
    }) }), update: () => { updates++; throw new Error('Unexpected update'); } }),
  };
  vm.runInNewContext(compiled, {
    createClient: () => client, Request, Response, console: { error() {} },
    Deno: { env: {get: () => 'fixture'}, serve: h => { handler=h; } },
  });
  return { call: async (body, token='token') => handler(new Request('https://fixture', {
    method: 'POST', headers: token ? {Authorization: `Bearer ${token}`} : {}, body: JSON.stringify(body),
  })), counts: () => ({deletes, updates}) };
}
test('Edge Function denies unauthorized/destructive invalid requests before Auth deletion', async () => {
  const body = {action:'delete', userId:customerId};
  for (const options of [{role:'customer'}, {active:false}, {targetRole:'admin'}, {validToken:false}]) {
    const mock = handlerFor(options);
    assert.ok([401,403].includes((await mock.call(body)).status));
    assert.equal(mock.counts().deletes, 0);
  }
  const mock = handlerFor();
  assert.equal((await mock.call(body, '')).status, 401);
  assert.equal((await mock.call({...body,userId:adminId})).status, 403);
  assert.equal((await mock.call({...body,userId:'bad'})).status, 400);
  assert.equal(mock.counts().deletes, 0);
  assert.equal((await mock.call(body)).status, 200);
  assert.equal(mock.counts().deletes, 1);
  assert.equal(mock.counts().updates, 0);
  const blocked = handlerFor({deleteError:{message:'FK violation'}});
  assert.equal((await blocked.call(body)).status, 409);
});
