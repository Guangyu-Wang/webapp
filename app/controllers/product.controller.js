const db = require("../models");
const Tutorial = db.tutorials;
const Product = db.product;
const Op = db.Sequelize.Op;
const bcrypt = require('bcrypt');
const Sequelize = require('sequelize');
const logger = require('../config/logger.js');
const SDC = require('statsd-client');
const sdc = new SDC({host:'localhost',port:8125});

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
        logger.warn('Fail credentials');
        return;
    }

    if ((!req.body.name || !req.body.description || !req.body.sku || !req.body.manufacturer || !req.body.quantity)) {
        res.status(400).send({
            Error: "400 Bad Request-empty params"
        });
        console.log("400 Bad Request-empty params");
        logger.warn('Empty Params');
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
            logger.warn('Repeated sku');
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
                                    logger.info('Create production successfully');
                                    sdc.increment('endpoint.productCreate');
                                }).catch(Sequelize.ValidationError, function (err) {
                                    return res.status(422).send(err.errors);
                                }).catch(err => {
                                    res.status(400).send({
                                        Error: "400 Bad Request-0"
                                    });
                                    logger.warn('Bad Request');
                                    return;
                                })
                            } else {
                                res.status(400).send({
                                    Error: "400 quantity must in [0,100]"
                                });
                                logger.warn('Bad Request');
                            }
                        }
                        else {
                            res.status(401).send({
                                Error: "401 Unauthorized"
                            });
                            logger.warn('Unauthorized');
                        }
                    });
                } else {
                    throw err;
                }
            }).catch(err => {
                res.status(400).send({
                    Error: "400 Bad Request-1"
                });
                logger.warn('Bad Request');
            });
        }
    }).catch(err => {
        console.log("mistake: " + err);
        res.status(400).send({
            Error: "400 Bad Request-2"
        });
        logger.warn('Bad Request');
    });

    


};

//find production by id

exports.findById = (req, res) => {
    const id = req.body.id;
    Product.findByPk(id).then(data => {
        if (data.length != 0) {
            data = JSON.parse(JSON.stringify(data));
            res.send(data);
            logger.info('Find successfully');
            sdc.increment('endpoint.productId');
        } else {
            throw err;
        }
    }).catch(err => {
        res.status(400).send({
            Error: "Bad Request"
        });
        logger.warn('Bad Request');
    });
};

//update production

exports.update = (req, res) => {
    if (!req.headers.authorization) {
        res.status(401).send({ Error: "401  Fail credentials!" });
        console.log("Bad Request-401 Error, Fail credentials");
        logger.warn('Fail credentials');
        return;
    }

    if ((!req.body.id||!req.body.name || !req.body.description || !req.body.sku || !req.body.manufacturer || !req.body.quantity)) {
        res.status(400).send({
            Error: "400 Bad Request-empty params"
        });
        console.log("400 Bad Request-empty params");
        logger.warn('Empty Params');
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
            logger.warn('Repeated SKU');
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
                        logger.warn('Invalid id');
                        return;
                    } else {
                        product_user_id = data.owner_user_id;
                        if (product_user_id != present_user_id) {
                            res.status(403).send({
                                Error: "Forbidden"
                            });
                            logger.warn('Forbidden');
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
                                    logger.info('update successfully');
                                    sdc.increment('endpoint.productUpdate');
                                }
                                ).catch(err => {
                                    res.status(400).send({
                                        Error: "400 Bad Request"
                                    });
                                    logger.warn('Bad Request');
                                });
                            } else {
                                res.status(400).send({
                                    Error: "400 quantity must in [0,100]"
                                });
                                logger.warn('Bad Request');
                            }
                        }
                    }
                }
                ).catch(err => {
                    res.status(400).send({
                        Error: "400 Bad Request"
                    });
                    logger.warn('Bad Request');
                });
            }).catch(err => {
                res.status(400).send({
                    Error: "400 Bad Request"
                });
                logger.warn('Bad Request');
            });
        }
    }).catch(err => {
        res.status(400).send({
            Error: "400 Bad Request"
        });
        logger.warn('Bad Request');
    });

};

//delete production
exports.delete = (req, res) => {
    if (!req.headers.authorization) {
        res.status(401).send({ Error: "401  Fail credentials!" });
        console.log("Bad Request-401 Error, Fail credentials");
        logger.warn('Fail credentials');
        return;
    }

    if (!req.body.id) {
        res.status(400).send({
            Error: "400 Bad Request-empty params"
        });
        console.log("400 Bad Request-empty params");
        logger.warn('Empty params');
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
            logger.warn('No records');
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
                    logger.warn('Forbidden');
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
                        logger.info('delete successfully');
                        sdc.increment('endpoint.productDelete');
                    }
                    ).catch(err => {
                        res.status(400).send({
                            Error: "Bad Request-no record"
                        });
                        logger.warn('No records');
                    });
                }
            }
            ).catch(err => {
                res.status(400).send({
                    Error: "Bad Request-no record"
                });
                logger.warn('No records');
            });
        }
    }).catch(err => {
        res.status(400).send({
            Error: "Bad Request-no record"
        });
        logger.warn('Bad Request');
    });
};

