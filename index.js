const inquirer = require("inquirer");
const consoleTable = require("console.table");
const figlet = require("figlet");
const Query = require("./lib/Query");

const query = new Query();

function validateInput (input) {
  if (/^[\w\s]+$/.test(input.trim())) {
    return true;
  } else {
    return "Must be alphanumeric!";
  }
}

function validateNumber (input) {
  if (/^\d+\.?\d*$/.test(input.trim())) {
    return true;
  } else {
    return "Must be a number!";
  }
}

function viewByManager() {
  // assume if an employee does not have a manager, they are a manager
  query.custom("SELECT * FROM employee WHERE manager_id IS NULL")
    .then(res => {
      let objectArr = JSON.parse(JSON.stringify(res));
      let choicesArr = objectArr.map(element => element.first_name + " " + element.last_name);
      let idArr = objectArr.map(element => element.id);
      return {choicesArr, idArr};
    })
    .then(arrays => {
      inquirer.prompt([
        {
          type: "list",
          name: "manager",
          message: "Please select a manager:",
          choices: arrays.choicesArr
        }
      ]).then(answer => {
        console.log(`Retrieving employees managed by ${answer.manager}...\n`);
        let index = arrays.choicesArr.indexOf(answer.manager);
        query.selectWhere("employee",
        {
          manager_id: arrays.idArr[index]
        }).then(res => {
          if (res.length === 0) {
            console.log(`${answer.manager} is not managing any employees at the moment!\n`);
          } else {
            console.table(res);
          }
          promptUser();
        });        
      });
    })
    .catch(err => {
      if (err) {
        console.log(err);
      }
    });
}

function viewByDepartment() {
  query.select("department")
    .then(res => {
      let objectArr = JSON.parse(JSON.stringify(res));
      let choicesArr = objectArr.map(element => element.name);
      return choicesArr;
    })
    .then(choices => {
      inquirer.prompt([
        {
          type: "list",
          name: "department",
          message: "Please select a department:",
          choices: choices
        }
      ]).then(answer => {
        console.log(`Retrieving employees in ${answer.department}...\n`);
        query.selectWhere("department", {name: answer.department})
          .then(lookup => {
            let objectArr = JSON.parse(JSON.stringify(lookup));
            query.custom(`SELECT employee.id, first_name,
            last_name, role_id, title, manager_id 
            FROM employee INNER JOIN role
            ON employee.role_id = role.id
            WHERE role.department_id = ${objectArr[0].id}`)
            .then(res => {
              if (res.length === 0) {
                console.log(`${answer.department} does not have any employees at the moment!\n`);
              } else {
                console.table(res);
              }    
              promptUser();
            });
        });
      });
    })
    .catch(err => {
      if (err) {
        console.log(err);
      }
    });
}

function viewAll(table) {
  query.select(table)
  .then(res => {
    console.table(res);
  })
  .then(() => promptUser())
  .catch(err => {
    if (err) {
      console.log(err);
    }
  });
}

function view() {
  inquirer.prompt([
    {
      type: "list",
      name: "scope",
      message: "What would you like to view?",
      choices: ["View all employees",
        "View employees by department",
        "View employees by manager",
        "View all departments",
        "View all roles"
      ]
    }
  ]).then(answer => {
    switch (answer.scope) {
      case "View all employees":
        console.log("Retrieving all employees...\n");
        viewAll("employee");
        break;
      case "View all departments": 
        console.log("Retrieving all departments...\n");
        viewAll("department");
        break;
      case "View all roles": 
        console.log("Retrieving all roles...\n");
        viewAll("role");
        break;
      case "View employees by department":
        viewByDepartment();
        break;
      case "View employees by manager":
        viewByManager();
        break;
    }
  }).catch(err => {
    console.log(err);
  });
}

