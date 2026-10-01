begin;

-- Never trust client-editable auth user_metadata for administrator privileges.
create or replace function public.pawborrow_is_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.user_profiles
    where id = auth.uid() and role::text = 'admin' and is_active
  );
$$;
revoke all on function public.pawborrow_is_admin() from public, anon;
grant execute on function public.pawborrow_is_admin() to authenticated;

-- Protect the fields used for authorization even if an existing update policy
-- allows customers to edit their own profile. SQL Editor/service_role still work.
create or replace function public.pawborrow_protect_profile_access()
returns trigger language plpgsql set search_path = '' as $$
begin
  if current_user in ('anon', 'authenticated') then
    if TG_OP = 'DELETE' then
      raise exception 'Use the admin-user-actions function to delete accounts.' using errcode = '42501';
    elsif TG_OP = 'INSERT' then
      if NEW.role::text <> 'customer' or not NEW.is_active then
        raise exception 'Account access fields are server-managed.' using errcode = '42501';
      end if;
    elsif NEW.id is distinct from OLD.id
       or NEW.role is distinct from OLD.role
       or NEW.is_active is distinct from OLD.is_active then
      raise exception 'Account access fields are server-managed.' using errcode = '42501';
    end if;
  end if;
  if TG_OP = 'DELETE' then return OLD; end if;
  return NEW;
end;
$$;
drop trigger if exists pawborrow_protect_profile_access on public.user_profiles;
create trigger pawborrow_protect_profile_access
before insert or update or delete on public.user_profiles
for each row execute function public.pawborrow_protect_profile_access();

alter table public.user_profiles enable row level security;
drop policy if exists pawborrow_profile_read on public.user_profiles;
create policy pawborrow_profile_read on public.user_profiles for select to authenticated
using (id = (select auth.uid()) or (select public.pawborrow_is_admin()));
grant select on public.user_profiles to authenticated;

-- A single Auth deletion cascades atomically through the supplied schema.
-- Do not delete child rows manually before the Auth API call.
alter table public.user_profiles drop constraint user_profiles_id_fkey,
  add constraint user_profiles_id_fkey foreign key (id) references auth.users(id) on delete cascade;
alter table public.address drop constraint address_user_id_fkey,
  add constraint address_user_id_fkey foreign key (user_id) references public.user_profiles(id) on delete cascade;
alter table public.booking drop constraint booking_user_id_fkey,
  add constraint booking_user_id_fkey foreign key (user_id) references public.user_profiles(id) on delete cascade;
alter table public.payment drop constraint payment_booking_id_fkey,
  add constraint payment_booking_id_fkey foreign key (booking_id) references public.booking(booking_id) on delete cascade;
alter table public.rating_feedback drop constraint rating_feedback_booking_id_fkey,
  add constraint rating_feedback_booking_id_fkey foreign key (booking_id) references public.booking(booking_id) on delete cascade;
alter table public.liked_pet drop constraint liked_pet_user_id_fkey,
  add constraint liked_pet_user_id_fkey foreign key (user_id) references public.user_profiles(id) on delete cascade;
alter table public.notification drop constraint notification_user_id_fkey,
  add constraint notification_user_id_fkey foreign key (user_id) references public.user_profiles(id) on delete cascade;
alter table public.notification drop constraint notification_booking_id_fkey,
  add constraint notification_booking_id_fkey foreign key (booking_id) references public.booking(booking_id) on delete cascade;

commit;
