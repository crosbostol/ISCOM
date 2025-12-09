-- public.item definition

-- Drop table

-- DROP TABLE public.item;

CREATE TABLE public.item (
	item_id varchar(20) NOT NULL,
	description varchar(500) NOT NULL,
	item_value numeric(15, 2) NULL,
	item_type varchar(50) NULL,
	item_unit varchar(10) NULL,
	CONSTRAINT item_description_unique UNIQUE (description),
	CONSTRAINT item_pkey PRIMARY KEY (item_id)
);
CREATE INDEX idx_item_description ON public.item USING btree (description);