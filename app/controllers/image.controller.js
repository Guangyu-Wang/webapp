const db = require("../models");
const Image= db.image;
const Product = db.product;
const Op = db.Sequelize.Op;
const bcrypt = require('bcrypt');
const Sequelize = require('sequelize');