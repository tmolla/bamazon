require("dotenv").config();
var mysql = require("mysql");
var inquirer = require("inquirer");
var Table = require("cli-table2")
var colors = require("colors")

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
          "View Products for Sale",
          "View Low Inventory",
          "Add an Inventory",
          "Add New Product",
          "Exit Menu"
        ]
      })
      .then(function(answer) {
        switch (answer.action) {
        case "View Products for Sale":
        viewProductsForSale();
          break;
  
        case "View Low Inventory":
          viewLowInventory();
          break;
  
        case "Add an Inventory":
          addInventory();
          break;
  
        case "Add New Product":
          addNewProduct();
          break;

        case "Exit Menu":
          exitMenu();
          break;
        }
      });
}

function viewProductsForSale(){
    
    var query = "select * from products";
    connection.query(query, function(err, res){
        if (err) throw err
        var table = new Table({
            head: ["Item id","product name","department name", "Price","Stock Quantity"]
        });
        var row = [];
        for (var i = 0; i < res.length; i++) {
            row.push(res[i].item_id);
            row.push(res[i].product_name);
            row.push(res[i].department_name);
            row.push(res[i].price);
            row.push(res[i].stock_quantity);
            table.push(row);
            row = [];
        }
        console.log(table.toString())
        displayMenuOptions();
    });
}

  
function viewLowInventory() {
    var query = "SELECT * FROM products where stock_quantity < 5";
    connection.query(query, function(err, res) {
      if (err) throw err;
      if (res.length < 1) console.log("\nThere are no items with low inventory.\n".green)
      for (var i = 0; i < res.length; i++) {
        console.log("\n" + (res[i].product_name + " has only " + res[0].stock_quantity + " item(s) left!\n").toString().green);
      }
      displayMenuOptions();
    });
}

function addInventory() {
    inquirer.prompt([
        {
            name: "item_id",
            type: "input",
            message: "What is the item_Id of the product you would like to add?",
            validate: function(value){
                var isValid = !(typeof value === "undefined") && (value.trim()!='') && (!isNaN(parseInt(value)));
                return(isValid || "Please enter a valid item_id.")
            }
        },
        {
            name:"quantity",
            type:"input",
            message: "How many units of the product would you like to add?",
            validate: function(value) {
                var isValid = !(typeof value === "undefined") && (value.trim()!='') && (!isNaN(parseInt(value)));
                return(isValid || "Please enter a valid quantity.")
            }
        }
    ]).then(function(answer){
        // if (answer.item_id.trim() =="" || answer.quantity.trim() == ""){
        //     console.log("\nPlease provide require fields\n".red);
        //     addInventory();
        // } 
        
        var query = "SELECT stock_quantity FROM products WHERE ? ";
        connection.query(query, {item_id:answer.item_id}, function(err, res){
            if (err) throw err;
            if (res.length == 0) {
                console.log("\nInvalid Item_id. Please input a valid item_id and try again.\n".red);
                addInventory();
            }else {
                var quantity = parseInt(res[0].stock_quantity) + parseInt(answer.quantity);
                var query = "UPDATE products SET ? WHERE ? ";
                connection.query(query, [{stock_quantity: quantity}, {item_id: answer.item_id}], function(err,res){
                    if (err) throw err;
                    console.log("\nInventory updated successfuly.\n".green)
                    displayMenuOptions();
                })
            }
        })
        
    })
}

function addNewProduct() {
    connection.query("SELECT department_name FROM departments",function(err, res){
        if (err) throw err;
        arrDept = []
        for (var i = 0; i < res.length; i++){
            arrDept.push(res[i].department_name)
        }
        
        inquirer.prompt([
            {
                name: "product_name",
                type: "input",
                message: "What is the product name you would like to add?",
                validate: function(value) {
                    var isValid = (value.trim().length > 0 && typeof value === 'string' && isNaN(value))
                    return(isValid || "Please enter a valid product name.")
                }
            },
            {
                name: "department_name",
                type: "rawlist",
                message: "What is the department associated with the product?",
                choices: arrDept
            },
            {
                name: "price",
                type: "input",
                message: "What is the unit price for the product?",
                validate: function(value) {
                    return(!(isNaN(value.trim())))
                }
            },
            {
                name:"quantity",
                type:"input",
                message: "How many units of the product do you have?",
                validate: function(value) {
                    var isValid = !isNaN(value.trim());
                    return (isValid || "Please enter a number")
                }
            }
        ]).then(function(answer){
            if (answer.product_name.trim() =="" || 
                answer.quantity.trim() == "" || 
                answer.department_name.trim() == "" || 
                answer.price.trim() == ""){
                    console.log("\nPlease provide require fields\n");
                    promptCustomer();
            } else{
            var query = "INSERT INTO products SET ? ";
            connection.query(query, 
                {   
                    product_name: answer.product_name,
                    department_name: answer.department_name,
                    price: answer.price,
                    stock_quantity: answer.quantity
                }, 
                function(err,res){
                    if (err) throw err
                    console.log("\nProduct added successfuly.\n".green)
                    displayMenuOptions();
            })
        }
        })
    })
}

function exitMenu(){
    console.log("\nThank you for using Bamazon, the worlds best online shoping Mall!".green)
    console.log("Good bye!\n".green)
    connection.end();
}