CREATE TABLE IF NOT EXISTS ITM_OT (
		item_Id VARCHAR(20) not null,
ot_Id VARCHAR(50) not null ,
	primary key (item_Id,ot_Id),
	FOREIGn KEY (item_Id) References Item (item_Id),
		FOREIGN KEY (ot_Id) References OT (ot_Id)


)