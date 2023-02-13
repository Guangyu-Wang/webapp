let chai = require('chai');
let chaiHttp = require('chai-http');
let should = chai.should();
let app = require('../server');

const assert = require('chai').assert;
const { expect } = chai;
chai.use(chaiHttp);

describe("Test email/username when create:", () => {
    it("Email/username must be valid", (done) => {
        chai.request(app)
            .post("/api/user")
            .send({
                "username": "12345@gmail.com",
                "password": "990512Wgy@",
                "first_name": "guangyu",
                "last_name": "wang"
            })
            .end((err, res) => {
                res.should.have.status(400);
                done();
            })
    });
});
