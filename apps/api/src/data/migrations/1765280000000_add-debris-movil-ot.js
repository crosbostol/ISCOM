exports.up = pgm => {
    pgm.sql(`
        ALTER TABLE ot 
        ADD COLUMN IF NOT EXISTS debris_movil_id VARCHAR NULL;

        -- Check if constraint exists before adding to avoid errors on re-runs
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_ot_debris_movil') THEN
                ALTER TABLE ot
                ADD CONSTRAINT fk_ot_debris_movil
                FOREIGN KEY (debris_movil_id) 
                REFERENCES public.movil(movil_id);
            END IF;
        END $$;
    `);
};

exports.down = pgm => {
    pgm.sql(`
        ALTER TABLE ot
        DROP CONSTRAINT IF EXISTS fk_ot_debris_movil;

        ALTER TABLE ot 
        DROP COLUMN IF EXISTS debris_movil_id;
    `);
};
