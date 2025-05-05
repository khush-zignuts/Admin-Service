require("dotenv").config();
const { Admin } = require("../api/models/index");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");

const adminBootstrap = async () => {
  try {
    const existingAdmin = await Admin.findOne({
      where: { isDeleted: false },
      attributes: ["id"],
    });

    if (!existingAdmin) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(
        process.env.ADMIN_PASSWORD,
        salt
      );
      console.log("hashedPassword: ", hashedPassword);

      const admindata = {
        id: uuidv4(),
        name: process.env.ADMIN_NAME,
        phone: process.env.ADMIN_PHONE,
        email: process.env.ADMIN_EMAIL,
        password: hashedPassword,
      };

      await Admin.create(admindata);
      console.log("Default admin created.");
    }
    return true;
  } catch (error) {
    console.error("Error in Bootstrap:", error.message);
    throw error;
  }
};

module.exports = adminBootstrap;
