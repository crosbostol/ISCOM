-- public.itm_ot definition

-- Drop table

-- DROP TABLE public.itm_ot;

CREATE TABLE public.itm_ot (
	item_id varchar(20) NOT NULL,
	quantity numeric NOT NULL,
	created_at date DEFAULT CURRENT_DATE NULL,
	ot_id int4 NOT NULL,
	id serial4 NOT NULL,
	CONSTRAINT itm_ot_pkey PRIMARY KEY (id)
);
CREATE INDEX idx_itm_ot_ot_id ON public.itm_ot USING btree (ot_id);


-- public.itm_ot foreign keys

ALTER TABLE public.itm_ot ADD CONSTRAINT itm_ot_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.item(item_id);
ALTER TABLE public.itm_ot ADD CONSTRAINT itm_ot_ot_id_fkey FOREIGN KEY (ot_id) REFERENCES public.ot(id);