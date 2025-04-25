getAllEventsBySearch: async (req, res) => {
    try {
      const title = req.query.title || null;
      const category = req.query.category || null;

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;
      const replacements = { limit, offset };

      let whereClause = `WHERE e.is_deleted = false`;

      if (title) {
        whereClause += ` AND e.title ILIKE :title`;
        replacements.title = `%${title}%`;
      }

      if (category) {
        whereClause += ` AND e.category ILIKE :category`;
        replacements.category = `%${category}%`;
      }

      let paginationClause = `LIMIT :limit OFFSET :offset`;

      const rawQuery = `
        SELECT
          e.id,
          e.title,
          e.description,
          e.location,
          e.date,
          e.startTime,
        e.endTime,
          e."available_seats" AS capacity,
          e.category
        FROM event AS e
        ${whereClause}
        ORDER BY e.date ASC
        ${paginationClause};
      `;

      const events = await sequelize.query(rawQuery, {
        replacements,
        type: Sequelize.QueryTypes.SELECT,
      });

      const countQuery = `
        SELECT COUNT(e.id) AS total
        FROM event e
        ${whereClause}
        ${paginationClause};
      `;
      const countResult = await sequelize.query(countQuery, {
        replacements,
        type: Sequelize.QueryTypes.SELECT,
      });

      const totalRecords = parseInt(countResult[0].total);
      const totalPages = Math.ceil(totalRecords / limit);

      if (!events || events.length === 0) {
        return res.status(HTTP_STATUS_CODES.NOT_FOUND).json({
          status: HTTP_STATUS_CODES.NOT_FOUND,
          message: "No events found matching your search.",
          data: [],
          error: "",
        });
      }

      return res.status(HTTP_STATUS_CODES.OK).json({
        status: HTTP_STATUS_CODES.OK,
        message: "Events fetched successfully.",
        data: {
          events,
          totalRecords,
        },
        error: "",
      });
    } catch (error) {
      console.error("Error fetching events:", error.message);
      return res.status(HTTP_STATUS_CODES.SERVER_ERROR).json({
        status: HTTP_STATUS_CODES.SERVER_ERROR,
        message: "Failed to fetch events.",
        data: [],
        error: error.message || "SERVER_ERROR",
      });
    }
  },