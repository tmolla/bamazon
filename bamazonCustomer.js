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
    displayProducts();
})


function displayProducts(){
    var query = "select * from products";
    connection.query(query, function(err, res){
        if (err) throw err
        var table = new Table({
            head: ["Item id","product name","department name", "Price","Stock Quantity"]
            //colWidths: [10,20,20,10,20]
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
        //console.log(answer);
        var query = "SELECT * FROM products WHERE ? ";
        connection.query(query, {item_id: answer.item_id}, function(err,res){
            if (err) throw err
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
                    console.log("Total cost of purchase is " + (parseFloat(unitPrice) * parseFloat(purchase_quantity)) + "\nYour item should arrive in 2 business days!\n\n")
                    morePurchase();
                })
            }else {
                (console.log("Insufficient quantity instock"));
                morePurchase();
            }
        })
        
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
            console.log("Thank you for using Bamazon, goodbye!\n");
            connection.end();
        }
    })
}
