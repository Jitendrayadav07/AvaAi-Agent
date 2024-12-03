//models/role.js
module.exports = (sequelize, DataTypes) => {
    const UprisingUsers = sequelize.define(
      "tbl_uprising_users",
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        user_uuid: {
          type: DataTypes.STRING,
        },
        user_rank: {
            type: DataTypes.INTEGER,
        },
        twitter_handle: {
            type: DataTypes.STRING,
        },
        user_name: {
            type: DataTypes.STRING,
        },
        user_picture: {
          type: DataTypes.TEXT,
        },
        points: {
            type: DataTypes.DOUBLE,
        },
      },
      {
        timestamps: false,
        underscored: false,
      }
    );
    return UprisingUsers;
  };
  