-- public.movil definition

-- Drop table

-- DROP TABLE public.movil;

CREATE TABLE public.movil (
	movil_id varchar(10) NOT NULL,
	inventory_id varchar(20) NOT NULL,
	movil_state varchar(50) DEFAULT 'Operativo'::character varying NOT NULL,
	movil_observations varchar(200) NULL,
	movil_type varchar(20) NOT NULL,
	conductor_id varchar(50) NULL,
	external_code varchar(50) NULL,
	CONSTRAINT movil_pkey PRIMARY KEY (movil_id)
);
CREATE UNIQUE INDEX idx_movil_external_code ON public.movil USING btree (external_code);
CREATE INDEX idx_movil_lookup ON public.movil USING btree (external_code);


-- public.movil foreign keys

ALTER TABLE public.movil ADD CONSTRAINT movil_conductor_id_fkey FOREIGN KEY (conductor_id) REFERENCES public.conductor(conductor_id);
ALTER TABLE public.movil ADD CONSTRAINT movil_inventory_id_fkey FOREIGN KEY (inventory_id) REFERENCES public.inventory(inventory_id) ON UPDATE CASCADE;