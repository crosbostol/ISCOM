CREATE TABLE IF NOT EXISTS Image(
		image_Id SERIAL primary key,
		url varchar not null,
		ot_Id VARCHAR(50) not null,
				FOREIGN KEY (ot_Id) References OT (ot_Id) ON DELETE CASCADE 


);