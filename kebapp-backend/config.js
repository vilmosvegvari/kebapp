const dotenv = require('dotenv');

dotenv.config();
module.exports = {
  port: process.env.PORT,
  mongoIP: process.env.MONGO_IP
};