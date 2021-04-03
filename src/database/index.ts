import mysql, {
  MysqlError,
  Pool,
  PoolConnection,
  Query,
  queryCallback,
  QueryOptions,
} from "mysql";

export type DatabaseConnection = {
  host: string;
  user: string;
  password: string;
  database: string;
};

export type DB = {
  query: (
    query: mysql.Query,
    params: QueryOptions,
    callback: mysql.queryCallback
  ) => void;
};

const pool: Pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_DATABASE,
});

const db: DB = (() => {
  const _query = (
    query: Query,
    params: QueryOptions,
    callback: queryCallback
  ) => {
    pool.getConnection((err: MysqlError, connection: PoolConnection) => {
      if (err) {
        connection.release();
        callback(null, err);
        throw err;
      }

      connection.query(query, params, (err: MysqlError, rows) => {
        connection.release();
        if (!err) {
          callback(rows);
        } else {
          callback(null, err);
        }
      });

      connection.on("error", (err: MysqlError) => {
        connection.release();
        callback(null, err);
        throw err;
      });
    });
  };

  return {
    query: _query,
  };
})();

export default db;
