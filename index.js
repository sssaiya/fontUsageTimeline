var JSONStream = require("JSONStream");
var es = require("event-stream");
var request = require("request");
// var http = require("http");
// var fs = require("fs");

const url = "https://raw.githubusercontent.com/Fyrd/caniuse/master/data.json";

function getData(fontType) {
  request(url)
    .pipe(JSONStream.parse("*.WOFF"))
    .pipe(
      es.mapSync(function (data) {
        console.log("HERE");
        return data;
      })
    );
}

global.getData = getData;