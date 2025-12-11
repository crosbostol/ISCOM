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

exports.down = pgm => {
    // Eliminar el índice creado
    pgm.sql('DROP INDEX IF EXISTS idx_ot_heuristic_location;');

    // (Opcional) Restaurar el índice antiguo si es crítico, 
    // pero para este caso basta con limpiar el nuevo.
};
