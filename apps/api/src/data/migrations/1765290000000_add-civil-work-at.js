exports.up = pgm => {
    pgm.sql(`
        ALTER TABLE ot 
        ADD COLUMN IF NOT EXISTS civil_work_at TIMESTAMP NULL;
    `);
};

exports.down = pgm => {
    pgm.sql(`
        ALTER TABLE ot 
        DROP COLUMN IF EXISTS civil_work_at;
    `);
};
