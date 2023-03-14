const db = require("../models");
const multer = require('multer');
const Tutorial = db.tutorials;
const Image= db.image;
const Product = db.product;
const Op = db.Sequelize.Op;
const bcrypt = require('bcrypt');
const Sequelize = require('sequelize');
const path = require('path');
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const S3_BUCKET = process.env.S3_BUCKET_NAME;


//parses authorization
function parseHeader(head) {
    const base = head.split(' ')[1];
    console.log(base);
    const credits = Buffer.from(base, 'base64').toString('ascii');
    console.log(credits);
    return credits;
}
  
exports.upload = (req, res) => {
    const uuid = uuidv4();
    const uuidString = uuid.toString();
    if (!req.headers.authorization) {
        res.status(403).send({ Error: "403 403 Fail credentials!" });
        console.log("Bad Request-403 Error, Fail credentials");
        return;
    }

    if (!req.params.product_id) {
        res.status(400).send({
            Error: "400 Bad Request-not give product id"
        });
        console.log("400 Bad Request-not give product id");
        return;
    }

    if (!req.file) {
        res.status(400).send({
            Error: "400 Bad Request-no file"
        });
        console.log("400 Bad Request-no file");
        return;
    }

    const pd = req.params.product_id;
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(req.file.originalname).toLowerCase());
    const mimetype = filetypes.test(req.file.mimetype);

    creds = parseHeader(req.headers.authorization);

    const[h_username,h_password] = creds.split(':');
    
    if (!mimetype && !extname) {
        es.status(400).send({
            Error: "400 Unsupported File Type"
        });
        console.log("400 Unsupported File Type");
    } else {
        Tutorial.findOne({
            where: {
                username: {
                    [Op.eq]: `${h_username}`
                }
            }, raw: true,
        }).then(data=>{ 
            present_user_id = data.id;
            Product.findOne({
                where: {
                    id: {
                        [Op.eq]: `${req.params.product_id}`
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
                        s3 = new AWS.S3({
                            accessKeyId: 'AKIAUUCM6HZYQCMNOXGH',
                            secretAccessKey: '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',
                            region:process.env.S3_REGION
                        });

                        var uploadParams = {
                            Bucket: process.env.S3_BUCKET_NAME,
                            Key: '',
                            Body: '',
                        };
                        var file = req.file;
                        uploadParams.Body = file.buffer;
                        s3_object_string = pd + "/" + uuidString+"/"+path.basename(file.originalname);
                        uploadParams.Key = s3_object_string;
                        s3.upload(uploadParams, async function (err, data) {
                            if (err) {
                                console.log("Error", err);
                            } if (data) {
                                Image.create({
                                    product_id: pd,
                                    file_name: file.originalname,
                                    s3_bucket_path: data.Location,
                                    uuid_string:uuidString
                                }).then(data => {
                                    return data;
                                }).then(data => {
                                    data = JSON.parse(JSON.stringify(data));
                                    console.log(data);
                                    res.status(201).send(data);
                                }).catch(err => {
                                    res.status(400).send({
                                        Error: "400 Bad Request-0"
                                    });
                                    console.log('Bad Request-0');
                                    return;
                                }
                                );
                            }
                        });
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
};

exports.find = (req, res) => {
    if (!req.headers.authorization) {
        res.status(403).send({ Error: "403 403 Fail credentials!" });
        console.log("Bad Request-403 Error, Fail credentials");
        return;
    }

    if (!req.params.product_id) {
        res.status(400).send({
            Error: "400 Bad Request-not give product id"
        });
        console.log("400 Bad Request-not give product id");
        return;
    }

    const pd = req.params.product_id;

    creds = parseHeader(req.headers.authorization);

    const [h_username, h_password] = creds.split(':');
    
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
                    [Op.eq]: `${req.params.product_id}`
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
                    Image.findAll({
                        where: {
                            product_id: pd
                        }
                    }).then(data => {
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


   
};

exports.findById = (req, res) => {
    if (!req.headers.authorization) {
        res.status(403).send({ Error: "403 403 Fail credentials!" });
        console.log("Bad Request-403 Error, Fail credentials");
        return;
    }

    if (!req.params.product_id||!req.body.id) {
        res.status(400).send({
            Error: "400 Bad Request-not give id"
        });
        console.log("400 Bad Request-not give id");
        return;
    }

    const pd = req.params.product_id;
    const iid = req.params.image_id;

    creds = parseHeader(req.headers.authorization);

    const [h_username, h_password] = creds.split(':');
    
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
                    [Op.eq]: `${req.params.product_id}`
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
                    const id = req.body.id;
                    Image.findByPk(iid).then(data => {
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

};

exports.delete = (req, res) => {
    if (!req.headers.authorization) {
        res.status(403).send({ Error: "403 403 Fail credentials!" });
        console.log("Bad Request-403 Error, Fail credentials");
        return;
    }

    if (!req.params.product_id||!req.body.id) {
        res.status(400).send({
            Error: "400 Bad Request-not give product id"
        });
        console.log("400 Bad Request-not give product id");
        return;
    }

    const pd = req.params.product_id;
    const iid = req.params.image_id;

    creds = parseHeader(req.headers.authorization);

    const [h_username, h_password] = creds.split(':');
    
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
                    [Op.eq]: `${req.params.product_id}`
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
                    const id = req.params.image_id;
                    Image.findByPk(iid).then(data => {
                        if (data.length != 0) {
                            s3 = new AWS.S3({
                                accessKeyId: 'AKIAUUCM6HZYQCMNOXGH',
                                secretAccessKey: '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',
                                region:process.env.S3_REGION
                            });
    
                            var Params = {
                                Bucket: process.env.S3_BUCKET_NAME,
                                Key: ''
                            };
                            var key = pd + "/" +data.uuid_string+"/"+data.file_name;
                            Params.Key = key;
                            s3.deleteObject(Params, function (err, data) {
                                if (err) {
                                    console.log(err, err.stack);
                                } else {
                                    console.log(data);
                                    Image.destroy({
                                        where: {
                                            id: id
                                        }
                                    }).then(data => {
                                        console.log("production delete successfully");
                                        res.status(204).send({
                                         Message: "No content"
                                         });
                                    }).catch(err => {
                                        res.status(400).send({
                                            Error: "Bad Request"
                                        });
                                    });
                                }
                            });
                        } else {
                            res.status(400).send({
                                Error: "No image"
                            });
                        }
                    }).catch(err => {
                        res.status(400).send({
                            Error: "Bad Request"
                        });
                    });
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
  
};
