const { Event } = require("../../../models/index");
const {
  HTTP_STATUS_CODES,
  PAGINATION,
} = require("../../../../config/constant");
const { Sequelize, Op } = require("sequelize");
const sequelize = require("../../../../config/db");

module.exports = {
  getAllEvents: async (req, res) => {
    try {
      let { search } = req.query;

      let page = parseInt(req.query.page) || PAGINATION.DEFAULT_PAGE;
      let limit = parseInt(req.query.limit) || PAGINATION.DEFAULT_LIMIT;

      const offset = (page - 1) * limit;

      let whereClause = "WHERE e.is_deleted = false ";
      let replacements = { limit, offset };

      if (search) {
        whereClause += ` AND e.title ILIKE :search`;
        replacements.search = `%${search}%`;
      }

      const paginationClause = `LIMIT :limit OFFSET :offset`;

      const rawQuery = `
      SELECT
        e.id,
        e.title,
        e.date,
        e.start_time,
        e.end_time
      FROM event AS e
      ${whereClause}
      ORDER BY e.date ASC, e.start_time ASC 
      ${paginationClause};
    `;

      const results = await sequelize.query(rawQuery, {
        replacements,
        type: Sequelize.QueryTypes.SELECT,
      });

      if (!results || results.length === 0) {
        return res.status(HTTP_STATUS_CODES.NOT_FOUND).json({
          status: HTTP_STATUS_CODES.NOT_FOUND,
          message: "Event not found",
          data: "",
          error: "",
        });
      }
      // Count total for pagination
      const countQuery = `
        SELECT COUNT(e.id) AS total
        FROM event AS e
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
        message: "Events fetched successfully.",
        data: {
          events: results,
          totalRecords,
        },
        error: "",
      });
    } catch (error) {
      console.error("Error fetching events:", error.message);
      return res.status(HTTP_STATUS_CODES.SERVER_ERROR).json({
        status: HTTP_STATUS_CODES.SERVER_ERROR,
        message: "Failed to fetch event(s).",
        data: "",
        error: error.message || "SERVER_ERROR",
      });
    }
  },
};
