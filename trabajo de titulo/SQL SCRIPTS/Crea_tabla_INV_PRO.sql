CREATE TABLE IF NOT EXISTS INV_PRO (
		product_Id INT NOT NULL,
		inventory_Id varchar not null,
	primary key (product_Id,inventory_Id),
	FOREIGn KEY (product_Id) References Product (product_Id),
		FOREIGN KEY (inventory_Id) References Inventory (inventory_Id)


)