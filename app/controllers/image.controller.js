const db = require("../models");
const Tutorial = db.tutorials;
const Image= db.image;
const Product = db.product;
const Op = db.Sequelize.Op;
const bcrypt = require('bcrypt');
const Sequelize = require('sequelize');


//parses authorization
function parseHeader(head) {
    const base = head.split(' ')[1];
    console.log(base);
    const credits = Buffer.from(base, 'base64').toString('ascii');
    console.log(credits);
    return credits;
}
  

