alter table users
add column pending_email varchar(255);

alter table users
add column email_change_token_hash varchar(255);


alter table users
add column email_change_expires_at varchar(255)