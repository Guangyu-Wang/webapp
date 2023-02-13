const product = require("../models/product.js");

module.exports = app => {
    const tutorials = require("../controllers/tutorial.controller.js");
    const production = require("../controllers/product.controller");
    var router = require("express").Router();

    router.post("/user", tutorials.create);
    router.put("/user", tutorials.update);
    router.get("/user", tutorials.findUser);
    router.get("/user/findid", tutorials.findUserById);

    router.post("/product", production.createProduction);
    router.get("/product", production.findById);
    router.put("/product", production.update);
    router.patch("/product", production.update);
    router.delete("/product", production.delete);

    app.use('/v1/', router);
}