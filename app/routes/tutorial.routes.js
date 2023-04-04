const product = require("../models/product.js");
var multer = require('multer');
var upload = multer();
module.exports = app => {
    const tutorials = require("../controllers/tutorial.controller.js");
    const production = require("../controllers/product.controller");
    const image = require("../controllers/image.controller");
    var router = require("express").Router();

    router.get("/healthz", tutorials.health);
    router.post("/user", tutorials.create);
    router.put("/user", tutorials.update);
    router.get("/user", tutorials.findUser);
    router.get("/user/findid", tutorials.findUserById);

    router.post("/product", production.createProduction);
    router.get("/product", production.findById);
    router.put("/product", production.update);
    router.patch("/product", production.update);
    router.delete("/product", production.delete);

    router.get("/product/:product_id/image", image.find);
    router.post("/product/:product_id/image", upload.single('image'),image.upload);
    router.get("/product/:product_id/image/:image_id", image.findById);
    router.delete("/product/:product_id/image/:image_id", image.delete);

    app.use('/v1/', router);
}