var mysql = require("mysql");
var inquirer = require("inquirer");
var Table = require("cli-table2")

var connection = mysql.createConnection({
    host:"localhost",
    port:"3306",
    user:"root",
    password:"mysql$62",
    database:"bamazon"
});

//check connection works
connection.connect(function(err){
    if(err) throw err
    console.log("Connection OK.")
    //connection.end();
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
    var data = [];
    var row = [];
    var query = "SELECT * FROM departments AS t1 " +
                "INNER JOIN (SELECT department_name, SUM(price) AS product_sales " + 
                "FROM products GROUP BY department_name) AS t2 " +
                "ON t1.department_name = t2.department_name"
   //var query = "SELECT *, product_sales - over_head_costs as total_profit FROM departments";
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
            message: "What is the department name you would like to create?"
        }

    ]).then(function(answer){
        console.log(answer);
        var query = "INSERT INTO departments SET ? ";
        connection.query(query, 
            {   
                department_name: answer.department_name,
                over_head_costs: parseFloat(Math.random() * (100000 - 10000) + 1000)
            }, 
            function(err,res){
                if (err) throw err
                console.log(res);
                displayMenuOptions();
        })
    })
}

function exitMenu(){
    console.log("\nThank you for using Bamazon, the worlds best online shoping Mall! \nGood bye!\n")
    connection.end();
}