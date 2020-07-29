var JSONStream = require("JSONStream");
var es = require("event-stream");
var request = require("request");

const url = "https://raw.githubusercontent.com/Fyrd/caniuse/master/data.json";
let myConfig = {
  type: "pie",
  title: {
    text: "Browser Support",
    fontSize: 24,
  },
  series: [],
};

global.myConfig = myConfig;

async function getData(fontType) {
  request(url)
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
  myConfig.series = [];
  for (var browser in userAgentData) {
    var browserSupportData = {};
    browserSupportData.text = browser;
    let totalUsagePercentage = 0;
    for (var version in userAgentData[browser]) {
      if (isSupported[browser][version]) {
        totalUsagePercentage =
          totalUsagePercentage + userAgentData[browser][version];
      }
    }

    if (totalUsagePercentage <= 10) {
      browserSupportData.detatched = true;
    }
    browserSupportData.values = [totalUsagePercentage];
    browserSupportData.color = "#00ff00"

    myConfig.series.push(browserSupportData);
  }
  return myConfig;
}

function getUserAgentData() {
  request(url)
    .pipe(JSONStream.parse("agents"))
    .pipe(
      es.mapSync(function (data) {
        var userAgentData = {};
        for (var browser in data) {
          userAgentData[browser] = {};
          for (var version in data[browser].usage_global) {
            userAgentData[browser][version] =
              data[browser]["usage_global"][version];
          }
        }
        global.userAgentData = userAgentData;
        // console.log(userAgentData);
      })
    );
}
getUserAgentData();
global.getData = getData;
