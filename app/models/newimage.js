const bcrypt = require('bcrypt');
//const  DataTypes = require("sequelize");
module.exports = (sequelize,Sequelize) => {
    const Image = sequelize.define("images", {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        product_id: {
            type: Sequelize.INTEGER,
        },
        file_name: {
            type: Sequelize.STRING,
        },
        s3_bucket_path: {
            type: Sequelize.STRING,
        },
        uuid_string: {
            type:Sequelize.STRING
        }
    }
    );
    return Image;
};
