USE employees_db;

INSERT INTO department (name)
VALUES ("Sales"), ("IT"), ("Finance"), ("HR");

INSERT INTO role (title, salary, department_id)
VALUES ("Sales Rep", 40000.00, 1),
("Sales Manager", 50000.00, 1),
("Executive Sales Manager", 60000.00, 1),
("Junior Developer", 40000.00, 2),
("Senior Developer", 50000.00, 2),
("Finance Specialist", 60000.00, 3),
("HR Specialist", 40000.00, 4);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("FirstFirstName", "FirstLastName", 1, 3),
("SecondFirstName", "SecondLastName", 2, 3),
("ThirdFirstName", "ThirdLastName", 3, NULL),
("Aaron", "Ealdama", 4, 8),
("Ike", "Ekwueme", 4, 8),
("Jordon", "Runge", 4, 8),
("Kendall", "Arceo", 4, 8),
("Paul", "Viola", 5, NULL),
("John", "Doe", 6, NULL),
("Jane", "Doe", 7, NULL);