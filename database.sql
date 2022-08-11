CREATE TABLE users
(
    uid uuid DEFAULT uuid_generate_v4(),
    nickname character varying(30) NOT NULL,
    password character varying(100) NOT NULL,
    email character varying(100) NOT NULL,
    PRIMARY KEY (uid)
);

CREATE TABLE tags
(
    id SERIAL PRIMARY KEY,
    name character varying(40) NOT NULL,
    creator uuid NOT NULL,
    sort_order integer DEFAULT 0,
    FOREIGN KEY (creator) REFERENCES users (uid)
);