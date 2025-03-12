import { createViewerServer } from "@pcan/leveldb-viewer";
import encode from "encoding-down";
import leveldown from "leveldown";
import levelup from "levelup";
import { join } from "path";

const db = levelup(
  encode(leveldown("C:\\Users\\Weslley\\AppData\\Local\\FoundryVTT\\Data\\worlds\\test\\data\\users"), {
    keyEncoding: "buffer",
    valueEncoding: "json",
  }),
);
const server = createViewerServer(db); // This returns a Node.JS HttpServer.
server.listen(9090); // you may invoke listen...
console.log("http://localhost:9090");
// server.close();
