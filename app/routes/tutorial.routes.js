const product = require("../models/product.js");

module.exports = app => {
    const tutorials = require("../controllers/tutorial.controller.js");
    const production = require("../controllers/product.controller");
    var router = require("express").Router();

    router.post("/user", tutorials.create);
    router.put("/user/update", tutorials.update);
    router.get("/user/find", tutorials.findUser);
    router.get("/user/findid", tutorials.findUserById);

    router.post("/production", production.createProduction);
    router.get("/production/getbyid", production.findById);
    router.put("/production/update", production.update);
    router.patch("/production/update", production.update);
    router.delete("/production/delete", production.delete);

    app.use('/api/', router);
}