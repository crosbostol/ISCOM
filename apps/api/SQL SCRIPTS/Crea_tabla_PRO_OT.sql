CREATE TABLE IF NOT EXISTS pro_ot(
		ot_Id VARCHAR(50) not null ,
        product_Id INT not null,
        primary key (product_Id,ot_Id),
        FOREIGn KEY (product_Id) References product (product_Id),
		FOREIGN KEY (ot_Id) References OT (ot_Id) on delete cascade
);