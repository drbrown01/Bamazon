//Initializes the npm packages used
var mysql = require("mysql");
var inquirer = require("inquirer");
require("console.table");
//Initializes the connection variable to sync with mysql
var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  //Your username
  user:"root",
  //Password
  password:"",
  database: "bamazon"
});
//create connection with the server and loads the manager menu
connection.connect(function(err) {
  if(err){
    console.log("error connecting: "+ err.stack);
  }
  loadManagerMenu();
});
//Get product data from the database
function loadManagerMenu() {
  connection.query("SELECT * FROM products", function(err, res) {
    if(err)throw err;
    //load the possible manager menu options, pass in the products database
    loadManagerMenu(res);
  });
}
//Load the manager options and pass the products data from the database
function loadManagerOptions(products) {
  inquirer
    .prompt({
      type: "list",
      name: "choice",
      choices: ["View Products for sale", "View low inventory", "Add to inventory", "Add new product", "Quit"],
      message: "What would you like to do?"
    })
    .then(function(val) {
      switch (val.coice){
        case "View Products for sale":
          console.table(products);
          loadManagerMenu();
          break;
        case "View low inventory":
          loadLowInventory();
          break;
        case "Add to inventory":
          addToInventory();
          break;
        case "Add new product":
          promptManagerForNewProduct(products);
          break;
        defualt:
          console.log("GoodBye!!");
          process.exit(0);
          break;
      }
    });
}
//Query the DB for low Products
function loadLowInventory() {
  //Select all the products that have less than 5ea
  connection.query("SELECT * FROM products WHERE stock_quantity <= 5", function(err, res) {
    if(err) throw err;
    //Draw the table in the terminal using the res, loadManagerMenu();
    console.table(res);
    loadManagerMenu();
  });
}
//Prompt the manager to replenish the addToInventory
function addToInventory(inventory) {
  console.table(inventory);
  inuqirer.prompt([
    {
      type:"input",
      name:"choice",
      message: "What is the ID of the inventory to add to?",
      validate: function(val) {
        return !isNAN(val);
      }
    }
  ])
  .then(function(val) {
    var choiceId = parseInt(val.choice);
    var product = checkInventory(choiceId, inventory);
    //if a product can be found with the id ...
    if(product){
      //Pass the chose product to the promptMangerForQuantity(product);
      prmoptManagerForQuantity(product)
    }
    else {
      //otherwise let the user know and reload loadManagerMenu();
      console.log("\nThat item is not in the inventory.");
      loadManagerMenu();
    }
  });
}
//Ask for the QTY that should be added to the chose products
function promptManagerForQuantity(product) {
  inquirer
  .prompt([
    {
    type:"input",
    name:"quantity",
    message: "How many would you like to add?",
    validate: function(val) {
      return val > 0;
    }
  }
  ])
  .then(function(val) {
    var quantity = parseInt(val.quantity);
    addQuantity(product, quantity);
  });
}
//Update quantity of selected product
function addQuantity(product, quantity) {
  connection.query(
    "UPDATE products SET stock_quantity = ? WHERE item_id = ?",
    [product.sotck_quantity + quantity, product.item_id],
    function(err,res) {
        //Let the user know the purchase was successful, re-run loadProducts();
        console.log("\nSucessfully added " + quantity + " " +product.product_name + "'s!\n");
        loadManagerMenu();
    }
  );

}
//ask the manager details about the new products
//add new Products
function promptManagerForNewProduct(products) {
  inquirer
  .prompt([
    {
      type: "input",
      name:"product_name",
      message: "What is the name of the product you would like to add?",
    },
    {
      type:"list",
      name:"department_name",
      choices: getDepartments(products),
      message : "Which department does this product fall into?"
    },
    {
      type:"input",
      name:"price",
      message:"How much does it cost?",
      validate:function(val) {
        return val > 0;
      }
    },
    {
      type: "input",
      name: "quantity",
      message: "How many do we have?",
      validate: function(val) {
        return !isNAN(val);
      }
    }
  ])
  .then(addNewProduct);
}
//adds new product to database
function addNewProduct(val) {
  connection.query(
    "INSERT INTO products (product_name, department_name, price, sotck_quantity) VALUES (?,?,?,?)",
    [val.product_name, val.department_name, val.price, val.quantity],
    function(err, res) {
      if(err)throw err;
      console.log(val.product_name, +"Added TO BAMAZON!\n");
      //when done, re-run loadManagerMenu();
      loadManagerMenu();
    }
  );
}
//Take an array of product boojects, return and array of their unique getDepartments
function getDepartments(products) {
  var departments = [];
  for(var i= 0; i<products.length; i++){
    if(departments.indexOf(products[i].department_name) === -1){
      departments.push(products[i].department_name)
    }
  }
  return departments;
}
//Check to see if the product the user chose is in the addToInventory
function checkInventory(choiceId, inventory) {
  for(var i=0;i<inventory.length;i++){
    if(inventory[i].item_id === choiceId){
      //if a matching product is found, return the products
      return inventory[i];
    }
  }
  //otherwise return null
}
