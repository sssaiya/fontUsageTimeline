var JSONStream = require("JSONStream");
var es = require("event-stream");
var request = require("request");
var fs = require("fs");

const url = "https://raw.githubusercontent.com/Fyrd/caniuse/master/data.json";
const myConfig = {
  type: "pie",
  title: {
    text: "Browser Support",
    fontSize: 24,
  },
  series: [],
};

var userAgentData = {};
global.fontDataConfigs = {};

function getData(fontType) {
  fs.createReadStream("data.json", "utf8")
    .pipe(JSONStream.parse("*." + fontType))
    .pipe(
      es.mapSync(function (data) {
        var isSupported = {};
        for (var browser in data["stats"]) {
          isSupported[browser] = {};
          for (var version in data["stats"][browser]) {
            if (data["stats"][browser][version] == "y") {
              isSupported[browser][version] = true;
            } else {
              isSupported[browser][version] = false;
            }
          }
        }
        return makeChartData(isSupported);
      })
    );
}

function makeChartData(isSupported) {
  var newConfig = myConfig;
  newConfig.series = [];
  for (var browser in userAgentData) {
    var browserSupportData = {};
    var browserNoSupportData = {};
    browserSupportData.text = browser;
    browserNoSupportData.text = browser;
    let totalUsagePercentage = 0;
    let notSupportedPercent = 0;
    for (var version in userAgentData[browser]) {
      if (isSupported[browser][version]) {
        totalUsagePercentage += userAgentData[browser][version];
      } else {
        notSupportedPercent += userAgentData[browser][version];
      }
    }

    if (totalUsagePercentage <= 10) {
      browserSupportData.detatched = true;
    }
    browserSupportData.values = [totalUsagePercentage];
    browserSupportData.backgroundColor = "#00ff00";

    browserNoSupportData.values = [notSupportedPercent];
    browserNoSupportData.backgroundColor = "#ff0000";

    newConfig.series.push(browserSupportData);
    newConfig.series.push(browserNoSupportData);
  }
  console.log(newConfig);
  return newConfig;
}

//Server code to update data every x time
var cron = require("node-cron");

function schedule() {
  cron.schedule("* * * * *", () => {
    console.log("Updating Data");
    updateDataInServer();
    updateUserAgentData();
    updateFontDataInServer();
    console.log("Done Updating");
  });
}
function updateDataInServer() {
  request(url, function (error, response, body) {
    fs.writeFile("data.json", body, "utf-8", (err) => {
      // throws an error, you could also catch it here
      if (err) throw err;
    });
  });
}

function updateUserAgentData() {
  fs.createReadStream("data.json", "utf8")
    .pipe(JSONStream.parse("agents"))
    .pipe(
      es.mapSync(function (data) {
        for (var browser in data) {
          userAgentData[browser] = {};
          for (var version in data[browser].usage_global) {
            userAgentData[browser][version] =
              data[browser]["usage_global"][version];
          }
        }
      })
    );
}

function updateFontDataInServer() {
  const fonts = ["eot", "ttf", "woff", "woff2"];
  // var fontDataConfigs = {};
  fonts.forEach((font) => {
    // fontDataConfigs[font] = getData(font);
    global.fontDataConfigs[font] = getData(font);
  });
}

schedule();
