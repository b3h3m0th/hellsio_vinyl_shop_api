import mysql, {
  MysqlError,
  Pool,
  PoolConnection,
  Query,
  queryCallback,
  QueryOptions,
  createPool,
} from "mysql";

export type DatabaseConnection = {
  host: string;
  user: string;
  password: string;
  database: string;
};

export type DB = {
  query: (query: string, params: any, callback: mysql.queryCallback) => any;
};

const pool: Pool = createPool({
  connectionLimit: 10,
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_DATABASE,
});

const db: DB = (() => {
  const _query = (query: string, params: any, callback: queryCallback) => {
    pool.getConnection((err: MysqlError, connection: PoolConnection) => {
      if (err) {
        connection.release();
        callback(err);
        throw err;
      }

      connection.query(query, params, (err: MysqlError, results, fields) => {
        connection.release();
        if (!err) {
          callback(err, results, fields);
        } else {
          callback(err);
        }
      });

      connection.on("error", (err: MysqlError) => {
        connection.release();
        callback(err);
        throw err;
      });
    });
  };

  return {
    query: _query,
  };
})();

export default db;
