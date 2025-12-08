BEGIN;

CREATE TABLE IF NOT EXISTS scale_holidays (
    id TEXT PRIMARY KEY,
    scale_id TEXT NOT NULL,
    day INTEGER NOT NULL,
    
    FOREIGN KEY (scale_id) REFERENCES scales(id)
        ON DELETE CASCADE 
        ON UPDATE CASCADE
);

COMMIT;