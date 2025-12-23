module.exports = (sequelize, DataTypes) => {
  const API_Logs = sequelize.define('API_Logs', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    method: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    endpoint: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    status_code: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status_type: {
      type: DataTypes.ENUM('SUCCESS', 'ERROR'),
      allowNull: false,
      defaultValue: 'SUCCESS'
    },
    triggered_by_email: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'anonymous'
    },
    triggered_by_role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'guest'
    },
    timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  },
    {
      timestamps: false
    });
  return API_Logs;
};