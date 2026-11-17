create table password_reset_token(
    id uuid primary key default gen_random_uuid(),
    id_user uuid not null references users(id) on delete cascade,
    token_hash varchar(255) not null,
    expires_at timestamptz not null,
    used_at timestamptz,
    created_at timestamptz default now()
);