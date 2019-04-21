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
    displayProducts();
})


function displayProducts(){
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
        promptCustomer();
    });
}

function promptCustomer() {
    inquirer.prompt([
        {
            name: "item_id",
            type: "input",
            message: "What is the item_Id of the product you would like to purchase?"
        },
        {
            name:"quantity",
            type:"input",
            message: "How many units of the product would you like to purchase?",
            validate: function(value) {
                return(!(isNaN(value)))
            }
        }
    ]).then(function(answer){
        if (answer.item_id =="" || answer.quantity == ""){
            console.log("\nPlease provide require fields\n".red);
            promptCustomer();
        } else{
        var query = "SELECT * FROM products WHERE ? ";
        connection.query(query, {item_id: answer.item_id}, function(err,res){
            if (err) throw err //check for error
            if (res.length == 0) {
                console.log("\nInvalid item_id provided\n".red);
                promptCustomer();
            }
            else {
                var quantity = res[0].stock_quantity;
                var unitPrice = res[0].price;
                var purchase_quantity = answer.quantity;
                var product_sales = parseFloat(res[0].product_sales) + parseFloat(unitPrice) * parseFloat(purchase_quantity);

                if(parseInt(quantity) >= parseInt(purchase_quantity)){
                    var newQuantity =  parseInt(quantity) - parseInt(purchase_quantity);
                    var query = "UPDATE products SET ? WHERE ?";
                    connection.query(query, [{stock_quantity: newQuantity, product_sales: product_sales}, {item_id: answer.item_id}], function(err, res){
                        //console.log(res);
                        if (err) throw err;
                        console.log("\nTotal cost of purchase is ".green + "$" + (parseFloat(unitPrice) * parseFloat(purchase_quantity)))
                        console.log("Your item should arrive in 2 business days!\n\n".green)
                        morePurchase();
                    })
                }else {
                    console.log("\nInsufficient quantity instock\n".red);
                    morePurchase();
                }
            }
        })
    }
        
    })
}

function morePurchase(){
    
        inquirer.prompt([
        {
            name: "yes",
            type: "confirm",
            message: "Would you like to pruchase more itmes?"
        }
        ]).then(function(answer){
        if(answer.yes){
            promptCustomer()
        }else{
            console.log("\nThank you for using Bamazon, the worlds best online shoping Mall!".green)
            console.log("Good bye!\n".green)
            connection.end();
        }
    })
}
