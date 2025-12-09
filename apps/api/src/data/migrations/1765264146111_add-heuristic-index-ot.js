/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    pgm.sql(`
        CREATE INDEX idx_ot_heuristic_search
        ON ot (started_at, hydraulic_movil_id)
        WHERE external_ot_id IS NULL;
    `);
};

exports.down = pgm => {
    pgm.sql('DROP INDEX IF EXISTS idx_ot_heuristic_search;');
};
