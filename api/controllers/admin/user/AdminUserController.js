const { Event } = require("../../../models/index");
const { HTTP_STATUS_CODES } = require("../../../../config/constant");
const { VALIDATION_RULES } = require("../../../../config/validationRules");
const VALIDATOR = require("validatorjs");

const { Sequelize, where } = require("sequelize");
const sequelize = require("../../../../config/db");

module.exports = {
  getAllUsers: async (req, res) => {
    try {
      let { search } = req.query;

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
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
          message: "User not found",
          data: null,
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
          totalPages,
        },
        error: null,
      });
    } catch (error) {
      console.error("Error fetching users:", error.message);
      return res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
        message: "Failed to fetch users.",
        data: null,
        error: error.message || "INTERNAL_SERVER_ERROR",
      });
    }
  },
};
