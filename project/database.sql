CREATE DATABASE "crud_db";

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users
(
    uid uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    nickname varchar(30) UNIQUE NOT NULL,
    password varchar(100) NOT NULL,
    email varchar(100) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS tags
(
    id SERIAL PRIMARY KEY,
    name varchar(40) UNIQUE NOT NULL,
    creator uuid,
    "sortOrder" integer DEFAULT 0,
    FOREIGN KEY (creator) REFERENCES users (uid) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS user_tags
(
    user_id uuid NOT NULL,
    tag_id integer NOT NULL,
    UNIQUE (user_id, tag_id),
    FOREIGN KEY (user_id) REFERENCES users (uid) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tokens
(
    user_id uuid NOT NULL,
    token varchar NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (uid) ON DELETE CASCADE
);