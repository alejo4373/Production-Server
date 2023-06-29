const {
  RDS_HOSTNAME,
  RDS_USERNAME,
  RDS_PASSWORD,
  RDS_PORT,
  RDS_DB_NAME,
  NODE_ENV,
} = process.env;

module.exports = {
  getDatabaseUrl: () => {
    console.log("af debug", NODE_ENV);
    // console.log('af debug here =====>\n\n\n', databaseUrl)
    if (NODE_ENV === "production") {
      const postgresURL = `postgresql://${RDS_USERNAME}:${RDS_PASSWORD}@${RDS_HOSTNAME}:${RDS_PORT}/${RDS_DB_NAME}`;
      console.log("af debug", postgresURL);
      return postgresURL;
    } else if (NODE_ENV === "test") {
      return "postgres://localhost:5432/production_test_db";
    } else {
      return "postgres://localhost:5432/production_dev_db";
    }
  },
};
