//initialize the NPM packages
var mysql = require("mysql");
var inquirer = require("inquirer");
require("console.table");
//initialize the connection var to sync with mysql database
var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  //user name
  user: "root",
  //pasword
  password:"",
  database:"bamazon"
});
