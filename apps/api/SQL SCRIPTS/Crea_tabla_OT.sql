-- public.ot definition

-- Drop table

-- DROP TABLE public.ot;

CREATE TABLE public.ot (
	external_ot_id varchar(50) NULL,
	hydraulic_movil_id varchar(10) NULL,
	civil_movil_id varchar(10) NULL,
	ot_state varchar(50) DEFAULT 'CREADA'::character varying NOT NULL,
	received_at date DEFAULT CURRENT_DATE NOT NULL,
	started_at date NULL,
	finished_at date NULL,
	observation varchar(500) NULL,
	street varchar(150) NOT NULL,
	number_street varchar(10) NULL,
	commune varchar(80) NOT NULL,
	fuga_location varchar(200) NULL,
	altitude numeric NULL,
	latitude numeric NULL,
	dismissed bool DEFAULT false NULL,
	id serial4 NOT NULL,
	is_additional bool DEFAULT false NULL,
	CONSTRAINT ot_external_id_unique UNIQUE (external_ot_id),
	CONSTRAINT ot_pkey PRIMARY KEY (id)
);


-- public.ot foreign keys

ALTER TABLE public.ot ADD CONSTRAINT ot_civil_movil_id_fkey FOREIGN KEY (civil_movil_id) REFERENCES public.movil(movil_id);
ALTER TABLE public.ot ADD CONSTRAINT ot_hidraulyc_movil_id_fkey FOREIGN KEY (hydraulic_movil_id) REFERENCES public.movil(movil_id);