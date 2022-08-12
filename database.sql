CREATE TABLE IF NOT EXISTS users
(
    uid uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    nickname varchar UNIQUE NOT NULL,
    password varchar NOT NULL,
    email varchar UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS tags
(
    id SERIAL PRIMARY KEY,
    name varchar UNIQUE NOT NULL,
    creator uuid NOT NULL,
    sort_order integer DEFAULT 0,
    FOREIGN KEY (creator) REFERENCES users (uid)
);

CREATE TABLE IF NOT EXISTS user_tags
(
    user_id uuid NOT NULL,
    tag_id integer NOT NULL,
    UNIQUE (user_id, tag_id),
    FOREIGN KEY (user_id) REFERENCES users (uid),
    FOREIGN KEY (tag_id) REFERENCES tags (id)
);

CREATE TABLE IF NOT EXISTS tokens
(
    user_id uuid NOT NULL,
    token varchar NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (uid)
);