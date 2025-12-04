CREATE TABLE IF NOT EXISTS OT(
		ot_Id VARCHAR(50) not null primary key,
		hydraulic_Movil_Id VARCHAR(10),
		civil_Movil_Id VARCHAR(10),
		ot_State VARCHAR (50) not null default 'CREADA',
		asigned_At timestamp ,
		started_At timestamp ,
		finished_at timestamp ,
		observation varchar(500),
	FOREIGN KEY (civil_Movil_Id) References Movil (movil_Id),
FOREIGN KEY (hydraulic_Movil_Id) References Movil (movil_Id),
		
		
);