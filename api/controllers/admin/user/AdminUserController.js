const { User } = require("../../../models/index");
const {
  HTTP_STATUS_CODES,
  PAGINATION,
} = require("../../../../config/constant");
const { VALIDATION_RULES } = require("../../../../config/validationRules");
const VALIDATOR = require("validatorjs");
const { Op, Sequelize } = require("sequelize");
const sendEmail = require("../../../helper/Mail/sendEmail");
const sequelize = require("../../../../config/db");

module.exports = {
  getAllUsers: async (req, res) => {
    try {
      let { search } = req.query;

      const page = parseInt(req.query.page) || PAGINATION.DEFAULT_PAGE;
      const limit = parseInt(req.query.limit) || PAGINATION.DEFAULT_LIMIT;
      const offset = (page - 1) * limit;

      let whereClause = "WHERE u.is_deleted = false";
      let replacements = { limit, offset };

      if (search) {
        whereClause += ` AND u.name ILIKE :search`;
        replacements.search = `%${search}%`;
      }

      const paginationClause = `LIMIT :limit OFFSET :offset`;

      const rawQuery = `
        SELECT
          u.id,
          u.name,
          u.email,
          u.phone_number
        FROM users AS u
        ${whereClause}
        ORDER BY u.name ASC
        ${paginationClause};
      `;

      const results = await sequelize.query(rawQuery, {
        replacements,
        type: Sequelize.QueryTypes.SELECT,
      });

      if (!results || results.length === 0) {
        return res.status(HTTP_STATUS_CODES.NOT_FOUND).json({
          status: HTTP_STATUS_CODES.NOT_FOUND,
          message: "Users not found",
          data: "",
          error: "USER_NOT_FOUND",
        });
      }

      const countQuery = `
        SELECT COUNT(u.id) AS total
        FROM users AS u
        ${whereClause};
      `;

      const countResult = await sequelize.query(countQuery, {
        replacements,
        type: Sequelize.QueryTypes.SELECT,
      });

      const totalRecords = parseInt(countResult[0].total);
      const totalPages = Math.ceil(totalRecords / limit);

      return res.status(HTTP_STATUS_CODES.OK).json({
        status: HTTP_STATUS_CODES.OK,
        message: "Users fetched successfully.",
        data: {
          users: results,
          totalRecords,
        },
        error: null,
      });
    } catch (error) {
      console.error("Error fetching users:", error.message);
      return res.status(HTTP_STATUS_CODES.SERVER_ERROR).json({
        status: HTTP_STATUS_CODES.SERVER_ERROR,
        message: "Failed to fetch users.",
        data: "",
        error: error.message || "SERVER_ERROR",
      });
    }
  },

  deactivateUser: async (req, res) => {
    try {
      const { userId } = req.body;

      if (!userId) {
        return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
          status: HTTP_STATUS_CODES.BAD_REQUEST,
          message: "User ID is required",
          data: "",
          error: "",
        });
      }

      const user = await User.findOne({
        where: { id: userId, isDeleted: false },
        attributes: ["id", "name", "email"],
      });

      if (!user) {
        return res.status(HTTP_STATUS_CODES.NOT_FOUND).json({
          status: HTTP_STATUS_CODES.NOT_FOUND,
          message: "User not found",
          data: "",
          error: "",
        });
      }

      // Raw SQL to check for future/ongoing bookings
      const ongoingBookingQuery = `
        SELECT COUNT(e.id) AS count
        FROM booking AS b
        JOIN event AS e ON b.event_id = e.id
        WHERE b.user_id = :userId 
          AND b.status = 'booked'
          AND e.is_deleted = false   
          AND (
          TO_TIMESTAMP(e.date / 1000)::date = CURRENT_DATE
        )       
      `;

      const [result] = await sequelize.query(ongoingBookingQuery, {
        replacements: { userId: userId },
        type: Sequelize.QueryTypes.SELECT,
      });
      console.log("result: ", result);

      if (parseInt(result.count) > 0) {
        return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
          status: HTTP_STATUS_CODES.BAD_REQUEST,
          message:
            "Cannot deactivate user with upcoming or ongoing event bookings.",
          data: "",
          error: "",
        });
      }

      // Deactivate user
      await User.update({ isActive: false }, { where: { id: userId } });

      // Send email to user
      if (user.email) {
        const templateData = {
          name: user.name,
          year: new Date().getFullYear(),
        };

        await sendEmail(
          user.email,
          "Account Deactivated by Admin",
          "../../assets/templates/user-deactivated-email.hbs",
          templateData
        );
      }

      return res.status(HTTP_STATUS_CODES.OK).json({
        status: HTTP_STATUS_CODES.OK,
        message: "User deactivated successfully.",
        data: "",
        error: "",
      });
    } catch (error) {
      console.error("Error deactivating user:", error);
      return res.status(HTTP_STATUS_CODES.SERVER_ERROR).json({
        status: HTTP_STATUS_CODES.SERVER_ERROR,
        message: "Failed to deactivate user.",
        data: "",
        error: error.message || "SERVER_ERROR",
      });
    }
  },
};
