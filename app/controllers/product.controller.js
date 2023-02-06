const db = require("../models");
const Tutorial = db.tutorials;
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

//create production
exports.createProduction = (req, res) => {
    if (!req.headers.authorization) {
        res.status(403).send({ Error: "403 403 Fail credentials!" });
        console.log("Bad Request-403 Error, Fail credentials");
        return;
    }

    if ((!req.body.name || !req.body.description || !req.body.sku || !req.body.manufacturer || !req.body.quantity)) {
        res.status(400).send({
            Error: "400 Bad Request-empty params"
        });
        console.log("400 Bad Request-empty params");
        return;
    }
}