function delDepartment() {
  query.select("department")
    .then(res => {
      let objectArr = JSON.parse(JSON.stringify(res));
      let departmentArr = objectArr.map(element => element.name);
      let departmentIDArr = objectArr.map(element => element.id);
      return {departmentArr, departmentIDArr};
    })
    .then(arrays => {
      inquirer.prompt([
        {
          type: "list",
          name: "department",
          message: "Which department would you like to delete?",
          choices: arrays.departmentArr
        }
      ]).then(answer => {
        let index = arrays.departmentArr.indexOf(answer.department);
        let departmentID = arrays.departmentIDArr[index];
        query.select("role")
          .then(res => {
            let objectArr = JSON.parse(JSON.stringify(res));
            let roleDepartmentIDArr = objectArr.map(element => element.department_id);
            if (roleDepartmentIDArr.indexOf(departmentID) !== -1) {
              console.log("\nCannot delete department before deleting its associated roles!");
              viewAll("role");
            } else {        
              console.log("Deleting department...\n");
              query.deleteWhere("department", {name: answer.department})
              .then(res => {
                console.log("Updated department list:\n");
                viewAll("department");
              });
            }
          })
        })
    }).catch(err => {
      if (err) {
        console.log(err);
      }
    });
}

function delRole() {
  query.select("role")
    .then(res => {
      let objectArr = JSON.parse(JSON.stringify(res));
      let roleArr = objectArr.map(element => element.title);
      let roleIDArr = objectArr.map(element => element.id);
      return {roleArr, roleIDArr};
    })
    .then(arrays => {
      inquirer.prompt([
        {
          type: "list",
          name: "role",
          message: "Which role would you like to delete?",
          choices: arrays.roleArr
        }
      ]).then(answer => {
        let index = arrays.roleArr.indexOf(answer.role);
        let roleID = arrays.roleIDArr[index];
        query.select("employee")
          .then(res => {
            let objectArr = JSON.parse(JSON.stringify(res));
            let employeeRoleIDArr = objectArr.map(element => element.role_id);
            if (employeeRoleIDArr.indexOf(roleID) !== -1) {
              console.log("\nCannot delete role that is currently assigned to an employee!");
              viewAll("employee");
            } else {
              console.log("Deleting role...\n");
              query.deleteWhere("role", {title: answer.role})
              .then(res => {
                console.log("Updated role list:\n");
                viewAll("role");
              });
            }
          })
      })
    }).catch(err => {
      if (err) {
        console.log(err);
      }
    });
}

function delEmployee() {
  query.select("employee")
    .then(res => {
      let objectArr = JSON.parse(JSON.stringify(res));
      let choicesArr = objectArr.map(element => element.first_name + " " + element.last_name);
      let employeeIDArr = objectArr.map(element => element.id);
      let managerIDArr = objectArr.map(element => element.manager_id);
      return {choicesArr, employeeIDArr, managerIDArr};
    })
    .then(arrays => {
      inquirer.prompt([
        {
          type: "list",
          name: "employee",
          message: "Which employee would you like to delete?",
          choices: arrays.choicesArr
        }
      ]).then(answer => {
        let index = arrays.choicesArr.indexOf(answer.employee);
        let employeeID = arrays.employeeIDArr[index];
        if (arrays.managerIDArr.indexOf(employeeID) !== -1) {
          console.log("\nCannot delete employee that currently manages another employee!");
          viewAll("employee");
        } else {
          console.log("Deleting employee...\n");
          query.deleteWhere("employee",
            {id: employeeID})
            .then(res => {
              console.log("Updated employee roster:\n");
              viewAll("employee");
            });
        }
        
      })
    }).catch(err => {
      if (err) {
        console.log(err);
      }
    });
}

function del() {
  inquirer.prompt([
    {
      type: "list",
      name: "toDel",
      message: "What would you like to delete?",
      choices: ["Department", "Role", "Employee"]
    }
  ]).then(answer => {
    switch (answer.toDel) {
      case "Department":
        delDepartment();
        break;
      case "Role":
        delRole();
        break;
      case "Employee":
        delEmployee();
        break;
    }
  }).catch(err => {
    if (err) {
      console.log(err);
    }
  });
}

