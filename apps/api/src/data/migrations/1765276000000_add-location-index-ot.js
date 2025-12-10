exports.up = pgm => {
    // Eliminar índice antiguo si existe para evitar confusión
    pgm.sql('DROP INDEX IF EXISTS idx_ot_heuristic_search;');

    // Crear nuevo índice robusto
    pgm.sql(`
        CREATE INDEX idx_ot_heuristic_location 
        ON ot (started_at, commune, street, number_street) 
        WHERE external_ot_id IS NULL;
    `);
};
