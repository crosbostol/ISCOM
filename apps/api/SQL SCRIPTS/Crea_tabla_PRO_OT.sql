-- public.pro_ot definition

-- Drop table

-- DROP TABLE public.pro_ot;

CREATE TABLE public.pro_ot (
	product_id int4 NOT NULL,
	quantity numeric NULL,
	inventory_id varchar(20) NOT NULL,
	ot_id int4 NOT NULL
);

-- Table Triggers

create trigger update_inv_pro_trigger after
insert
    on
    public.pro_ot for each row execute function update_inv_pro();


-- public.pro_ot foreign keys

ALTER TABLE public.pro_ot ADD CONSTRAINT pro_ot_inventory_id_fkey FOREIGN KEY (inventory_id) REFERENCES public.inventory(inventory_id);
ALTER TABLE public.pro_ot ADD CONSTRAINT pro_ot_ot_id_fkey FOREIGN KEY (ot_id) REFERENCES public.ot(id);
ALTER TABLE public.pro_ot ADD CONSTRAINT pro_ot_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.product(product_id);