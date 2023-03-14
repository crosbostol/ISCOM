CREATE TABLE Conductor(
	conductor_Id varchar (30) primary key,
	movil_Id VARCHAR(10) not null,
	name varchar (100) not null,
	rut varchar (15),
	Foreign key (movil_Id) References movil (movil_Id) ON UPDATE CASCADE
)