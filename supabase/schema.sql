-- RK Decoration – Supabase (free) database setup
-- Paste this whole file in Supabase → SQL Editor → New query → Run.

create table if not exists public.bookings (
  id              uuid primary key default gen_random_uuid(),
  booking_code    text not null unique,
  created_at      timestamptz not null default now(),
  name            text not null check (char_length(name) between 1 and 80),
  phone           text not null check (phone ~ '^[6-9][0-9]{9}$'),
  email           text check (email is null or char_length(email) <= 120),
  event_type      text not null check (char_length(event_type) <= 80),
  package         text not null check (char_length(package) <= 40),
  addons          text[] not null default '{}',
  event_date      date not null,
  event_time      text not null check (char_length(event_time) <= 60),
  venue           text not null check (char_length(venue) between 1 and 300),
  guests          int check (guests is null or guests between 0 and 10000),
  notes           text check (notes is null or char_length(notes) <= 1000),
  total_amount    int not null check (total_amount >= 0),
  advance_amount  int not null check (advance_amount >= 0),
  status          text not null default 'pending' check (status in ('pending','confirmed','completed','cancelled')),
  payment_status  text not null default 'unpaid' check (payment_status in ('unpaid','advance_paid','paid')),
  payment_ref     text check (payment_ref is null or char_length(payment_ref) <= 40),
  admin_notes     text
);
create index if not exists bookings_event_date_idx on public.bookings (event_date);

create table if not exists public.blocked_dates (
  day        date primary key,
  reason     text,
  created_at timestamptz not null default now()
);

-- ---------- Security (Row Level Security) ----------
alter table public.bookings enable row level security;
alter table public.blocked_dates enable row level security;

-- Customers (anonymous) can only CREATE new pending/unpaid bookings. They cannot read the list.
drop policy if exists "public can create bookings" on public.bookings;
create policy "public can create bookings" on public.bookings
  for insert to anon, authenticated
  with check (status = 'pending' and payment_status = 'unpaid' and payment_ref is null and admin_notes is null);

-- Logged-in admins can do everything.
drop policy if exists "admins manage bookings" on public.bookings;
create policy "admins manage bookings" on public.bookings
  for all to authenticated using (true) with check (true);

drop policy if exists "admins manage blocked dates" on public.blocked_dates;
create policy "admins manage blocked dates" on public.blocked_dates
  for all to authenticated using (true) with check (true);

-- ---------- Max bookings per day (keep in sync with maxBookingsPerDay in js/config.js) ----------
create or replace function public.rk_max_per_day() returns int language sql immutable as $$ select 3 $$;

-- Rejects new bookings for past, blocked or fully booked dates
create or replace function public.check_booking_capacity() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.event_date < (now() at time zone 'Asia/Kolkata')::date then
    raise exception 'DATE_UNAVAILABLE: date is in the past';
  end if;
  if exists (select 1 from blocked_dates where day = new.event_date) then
    raise exception 'DATE_UNAVAILABLE: date is blocked';
  end if;
  if (select count(*) from bookings where event_date = new.event_date and status <> 'cancelled') >= rk_max_per_day() then
    raise exception 'DATE_UNAVAILABLE: date is full';
  end if;
  return new;
end $$;

drop trigger if exists bookings_capacity on public.bookings;
create trigger bookings_capacity before insert on public.bookings
  for each row execute function public.check_booking_capacity();

-- ---------- Public functions (safe, limited data) ----------
-- Dates customers cannot book (blocked or full). Returns only dates, no customer data.
create or replace function public.get_unavailable_dates() returns setof date
language sql stable security definer set search_path = public as $$
  select day from blocked_dates where day >= (now() at time zone 'Asia/Kolkata')::date
  union
  select event_date from bookings
   where event_date >= (now() at time zone 'Asia/Kolkata')::date and status <> 'cancelled'
   group by event_date having count(*) >= rk_max_per_day()
$$;

-- Customer checks own booking with Booking ID + phone number.
create or replace function public.track_booking(p_code text, p_phone text)
returns table (
  booking_code text, name text, event_type text, package text, event_date date, event_time text,
  venue text, total_amount int, advance_amount int, status text, payment_status text, payment_ref text
)
language sql stable security definer set search_path = public as $$
  select b.booking_code, b.name, b.event_type, b.package, b.event_date, b.event_time,
         b.venue, b.total_amount, b.advance_amount, b.status, b.payment_status, b.payment_ref
    from bookings b
   where upper(b.booking_code) = upper(trim(p_code))
     and b.phone = right(regexp_replace(coalesce(p_phone, ''), '\D', '', 'g'), 10)
   limit 1
$$;

-- Customer submits UPI transaction ID (UTR) after paying the advance.
create or replace function public.submit_payment_ref(p_code text, p_phone text, p_ref text)
returns boolean
language plpgsql security definer set search_path = public as $$
begin
  if p_ref is null or char_length(trim(p_ref)) < 6 then
    return false;
  end if;
  update bookings
     set payment_ref = left(trim(p_ref), 40)
   where upper(booking_code) = upper(trim(p_code))
     and phone = right(regexp_replace(coalesce(p_phone, ''), '\D', '', 'g'), 10)
     and payment_status = 'unpaid'
     and status <> 'cancelled';
  return found;
end $$;

revoke all on function public.get_unavailable_dates() from public;
revoke all on function public.track_booking(text, text) from public;
revoke all on function public.submit_payment_ref(text, text, text) from public;
grant execute on function public.get_unavailable_dates() to anon, authenticated;
grant execute on function public.track_booking(text, text) to anon, authenticated;
grant execute on function public.submit_payment_ref(text, text, text) to anon, authenticated;
