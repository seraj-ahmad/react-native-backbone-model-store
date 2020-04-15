export default {
  init: {
    expected: {
      txns: [
        ["CREATE TABLE IF NOT EXISTS Whiteboard(\"_s\" INTEGER DEFAULT 1,\"name\" VARCHAR(256) PRIMARY KEY,\"title\" VARCHAR(256),\"password\" VARCHAR(256),\"owner\" INTEGER,\"isPublic\" INTEGER,\"created\" INTEGER DEFAULT false,\"thumbnail\" VARCHAR(256),\"users\" TEXT,\"dateCreated\" VARCHAR(64),\"dateModified\" VARCHAR(64),\"ts\" INTEGER DEFAULT null,\"tags\" TEXT,\"version\" INTEGER DEFAULT 1)"],
        ["CREATE TABLE IF NOT EXISTS Folder(\"_s\" INTEGER DEFAULT 1,\"name\" VARCHAR(256) NOT NULL PRIMARY KEY,\"badge\" INTEGER DEFAULT 0,\"ts\" INTEGER DEFAULT null)"],
        ["CREATE TABLE IF NOT EXISTS InkElement(\"_s\" INTEGER DEFAULT 1,\"id\" VARCHAR(256) NOT NULL,\"n\" INTEGER DEFAULT -1,\"w\" VARCHAR(256),\"l\" VARCHAR(256),\"u\" INTEGER NOT NULL,\"t\" FLOAT NOT NULL,\"p\" INTEGER DEFAULT 1,\"s\" INTEGER DEFAULT 1,\"d\" TEXT,\"ss\" INTEGER DEFAULT 1,\"tt\" TEXT DEFAULT null,\"tfms\" TEXT NOT NULL,\"changes\" TEXT NOT NULL,PRIMARY KEY (\"w\",\"u\",\"t\"))", "CREATE INDEX IF NOT EXISTS whiteboardIndex ON InkElement (\"w\")"],
        ["CREATE TABLE IF NOT EXISTS StateChange(\"_s\" INTEGER DEFAULT 1,\"s\" INTEGER DEFAULT 1,\"w\" VARCHAR(256) NOT NULL,\"u\" INTEGER NOT NULL,\"n\" INTEGER DEFAULT 0,\"ts\" INTEGER NOT NULL,\"op\" VARCHAR(256) NOT NULL,\"e\" TEXT,\"d\" TEXT,PRIMARY KEY (\"u\",\"ts\"))", "CREATE INDEX IF NOT EXISTS whiteboardIndex ON StateChange (\"w\")", "CREATE INDEX IF NOT EXISTS tsIndex ON StateChange (\"u\",\"ts\")"], 
        ["CREATE TABLE IF NOT EXISTS SessionRecord(\"_s\" INTEGER DEFAULT 1,\"_id\" VARCHAR(256) NOT NULL PRIMARY KEY,\"test\" VARCHAR(256) NOT NULL,\"ts\" INTEGER,\"n\" INTEGER,\"event\" VARCHAR(256) NOT NULL,\"d\" TEXT)", "CREATE INDEX IF NOT EXISTS testIndex ON SessionRecord (\"test\")"]
      ]
    }
  }
}
