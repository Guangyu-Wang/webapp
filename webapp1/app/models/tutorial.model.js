const bcrypt = require('bcrypt');

module.exports = (sequelize, Sequelize) => {
  const Tutorial = sequelize.define("users", {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
      allowNull:false
      },
      username: {
            type: Sequelize.STRING,
            
      },
      password: {
          type: Sequelize.STRING,
          
      },
      first_name: {
          type: Sequelize.STRING,
          
        },
      last_name: {
            type: Sequelize.STRING,
            
      }
    }, {
      hooks: {
        beforeCreate: (users, options) => {
          {
            users.password = users.password && users.password!="" ? bcrypt.hashSync(users.password,10):"";
          }
        }
      }
    });
  
    return Tutorial;
  };