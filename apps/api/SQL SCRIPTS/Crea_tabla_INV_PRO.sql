-- public.inv_pro definition

-- Drop table

-- DROP TABLE public.inv_pro;

CREATE TABLE public.inv_pro (
	product_id int4 NOT NULL,
	inventory_id varchar NOT NULL,
	quantity numeric DEFAULT 0 NOT NULL,
	CONSTRAINT inv_pro_pkey PRIMARY KEY (product_id, inventory_id)
);


-- public.inv_pro foreign keys

ALTER TABLE public.inv_pro ADD CONSTRAINT inv_pro_inventory_id_fkey FOREIGN KEY (inventory_id) REFERENCES public.inventory(inventory_id);
ALTER TABLE public.inv_pro ADD CONSTRAINT inv_pro_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.product(product_id);