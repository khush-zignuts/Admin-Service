const {
  HTTP_STATUS_CODES,
  PAGINATION,
} = require("../../../../config/constant");
const { Sequelize, Op } = require("sequelize");
const sequelize = require("../../../../config/db");
const { Organizer } = require("../../../models/index");

module.exports = {
  getAllOrganizer: async (req, res) => {
    try {
      let { search } = req.query;
      let page = parseInt(req.query.page) || PAGINATION.DEFAULT_PAGE;
      let limit = parseInt(req.query.limit) || PAGINATION.DEFAULT_LIMIT;

      let whereClause = "WHERE o.is_deleted = false ";
      let replacements = { limit, offset };

      if (search) {
        whereClause += ` AND o.name ILIKE :search`;
        replacements.search = `%${search}%`;
      }

      const paginationClause = `LIMIT :limit OFFSET :offset`;

      const rawQuery = `
      SELECT
        o.id,
        o.name,
        o.phone_number,
        o.email
      FROM organizer AS o
      ${whereClause}
      ORDER BY o.name ASC
      ${paginationClause};
    `;

      const results = await sequelize.query(rawQuery, {
        replacements,
        type: Sequelize.QueryTypes.SELECT,
      });

      if (!results || results.length === 0) {
        return res.status(HTTP_STATUS_CODES.NOT_FOUND).json({
          status: HTTP_STATUS_CODES.NOT_FOUND,
          message: "organizer not found",
          data: "",
          error: "",
        });
      }
      // Count total for pagination
      const countQuery = `
        SELECT COUNT(o.id) AS total
        FROM organizer AS o
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
          organizers: results,
          totalRecords,
        },
        error: "",
      });
    } catch (error) {
      console.error("Error fetching events:", error.message);
      return res.status(HTTP_STATUS_CODES.SERVER_ERROR).json({
        status: HTTP_STATUS_CODES.SERVER_ERROR,
        message: "Failed to fetch organizer.",
        data: "",
        error: error.message || "SERVER_ERROR",
      });
    }
  },

  deactivateOrganizer: async (req, res) => {
    try {
      const { organizerId } = req.body;
      console.log("organizerId: ", organizerId);

      // Check if organizerId is provided

      if (!organizerId) {
        return res.status(HTTP_STATUS_CODES.NOT_FOUND).json({
          status: HTTP_STATUS_CODES.NOT_FOUND,
          message: "Organizer ID is required",
          data: "",
          error: "",
        });
      }

      // Check for any ongoing or future events
      const ongoingEventsQuery = `
      SELECT COUNT(id) AS count
      FROM event AS e
      WHERE e.organizer_id = :organizerId
        AND (
          e.start_time > CAST(NOW() AS time) 
           OR (
                TO_TIMESTAMP(e.date / 1000)::date = CURRENT_DATE
                AND e.start_time > CAST(NOW() AS time)
              )
        )
        AND e.is_deleted = false
        AND e.is_active = true
    `;

      const [result] = await sequelize.query(ongoingEventsQuery, {
        replacements: { organizerId },
        type: Sequelize.QueryTypes.SELECT,
      });
      console.log("result: ", result);

      // If there are ongoing events, return an error
      if (parseInt(result.count) > 0) {
        return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
          status: HTTP_STATUS_CODES.BAD_REQUEST,
          message:
            "Cannot deactivate organizer with upcoming or ongoing events.",
          data: "",
          error: "",
        });
      }

      const organizer = await Organizer.findOne({
        where: { id: organizerId, isDeleted: false },
        attributes: ["id", "name", "email"],
      });

      if (organizer && organizer.email) {
        const templateData = {
          name: organizer.name,
          year: new Date().getFullYear(),
        };

        await sendEmail(
          email,
          "Account Deactivated by Admin",
          "../../assets/templates/organizer-eactivated-email.hbs",
          templateData
        );
      }

      // Deactivate organizer by setting is_active to false
      await Organizer.update(
        { is_active: false },
        { where: { id: organizerId } }
      );

      return res.status(HTTP_STATUS_CODES.OK).json({
        status: HTTP_STATUS_CODES.OK,
        message: "Organizer deactivated successfully.",
        data: "",
        error: "",
      });
    } catch (error) {
      console.error("Error deactivating organizer:", error.message);
      return res.status(HTTP_STATUS_CODES.SERVER_ERROR).json({
        status: HTTP_STATUS_CODES.SERVER_ERROR,
        message: "Failed to deactivate organizer.",
        data: "",
        error: error.message || "SERVER_ERROR",
      });
    }
  },
};
