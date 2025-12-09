-- public.image definition

-- Drop table

-- DROP TABLE public.image;

CREATE TABLE public.image (
	image_id serial4 NOT NULL,
	url varchar NOT NULL,
	ot_id int4 NOT NULL,
	CONSTRAINT image_pkey PRIMARY KEY (image_id)
);


-- public.image foreign keys

ALTER TABLE public.image ADD CONSTRAINT image_ot_id_fkey FOREIGN KEY (ot_id) REFERENCES public.ot(id);