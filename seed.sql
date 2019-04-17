/* Seeds for SQL table*/

USE bamazon;
INSERT INTO products (product_name, department_name, price, stock_quantity)
values
("Bicycle","Sport",560.96,20),
("Helmets","Sport",44.99,50),
("Milk","Grocery",3.75,120),
("Bread","Grocery",1.85,75),
("Keyboard","Computer",109.56,48),
("Mouse","Computer",99.76,35),
("Educated","Book",14.99,175),
("Salt","Book",12.89,200);

INSERT INTO departments (department_name, over_head_costs) 
VALUES 
("Sport",177695.77), 
("Grocery", 3739.50), 
("Computer", 66234.09), 
("Book", 24833), 
("Apparel", 46618.89);