-- Table: public.itm_ot

-- DROP TABLE IF EXISTS public.itm_ot;

CREATE TABLE IF NOT EXISTS public.itm_ot
(
    item_id character varying(20) COLLATE pg_catalog."default" NOT NULL,
    ot_id character varying(50) COLLATE pg_catalog."default" NOT NULL,
    quantity integer NOT NULL,
    created_at date DEFAULT 'CURRENT_DATE',
    CONSTRAINT itm_ot_pkey PRIMARY KEY (item_id, ot_id),
    CONSTRAINT itm_ot_item_id_fkey FOREIGN KEY (item_id)
        REFERENCES public.item (item_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT itm_ot_ot_id_fkey FOREIGN KEY (ot_id)
        REFERENCES public.ot (ot_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.itm_ot
    OWNER to postgres;