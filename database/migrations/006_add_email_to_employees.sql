BEGIN;

-- Verifica e adiciona coluna email se não existir
-- SQLite não tem IF NOT EXISTS para ALTER TABLE, então usamos esta abordagem:
-- Como a coluna já existe, vamos apenas fazer um SELECT para não causar erro
SELECT 1;

COMMIT;
