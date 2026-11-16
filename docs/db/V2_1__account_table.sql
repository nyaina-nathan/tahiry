-- Active: 1793448977537@@127.0.0.1@5432@penny_wise@public
create table if not exists account(
    id uuid primary key default gen_random_uuid(),
    id_user uuid not null references users(id) on delete cascade,
    name varchar(50) not null,
    created_at timestamptz default now()
);

alter table money_movements
add column id_account uuid references account(id) on delete set null;

alter table money_movements
add column id_account_source uuid references account(id) on delete set null

-- 1. Create the ENUM type
CREATE TYPE movement_type AS ENUM ('EXPENSE', 'INCOME', 'TRANSFERT');

-- 2. Add a temporary column using the new enum type
ALTER TABLE money_movements ADD COLUMN movement_type_new movement_type;

-- 3. Copy and cast data from the old column to the new column
UPDATE money_movements SET movement_type_new = movement_type::text::movement_type;

-- 4. Drop the old column and the old check constraint
ALTER TABLE money_movements DROP COLUMN movement_type;

-- 5. Rename the new column to the original name
ALTER TABLE money_movements RENAME COLUMN movement_type_new TO movement_type;

-- 6. Set the NOT NULL constraint and default value back if needed
ALTER TABLE money_movements 
  ALTER COLUMN movement_type SET NOT NULL,
  ALTER COLUMN movement_type SET DEFAULT 'EXPENSE'::movement_type;