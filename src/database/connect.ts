import * as mysql from "mysql";

export type DatabaseConnection = {
  host: string;
  user: string;
  password: string;
  database: string;
};

const connect: (connection: DatabaseConnection) => void = (
  connection: DatabaseConnection
) => {
  const con = mysql.createConnection({
    host: connection.host,
    user: connection.user,
    password: connection.password,
    databse: connection.database,
  });

  con.connect((err) => {
    if (err) return console.log(err);
  });

  return con;
};

export default connect;
