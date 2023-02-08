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

    const productions = {
        name: req.body.name,
        description: req.body.description,
        sku: req.body.sku,
        manufacturer: req.body.manufacturer,
        quantity: req.body.quantity
    }

    creds = parseHeader(req.headers.authorization);
    const [h_username, h_password] = creds.split(':');
    const SKU = req.body.sku;

    Product.findOne({
        where: {
            sku: {
                [Op.eq]: `${SKU}`
            }
        }, raw: true,
    }).then(data => {
        //console.log("data: " + data);
        if (data && data.length != 0) {
            res.status(400).send({
                Error: "400 Repeated sku"
            });
            return;
        } else {
            Tutorial.findOne({
                where: {
                    username: {
                        [Op.eq]: `${h_username}`
                    }
                }, raw: true,
            }).then(data => {
                console.log(data);
                data_user_id = data.id;
                if (data.length != 0) {
                    bcrypt.compare(h_password, data.password, function (err, result) {
                        if (result) {
                            if (req.body.quantity >= 0 && req.body.quantity <= 100) {
                            
                                Product.create({
                                    name: req.body.name,
                                    description: req.body.description,
                                    sku: req.body.sku,
                                    manufacturer: req.body.manufacturer,
                                    quantity: req.body.quantity,
                                    owner_user_id:data_user_id,
                                }).then(data => {
                                    return data;
                                }).then(data => {
                                    data = JSON.parse(JSON.stringify(data));
                                    console.log(data);
                                    res.status(201).send(data);
                                }).catch(Sequelize.ValidationError, function (err) {
                                    return res.status(422).send(err.errors);
                                }).catch(err => {
                                    res.status(400).send({
                                        Error: "400 Bad Request-0"
                                    });
                                    return;
                                })
                            } else {
                                res.status(400).send({
                                    Error: "400 quantity must in [0,100]"
                                });
                            }
                        }
                        else {
                            res.status(401).send({
                                Error: "401 Unauthorized"
                            });
                        }
                    });
                } else {
                    throw err;
                }
            }).catch(err => {
                res.status(400).send({
                    Error: "400 Bad Request-1"
                });
            });
        }
    }).catch(err => {
        console.log("mistake: " + err);
        res.status(400).send({
            Error: "400 Bad Request-2"
        });
    });

    


};

//find production by id

exports.findById = (req, res) => {
    const id = req.body.id;
    Product.findByPk(id).then(data => {
        if (data.length != 0) {
            data = JSON.parse(JSON.stringify(data));
            res.send(data);
        } else {
            throw err;
        }
    }).catch(err => {
        res.status(400).send({
            Error: "Bad Request"
        });
    });
};

//update production

exports.update = (req, res) => {
    if (!req.headers.authorization) {
        res.status(401).send({ Error: "401  Fail credentials!" });
        console.log("Bad Request-401 Error, Fail credentials");
        return;
    }

    if ((!req.body.id||!req.body.name || !req.body.description || !req.body.sku || !req.body.manufacturer || !req.body.quantity)) {
        res.status(400).send({
            Error: "400 Bad Request-empty params"
        });
        console.log("400 Bad Request-empty params");
        return;
    }

    creds = parseHeader(req.headers.authorization);
    const [h_username, h_password] = creds.split(':');
    const SKU = req.body.sku;

    Product.findOne({
        where: {
            sku: {
                [Op.eq]: `${SKU}`
            }
        }, raw: true,
    }).then(data => {
        if (data && data.length != 0) {
            res.status(400).send({
                Error: "400 Repeated sku"
            });
            return;
        } else {
            Tutorial.findOne({
                where: {
                    username: {
                        [Op.eq]: `${h_username}`
                    }
                }, raw: true,
            }).then(data => {
                present_user_id = data.id;
                Product.findOne({
                    where: {
                        id: {
                            [Op.eq]: `${req.body.id}`
                        }
                    }, raw: true,
                }).then(data => {
                    if (!data) {
                        res.status(400).send({
                            Error: "400 invalid prodution id"
                        });
                        return;
                    } else {
                        product_user_id = data.owner_user_id;
                        if (product_user_id != present_user_id) {
                            res.status(403).send({
                                Error: "Forbidden"
                            });
                        } else {
                            if (req.body.quantity >= 0 && req.body.quantity <= 100) {
                                Product.update({
                                    name: req.body.name,
                                    description: req.body.description,
                                    sku: req.body.sku,
                                    manufacturer: req.body.manufacturer
                                }, {
                                    where: {
                                        id: `${req.body.id}`
                                    }
                                }).then(data => {
                                    res.status(204).send({
                                        Message: "No content"
                                    });
                                    console.log("update successfully");
                                }
                                ).catch(err => {
                                    res.status(400).send({
                                        Error: "400 Bad Request"
                                    });
                                });
                            } else {
                                res.status(400).send({
                                    Error: "400 quantity must in [0,100]"
                                });
                            }
                        }
                    }
                }
                ).catch(err => {
                    res.status(400).send({
                        Error: "400 Bad Request"
                    });
                });
            }).catch(err => {
                res.status(400).send({
                    Error: "400 Bad Request"
                });
            });
        }
    }).catch(err => {
        res.status(400).send({
            Error: "400 Bad Request"
        });
    });

};

//delete production
exports.delete = (req, res) => {
    if (!req.headers.authorization) {
        res.status(401).send({ Error: "401  Fail credentials!" });
        console.log("Bad Request-401 Error, Fail credentials");
        return;
    }

    if (!req.body.id) {
        res.status(400).send({
            Error: "400 Bad Request-empty params"
        });
        console.log("400 Bad Request-empty params");
        return;
    }

    creds = parseHeader(req.headers.authorization);
    const [h_username, h_password] = creds.split(':');

    Product.findOne({
        where: {
            id: {
                [Op.eq]: `${req.body.id}`
            }
        }, raw: true,
    }).then(data => {
        if (!data) {
            res.status(404).send({
                Error: "404 this id has no records"
            });
            return;
        } else {
            product_user_id = data.owner_user_id;
            Tutorial.findOne({
                where: {
                    username: {
                        [Op.eq]: `${h_username}`
                    }
                }, raw: true,
            }).then(data => {
                present_user_id = data.id;
                if (product_user_id != present_user_id) {
                    res.status(403).send({
                        Error: "Forbidden"
                    });
                } else {
                    Product.destroy({
                        where: {
                            id: {
                                [Op.eq]: `${req.body.id}`
                            }
                        }, raw: true,
                    }).then(data => {
                        console.log("production delete successfully");
                        res.status(204).send({
                            Message: "No content"
                        });
                    }
                    ).catch(err => {
                        res.status(400).send({
                            Error: "Bad Request-no record"
                        });
                    });
                }
            }
            ).catch(err => {
                res.status(400).send({
                    Error: "Bad Request-no record"
                });
            });
        }
    }).catch(err => {
        res.status(400).send({
            Error: "Bad Request-no record"
        });
    });
};