function addDepartment(name) {
  console.log("Adding department...\n");  
  query.insert("department", {name: name.trim()})
  .then(res => {
    viewAll("department");
  });
}

function addRole(title) {
  query.select("department")
  .then(res => {
    let objectArr = JSON.parse(JSON.stringify(res));
    let choicesArr = objectArr.map(element => element.name);
    let idArr = objectArr.map(element => element.id);
    return {choicesArr, idArr};
  })
  .then(arrays => {
    inquirer.prompt([
      {
        type: "list",
        name: "department",
        message: "To which department does the role belong?",
        choices: arrays.choicesArr
      },
      {
        type: "input",
        name: "salary",
        message: "What is the role's salary?",
        validate: validateNumber
      }
    ]).then(answers => {
      console.log("Adding role...\n");
      let index = arrays.choicesArr.indexOf(answers.department);
      query.insert("role",
      {
        title: title.trim(),
        department_id: arrays.idArr[index],
        salary: answers.salary
      }).then(res => {
        viewAll("role");
      });
    });
  });  
}

function addEmployee() {
  query.select("role")
  .then(res => {
    let objectArr = JSON.parse(JSON.stringify(res));
    let roleArr = objectArr.map(element => element.title);
    let roleIDArr = objectArr.map(element => element.id);
    return {roleArr, roleIDArr};
  }).then(arrays => {
    query.select("employee")
    .then(res => {
      let objectArr = JSON.parse(JSON.stringify(res));
      let employeeArr = objectArr.map(element => element.first_name + " " + element.last_name);
      let employeeIDArr = objectArr.map(element => element.id);
      return {...arrays, employeeArr, employeeIDArr};
    }).then(arrays => {
    inquirer.prompt([
      {
        type: "input",
        name: "first_name",
        message: "Employee's first name:",
        validate: validateInput
      },
      {
        type: "input",
        name: "last_name",
        message: "Employee's last name:",
        validate: validateInput
      },
      {
        type: "list",
        name: "role",
        message: "What is the employee's role?",
        choices: arrays.roleArr
      },
      {
        type: "list",
        name: "manager",
        message: "Who is the employee's manager?",
        choices: [...arrays.employeeArr, "N/A"]
      }
    ]).then(answers => {
      console.log("Adding employee...\n");
      let roleIndex = arrays.roleArr.indexOf(answers.role);
      let managerIndex = arrays.employeeArr.indexOf(answers.manager);
      query.insert("employee",
      {
        first_name: answers.first_name.trim(),
        last_name: answers.last_name.trim(),
        role_id: arrays.roleIDArr[roleIndex],
        manager_id: arrays.employeeIDArr[managerIndex]
      }).then(res => {
        viewAll("employee");
      });
    });
  })
});
}

function add() {
  inquirer.prompt([
    {
      type: "list",
      name: "toAdd",
      message: "What would you like to add?",
      choices: ["Department", "Role", "Employee"]
    },
    {
      type: "input",
      name: "name",
      message: answers => `What is the ${answers.toAdd.toLowerCase()}'s name?`,
      when: answers => (answers.toAdd === "Department" || answers.toAdd === "Role"),
      validate: validateInput
    },
  ]).then(answers => {
    switch (answers.toAdd) {
      case "Department":
        addDepartment(answers.name);
        break;
      case "Role": 
        addRole(answers.name);
        break;
      case "Employee": 
        addEmployee();
        break;
    }
  }).catch(err => {
    if (err) {
      console.log(err);
    }
  });
}

