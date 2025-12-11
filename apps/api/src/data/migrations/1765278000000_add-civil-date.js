exports.up = pgm => {
    pgm.sql(`
        ALTER TABLE ot 
        ADD COLUMN IF NOT EXISTS civil_work_date date;
    `);
};
