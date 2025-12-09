-- 1. Añadimos la columna ID autoincremental
ALTER TABLE public.itm_ot ADD COLUMN id SERIAL PRIMARY KEY;

-- 4. Opcional pero recomendado: Indices para búsquedas rápidas
CREATE INDEX idx_itm_ot_ot_id ON public.itm_ot(ot_id);



-- 1. Crear índice para búsqueda ultrarrápida por descripción
CREATE INDEX IF NOT EXISTS idx_item_description ON public.item(description);



-- 1. Añadir columna para el código externo (El que viene en el CSV)
ALTER TABLE public."movil" 
ADD COLUMN external_code VARCHAR(50);

-- 2. (Opcional pero recomendado) Hacerlo único si un código externo solo puede pertenecer a un móvil a la vez
CREATE UNIQUE INDEX idx_movil_external_code ON public."movil"(external_code);

-- 3. Crear índice para búsqueda rápida durante la carga masiva
CREATE INDEX idx_movil_lookup ON public."movil"(external_code);
