/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    // Drop existing constraints if they exist (to replace them)
    pgm.sql(`
        DO $$ 
        BEGIN 
            IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ot_civil_movil_id_fkey') THEN
                ALTER TABLE public.ot DROP CONSTRAINT ot_civil_movil_id_fkey;
            END IF;
            IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ot_hidraulyc_movil_id_fkey') THEN
                ALTER TABLE public.ot DROP CONSTRAINT ot_hidraulyc_movil_id_fkey;
            END IF;
        END $$;
    `);

    // Re-add constraints with ON UPDATE CASCADE
    // Note: The original generic constraint might not have had the exact name in all envs if auto-generated, 
    // but in 001 schema it was explicit: 'ot_civil_movil_id_fkey'. 
    // We stick to that naming.
    pgm.sql(`
        ALTER TABLE public.ot 
        ADD CONSTRAINT ot_civil_movil_id_fkey 
        FOREIGN KEY (civil_movil_id) 
        REFERENCES public.movil(movil_id) 
        ON UPDATE CASCADE;

        ALTER TABLE public.ot 
        ADD CONSTRAINT ot_hidraulyc_movil_id_fkey 
        FOREIGN KEY (hydraulic_movil_id) 
        REFERENCES public.movil(movil_id) 
        ON UPDATE CASCADE;
    `);
};

exports.down = pgm => {
    // Revert to NO ACTION (default)
    pgm.sql(`
        ALTER TABLE public.ot DROP CONSTRAINT IF EXISTS ot_civil_movil_id_fkey;
        ALTER TABLE public.ot DROP CONSTRAINT IF EXISTS ot_hidraulyc_movil_id_fkey;

        ALTER TABLE public.ot 
        ADD CONSTRAINT ot_civil_movil_id_fkey 
        FOREIGN KEY (civil_movil_id) 
        REFERENCES public.movil(movil_id);

        ALTER TABLE public.ot 
        ADD CONSTRAINT ot_hidraulyc_movil_id_fkey 
        FOREIGN KEY (hydraulic_movil_id) 
        REFERENCES public.movil(movil_id);
    `);
};
