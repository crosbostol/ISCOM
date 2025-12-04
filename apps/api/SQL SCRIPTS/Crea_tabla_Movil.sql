CREATE TABLE Movil(
	movil_Id varchar (10) primary key,
	inventory_Id VARCHAR(20) not null,
	movil_State varchar (50) not null,
	movil_Observations varchar(200),
	movil_Type varchar (20) not null,
	Foreign key (inventory_Id) References Inventory (inventory_Id) ON UPDATE CASCADE

)