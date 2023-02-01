module.exports = app => {
    const tutorials = require("../controllers/tutorial.controller.js");
    var router = require("express").Router();

    router.post("/user", tutorials.create);
    router.put("/user/update", tutorials.update);
    router.get("/user/find", tutorials.findUser);
    router.get("/user/findid", tutorials.findUserById);

    app.use('/api/', router);
}