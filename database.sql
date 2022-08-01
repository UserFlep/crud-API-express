CREATE TABLE users
(
    uid uuid DEFAULT uuid_generate_v4(),
    email character varying(100) NOT NULL,
    password character varying(100) NOT NULL,
    nickname character varying(30) NOT NULL,
    PRIMARY KEY (uid)
);

CREATE TABLE tags
(
    id SERIAL PRIMARY KEY,
    creator uuid NOT NULL,
    name character varying(40) NOT NULL,
    "sortOrder" integer DEFAULT 0,
    FOREIGN KEY (creator) REFERENCES users (uid)
);