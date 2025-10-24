BEGIN;

CREATE TABLE IF NOT EXISTS employees (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    function TEXT NOT NULL,
    cellphone TEXT NOT NULL
);

COMMIT;