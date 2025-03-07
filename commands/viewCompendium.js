import { createViewerServer } from "@pcan/leveldb-viewer";
import encode from "encoding-down";
import leveldown from "leveldown";
import levelup from "levelup";
import { join } from "path";

const db = levelup(
  encode(leveldown(join(".", "packs", "racas")), {
    keyEncoding: "buffer",
    valueEncoding: "json",
  }),
);
const server = createViewerServer(db); // This returns a Node.JS HttpServer.
server.listen(9090); // you may invoke listen...
// server.close();
