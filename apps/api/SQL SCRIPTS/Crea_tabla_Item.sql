-- Table: public.item

-- DROP TABLE IF EXISTS public.item;

CREATE TABLE IF NOT EXISTS public.item
(
    item_id character varying(20) COLLATE pg_catalog."default" NOT NULL,
    description character varying(500) COLLATE pg_catalog."default" NOT NULL,
    item_value money,
    item_type character varying(50) COLLATE pg_catalog."default",
    item_unit character varying(10) COLLATE pg_catalog."default",
    CONSTRAINT item_pkey PRIMARY KEY (item_id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.item
    OWNER to postgres;