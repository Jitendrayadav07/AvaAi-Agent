//models/role.js
module.exports = (sequelize, DataTypes) => {
    const ArenaTransactions = sequelize.define(
      "tbl_arena_transactions",
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        transaction_hash: {
          type: DataTypes.STRING,
        },
        from_address: {
            type: DataTypes.STRING,
        },
        to_address: {
            type: DataTypes.STRING,
        },
        amount: {
            type: DataTypes.DOUBLE,
        },
        dex: {
            type: DataTypes.STRING,
        },
        function_called: {
          type: DataTypes.STRING,
        },
        block_number: {
          type: DataTypes.INTEGER,
        },
        timestamp: {
            type: DataTypes.STRING,
        },
        epoch_time: {
            type: DataTypes.STRING,
        },
      },
      {
        timestamps: false,
        underscored: false,
      }
    );
    return ArenaTransactions;
  };
  