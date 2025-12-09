-- public.conductor definition

-- Drop table

-- DROP TABLE public.conductor;

CREATE TABLE public.conductor (
	conductor_id varchar(30) NOT NULL,
	movil_id varchar(10) NOT NULL,
	"name" varchar(100) NOT NULL,
	rut varchar(15) NULL,
	CONSTRAINT conductor_pkey PRIMARY KEY (conductor_id)
);


-- public.conductor foreign keys

ALTER TABLE public.conductor ADD CONSTRAINT conductor_movil_id_fkey FOREIGN KEY (movil_id) REFERENCES public.movil(movil_id) ON UPDATE CASCADE;