const { Admin } = require("../api/models/index");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");

const adminBootstrap = async () => {
  try {
    const existingAdmin = await Admin.findOne({
      where: { isDeleted: false },
      attributes: ["id"],
    });
    // console.log("existingAdmin: ", existingAdmin);

    if (!existingAdmin) {
      console.log("first");
      const admindata = {
        id: uuidv4(),
        name: "admins",
        email: "admin123@gmail.com",
        password: "Admin@123",
      };

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(admindata.password, salt);

      const newAdmin = await Admin.create({
        id: uuidv4(),
        name: admindata.name,
        email: admindata.email,
        password: hashedPassword,

        createdBy: admindata.id,
      });
    }
    return true;
  } catch (error) {
    console.error("Error in Bootstrap:", error.message);
  }
};

module.exports = adminBootstrap;
