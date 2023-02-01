const db = require("../models");
const Tutorial = db.tutorials;
const Op = db.Sequelize.Op;
const bcrypt = require('bcrypt');
const Sequelize = require('sequelize');
const saltRounds = 10;

//create new users
exports.create = (req, res) => {
  console.log("create user");
  console.log("req is:" + req.body.username);
  const username = req.body.username;
  const password = req.body.password;
  const first_name = req.body.first_name;
  const last_name = req.body.last_name;
  //empty return 400 code
  if (!req.body.username || !req.body.password || !req.body.first_name || !req.body.last_name) {
    res.status(400).send({
      Error: "400 Bad Request-empty"
    });
    console.log('Bad Request');
    return;
  }
  const users = {
    username: req.body.username,
    password: req.body.password,
    first_name: req.body.first_name,
    last_name: req.body.last_name,
  }

  //check email is valid
  var mailform = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;
  if (username.match(mailform)) {
    
  } else {
    res.status(400).send({
      Error: "400 Bad Request-invalid email"
    });
    console.log('Bad Request-email');
    return;
  }

  //check password
  var ValidatePassword = require('validate-password');
  var options = {
    enforce: {
      lowercase: true,
      uppercase: true,
      specialCharacters: true,
      numbers: true
    }
  };
  var validator = new ValidatePassword(options);
  var passwordData = validator.checkPassword(password);
  console.log(passwordData.isValid);
  if (passwordData.isValid && password.length >= 8) {
    
  } else {
    res.status(400).send({
      Error: "400 Bad Request-invalid password"
    });
    console.log('Bad Request-password');
    return;
  }

  //check if the email exits in the database
  Tutorial.findAll({
    where: {
      username: {
        [Op.eq]: `${username}`
      }
    }, raw: true,
  }).then(data => {
    if (data.length != 0) {
      res.status(400).send({
        Error: "400 Bad Request-existed email"
      });
      console.log('Bad Request-existed email');
      return;
    } else {
      Tutorial.create(users).then(data => {
        return data;
      }).then(data => {
        data = JSON.parse(JSON.stringify(data));
        delete data.password;
        res.status(201).send(data);
      }).catch(err => {
        res.status(400).send({
          Error: "400 Bad Request-0"
        });
        console.log('Bad Request-0');
        return;
      });
    }
  }).catch(err => {
    console.log(err);
    res.status(400).send({
      Error: "400 Bad Request-1"
    });
    console.log('Bad Request-1');
    return;
  });

  
};

//parses authorization
function parseHeader(head) {
  const base = head.split(' ')[1];
  console.log(base);
  const credits = Buffer.from(base, 'base64').toString('ascii');
  console.log(credits);
  return credits;
}

//get user information
exports.findUser = (req, res) => {
  //console.log(req.headers.authorization);
  //console.log(req.body);
  if (!req.headers.authorization) {
    res.status(403).send({
      Error: '403 Fail credentials!'
    });
    console.log('Bad Request');
    return;
  }

  cred = parseHeader(req.headers.authorization);
  const [username, password] = cred.split(':');
  
  function hasAccess(result, data) {
    if (result) {
      delete data.password;
      res.send(data);
    } else {
      res.status(403).send({
        Error: '403 Fail credentials!'
      });
      console.log('Bad Request');
    }
  }

  Tutorial.findOne({
    where: {
      username: {
        [Op.eq]: `${username}`
      }
    }, raw: true,
  }).then(data => {
    if (data.length != 0) {
      bcrypt.compare(password, data.password, function (err, result) {
        console.log(result);
        hasAccess(result, data);
      });
    } else {
      throw err;
    }
  }).catch(err => {
    res.status(400).send({
      Error: "400 Bad Request"
    });
    console.log('Bad Request');
  });
};

//update
exports.update = (req, res) => {
  console.log('update user');
  if (!req.headers.authorization) {
    res.status(403).send({ Error: "403 Fail credentials!" });
    console.log('Bad Request');
    return;
  }

  if (!req.body.password || !req.body.first_name || !req.body.last_name) {
    res.status(400).send({
      Error: "400 Bad Request-content empty"
    });
    console.log('Bad Request-content empty');
    return;
  }

  if ((req.body.account_created || req.body.account_updated)) {
    res.status(400).send({
      Error: "400 Bad Request-time warning"
    });
    console.log('Bad Request-time warning');
    return;
  }

  var ValidatePassword = require('validate-password');
  var options = {
    enforce: {
      lowercase: true,
      uppercase: true,
      specialCharacters: true,
      numbers: true
    }
  };
  var validator = new ValidatePassword(options);
  var passwordData = validator.checkPassword(req.body.password);
  console.log(passwordData.isValid);
  if (passwordData.isValid && req.body.password.length >= 8) {
    
  } else {
    res.status(400).send({
      Error: "400 Bad Request-password invalid"
    });
    console.log('Bad Request-password invalid');
    return;
  }

  cred = parseHeader(req.headers.authorization);
  const [h_username, h_password] = cred.split(':');
  function hasAccess(result, data) {
    console.log(JSON.stringify(data));
  }

  Tutorial.findOne({
    where: {
      username: {
        [Op.eq]: `${h_username}`
      }
    }, raw: true,
  }).then(data => {
    if (data.length != 0) {
      bcrypt.compare(h_password, data.password, function (err, result) {
        console.log(result);
        if (result) {
          bcrypt.hash(req.body.password, 10).then(function (hash) {
            req.body.password = hash;
            console.log("req.body.password" + req.body.password);

            Tutorial.update({
              password: req.body.password,
              first_name: req.body.first_name,
              last_name: req.body.last_name
            }, {
              where: {
                password: `${data.password}`,
                username:`${h_username}`,
                first_name: `${data.first_name}`,
                last_name: `${data.last_name}`,
              }
            }).then(() => {
              
              return Tutorial.findOne({
                where: {
                  username: {
                    [Op.eq]: `${h_username}`
                  }
                }, raw: true,
              }).then(data => {
                delete data.password;
                res.send(data);
              })
            }).catch(err => {
              console.log("error; " + err);
              res.status(400).send({
                Error: "Bad Request-no record"
              });
              console.log('Bad Request');
            });
          });
        }
        else {
          res.status(403).send({
            Error: "Bad 403 Fail credentials!"
          });
          console.log('Bad Request');
        }
      });
    } else {
      throw err;
    }
  }).catch(err => {
    res.status(400).send({
      Error: "Bad Request-5"
    });
    console.log('Bad Request');
  });


};

//find by id

exports.findUserById = (req, res) => {
  console.log('user find by id');
  //const id = req.params.id;
  const id = req.body.id;
  console.log(req.body.id);
  Tutorial.findByPk(id).then(data => {
    if (data.length != 0) {
      data = JSON.parse(JSON.stringify(data));
      delete data.password;
      res.send(data);
    } else {
      throw err;
    }
  }).catch(err => {
    res.status(400).send({
      Error: "Bad Request"
    });
    console.log('Bad Request');
  });
};