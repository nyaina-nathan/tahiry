create table if not exists users (
    id uuid primary key default gen_random_uuid(),
    username varchar(255) not null,
    email varchar(255) not null unique,
    password_hash varchar(60) not null,
    currency varchar(20) not null,
    created_at timestamptz default now()
);

create table if not exists categories (
    id uuid primary key default gen_random_uuid(),
    id_user uuid not null references users(id) on delete cascade,
    cat_type varchar(7) not null check(cat_type in ('EXPENSE', 'INCOME')) default 'EXPENSE',
    cat_name varchar(255) not null
);

create table if not exists money_movements (
    id uuid primary key default gen_random_uuid(),
    id_user uuid not null references users(id) on delete cascade,
    id_category uuid references categories(id) on delete set null,
    movement_type varchar(7) not null check(movement_type in ('EXPENSE', 'INCOME')) default 'EXPENSE',
    title varchar(255) not null,
    description text,
    amount numeric(10 , 2) not null,
    logged_for date default current_date,
    logged_at timestamptz default now()
);