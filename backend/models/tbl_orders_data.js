//models/role.js
module.exports = (sequelize, DataTypes) => {
    const OrdersData = sequelize.define(
      "tbl_orders_data",
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        orderId: {
          type: DataTypes.STRING,
        },
        side: {
            type: DataTypes.STRING,
        },
        orderId: {
            type: DataTypes.STRING,
        },
        price: {
            type: DataTypes.STRING,
        },
        size: {
            type: DataTypes.STRING,
        },
        market: {
            type: DataTypes.STRING,
        },
        filledSize: {
            type: DataTypes.STRING,
        },
        fee: {
            type: DataTypes.STRING,
        },
        filledCost: {
            type: DataTypes.STRING,
        },
        status: {
            type: DataTypes.STRING,
        },
        createdAt: {
            type: DataTypes.DATE,
        },
        filledAt: {
            type: DataTypes.DATE,
        },
        type: {
            type: DataTypes.STRING,
        },
      },
      {
        timestamps: false,
        underscored: false,
      }
    );
    return OrdersData;
  };
  