function updateRole(id) {
  query.select("role")
  .then(res => {
    let objectArr = JSON.parse(JSON.stringify(res));
    let roleArr = objectArr.map(element => element.title);
    let roleIDArr = objectArr.map(element => element.id);
    return {roleArr, roleIDArr};
  }).then(arrays => {
    inquirer.prompt([
      {
        type: "list",
        name: "role",
        message: "Please select a new role for the employee:",
        choices: arrays.roleArr
      }
    ]).then(answer => {
      let index = arrays.roleArr.indexOf(answer.role);
      query.updateWhere("employee",
      [
        {role_id: arrays.roleIDArr[index]},
        {id: id}
      ]).then(res => {
        console.log("Updated employee roster:\n");
        viewAll("employee");
      });
    });
  }).catch(err => {
    if (err) {
      console.log(err);
    }
  });
}

function updateManager(id) {
  query.select("employee")
    .then(res => {
      let objectArr = JSON.parse(JSON.stringify(res));
      let employeeArr = objectArr.map(element => element.first_name + " " + element.last_name);
      let employeeIDArr = objectArr.map(element => element.id);
      return {employeeArr, employeeIDArr};
    }).then(arrays => {
      inquirer.prompt([
        {
          type: "list",
          name: "manager",
          message: "Please select a new manager for the employee (or N/A for no manager):",
          choices: [...arrays.employeeArr, "N/A"]
        }
      ]).then(answer => {
        let index = arrays.employeeArr.indexOf(answer.manager);
        query.updateWhere("employee",
        [
          {manager_id: index === -1 ? null : arrays.employeeIDArr[index]},
          {id: id}
        ]
        ).then(res => {
          console.log("Updated employee roster:\n");
          viewAll("employee");
        });
      });
    }).catch(err => {
      if (err) {
        console.log(err);
      }
  });
}

function update() {
  query.select("employee")
    .then(res => {
      let objectArr = JSON.parse(JSON.stringify(res));
      let employeeArr = objectArr.map(element => element.first_name + " " + element.last_name);
      let employeeIDArr = objectArr.map(element => element.id);
      return {employeeArr, employeeIDArr};
    })
    .then(arrays => {
      inquirer.prompt([
        {
          type: "list",
          name: "employee",
          message: "Which employee would you like to update?",
          choices: arrays.employeeArr
        },
        {
          type: "list",
          name: "toUpdate",
          message: "What information about the employee would you like to update?",
          choices: ["Employee's role", "Employee's manager"]
        }
      ]).then(answers => {
        let employeeIndex = arrays.employeeArr.indexOf(answers.employee);
        console.log("Current employee information:\n");
        query.selectWhere("employee", {id: arrays.employeeIDArr[employeeIndex]})
          .then(res => {
            console.table(res);
            switch (answers.toUpdate) {
              case "Employee's role":
                updateRole(arrays.employeeIDArr[employeeIndex]);
                break;
              case "Employee's manager":
                updateManager(arrays.employeeIDArr[employeeIndex]);
                break;
            }
          });
      });
    }).catch(err => {
      if (err) {
        console.log(err);
      }
    });
}

function promptUser() {
  inquirer.prompt([
      {
        type: "list",
        name: "action",
        message: "What would you like to do? (Ctrl + C to exit)",
        choices: ["Add departments, roles or employees",
          "View departments, roles or employees",
          "Update an employee's role or manager",
          "Delete departments, roles or employees",
        ]
      }
    ]).then(answers => {
    switch (answers.action) {
      case "Add departments, roles or employees":
        add();
        break;
      case "View departments, roles or employees":
        view();
        break;
      case "Update an employee's role or manager":
        update();
        break;
      case "Delete departments, roles or employees":
        del();
        break;  
    }
  }).catch(err => {
    if (err) {
      console.log(err);
    }
  });  
}

figlet("X Company", (err, data) => {
  if (err) {
      console.log(err);
  }
  console.log(data);
  console.log("Welcome to X Company's Employee Tracker!");
  promptUser();
});
