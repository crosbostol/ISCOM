CREATE TABLE IF NOT EXISTS Inventory(
		inventory_Id VARCHAR primary key,
		updated_at timestamp default current_timestamp,
		product_Id int,
	FOREIGN KEY (product_Id) References Product (product_Id),
		product_amount INT NOT NULL default 0
		
);