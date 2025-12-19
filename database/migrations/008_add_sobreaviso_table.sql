BEGIN;

CREATE TABLE IF NOT EXISTS sobreavisos (
    id TEXT PRIMARY KEY,
    employee_id TEXT NOT NULL,
    scale_type TEXT NOT NULL CHECK(scale_type IN ('ETA', 'PLANTAO_TARDE')),
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (employee_id) REFERENCES employees(id)
        ON DELETE CASCADE 
        ON UPDATE CASCADE
);

COMMIT;
