require("dotenv").config();
var mysql = require("mysql");
var inquirer = require("inquirer");
var Table = require("cli-table2")
var colors = require("colors");

var connection = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  port: process.env.MYSQL_PORT,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE
});

//check connection works
connection.connect(function(err){
  if(err) throw err
  displayMenuOptions();
})


function displayMenuOptions() {
    inquirer
      .prompt({
        name: "action",
        type: "rawlist",
        message: "What would you like to do?",
        choices: [
          "View Product Sales by Department",
          "Create New Deparatment",
          "Exit Menu"
        ]
      })
      .then(function(answer) {
        switch (answer.action) {
        case "View Product Sales by Department":
        viewProductSalesByDeparatment();
          break;
  
        case "Create New Deparatment":
          createNewDepartment();
          break;

        case "Exit Menu":
          exitMenu();
          break;
        }
      });
}

function viewProductSalesByDeparatment(){
    var row = [];
    var query = "SELECT * FROM departments AS t1 " +
                "INNER JOIN (SELECT department_name, SUM(price) AS product_sales " + 
                "FROM products GROUP BY department_name) AS t2 " +
                "ON t1.department_name = t2.department_name"
    connection.query(query, function(err, res){
        if (err) throw err
        var table = new Table({
            head: ["department id","department name","over head costs", "product sales","total profit"]
        });
    
        for (var i = 0; i < res.length; i++) {
            row.push(res[i].department_id);
            row.push(res[i].department_name);
            row.push(res[i].over_head_costs);
            row.push(res[i].product_sales);
            row.push((parseFloat(res[i].product_sales) - parseFloat(res[i].over_head_costs)).toFixed(2)) ;
            table.push(row);
            row = [];
        }
        console.log(table.toString())
        displayMenuOptions();
    });
}

  
function createNewDepartment() {
    inquirer.prompt([
        {
            name: "department_name",
            type: "input",
            message: "What is the department name you would like to create?",
            validate: function(value) {
              return(isNaN(value) && value.trim().length > 0 && typeof value === 'string')
          }
        }

    ]).then(function(answer){
        var query = "INSERT INTO departments SET ? ";
        connection.query(query, 
            {   
                department_name: answer.department_name,
                over_head_costs: parseFloat(Math.random() * (100000 - 10000) + 1000)
            }, 
            function(err,res){
                if (err) throw err
                console.log("\nDeparatment added successfuly!\n".green);
                displayMenuOptions();
        })
    })
}

function exitMenu(){
    console.log("\nThank you for using Bamazon, the worlds best online shoping Mall!".green);
    console.log("Good bye!\n".green);
    connection.end();
}