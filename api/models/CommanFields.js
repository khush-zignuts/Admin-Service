const { DataTypes } = require("sequelize");

const CommonFields = {
  createdAt: {
    type: DataTypes.BIGINT,
    field: "created_at",
    allowNull: true,
  },
  createdBy: {
    type: DataTypes.UUID,
    field: "created_by",
    allowNull: true,
  },
  isDeleted: {
    type: DataTypes.BOOLEAN,
    field: "is_deleted",
    defaultValue: false,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    field: "is_active",
    defaultValue: true,
  },
  updatedAt: {
    type: DataTypes.BIGINT,
    field: "updated_at",
    allowNull: true,
  },

  updatedBy: {
    type: DataTypes.UUID,
    field: "updated_by",
    allowNull: true,
  },

  deletedAt: {
    type: DataTypes.DATE,
    field: "deleted_at",
    allowNull: true,
  },
  deletedBy: {
    type: DataTypes.UUID,
    field: "deleted_by",
    allowNull: true,
  },
};

const commonOptions = {
  timestamps: false,
  hooks: {
    beforeCreate: (table, options) => {
      const now = Math.floor(Date.now() / 1000);
      table.createdAt = now;
      table.updatedAt = now;
    },
    beforeUpdate: (table, options) => {
      table.updatedAt = Math.floor(Date.now() / 1000);
    },
  },
};

module.exports = { CommonFields, commonOptions };
