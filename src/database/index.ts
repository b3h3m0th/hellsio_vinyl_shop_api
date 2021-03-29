import connect from "./connect";

class Database {
  public connection: any;
  constructor() {}

  connect = connect;
}

export default new Database();
