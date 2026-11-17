create table if not exists weekly_reminder (
    id uuid primary key default gen_random_uuid(),
    id_user uuid not null references users(id) on delete cascade,
    day_of_week smallint not null check (day_of_week between 0 and 6),
    time time not null
);

alter table weekly_reminder
add constraint weekly_reminder_one_per_user unique (id_user);
