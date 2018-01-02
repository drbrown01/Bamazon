//Inialize the NPM packages
var mysql = require("mysql");
var inquirer = require("inquirer");
require("console.table");

//Initializes the connection variable to sync with a Mysql database
var connection = mysql.createConnection({
  host: "localhost",
  port:3306,
  //User name
  user: "root",
  //Password
  password: "",
  database:"bamazon"
});

//Creates the connection with the server and loads the product data upon a successful connection
connection.connect(function(err) {
  if(err){
    console.log("error connecting: " + err.stack);
  }
  loadProducts();
});

//FUnciton to load the products from the Table
function loadProducts() {
  //Selects all of the products from the mysql table and print results to the consoel
  connection.query("SELECT * FROM products", function(err, res) {
    if(err)throw err;
    //Draw table in the terminal
    console.table(res);
    //then ask the customer for their products; pass all the products to the PromtCustomerForitem
    function promptCustomerForItem(inventory) {
      //prompts customer for what they want to buy
      inquirer.prompt([{
        type:"input",
        name:"choice",
        message: "What is the ID of the item you owuld like to purchase? [Press Q to Quit]",
        validate: function(val) {
          return !isNAN(val) || val.toLowerCase() === "q";
        }
      }
      ])
      .then(function(val) {
        //check if user wants to Quit
        checkIfShouldExit(val.choice);
        var choiceID = paresInt(val.choice);
        var product = checckInventory(choiceID, inventory);
        //if there is a product wih the id chosen, prompt for quantity
          if(product){
            //pass in the chosen quantity to promptCustomerForQuantity
            promptCustomerForQuantity(product);
            }
            else {
              //or let them know that the item is not in the inventory, re-run "loadProducts"
              console.log("\nThat item is not in the inventory.");
              loadProducts();
            }
      });
  }
  //Prompt customer for a product quantity
  function promptCustomerForQuantity(product) {
    inquirer
    .prompt([
      {
        type: "input",
        name: "quantity",
        message: "How many would you like? [Press Q to quit!]",
        validate: function(val) {
          return val > 0 || val.toLowerCase() === "q";
        }
      }
    ])
    .then(function(val) {
      //check if the user wants to quit
      checkIfShouldExit(val.quantity);
      //if there is not enough stock, let the user know and re-;run loadProducts
      if(quantity >product.stock_quantity){
        console.log("\nInsufficient quantity!");
        loadProducts();
      }
      else {
        //Otherwise run mamkePurchase, with product info and stock_quantity
        makePurchase(product, quantity);
      }
    });
  }
function makePurchase(product, quantity) {
  connection.query(
    "UPDATE porducts SET stock_quantity = stock_quantity - ? WHERE item_id = ?",
    [quantity, product_item],
    function(err, res) {
      //Let the user know the purchase was successful, re-run loadProducts
      console.log("\nSucessfully purchased "+ quantity+ " "+ product.product_name + " 's! '");
      loadProducts();
    }
  );
}
//Check to see if the product is in the Inventory
function checckInventory(choiceID, inventory) {
  for(var i -0; i< inventory.length; i++){
    if (inventory[i].item_id === choiceID) {
      //if not found return product
      return inventory[i]
    }
  }
  //or return null-
  return null;
}
//Check to see if the user wants to Quit
function checkIfShouldExit(choice) {
  if(choice.toLowerCase() === "q");
  //Log message and hit the door
  console.log("GTFO!");
  process.exit(0);
  }
}
