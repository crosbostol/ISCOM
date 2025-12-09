-- public.product definition

-- Drop table

-- DROP TABLE public.product;

CREATE TABLE public.product (
	product_id int4 DEFAULT nextval('test_id_seq'::regclass) NOT NULL,
	product_name varchar(50) NOT NULL,
	product_category varchar(50) NOT NULL,
	product_unit varchar(50) NOT NULL,
	CONSTRAINT product_pkey PRIMARY KEY (product_id)
);