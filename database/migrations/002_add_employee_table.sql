BEGIN;

CREATE TABLE IF NOT EXISTS employees (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    function TEXT NOT NULL,
    cellphone TEXT,
    deleted INTEGER NOT NULL DEFAULT 0,
    email TEXT NOT NULL
);

COMMIT;