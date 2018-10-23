var express = require("express");
var fs = require("fs");
var path = require("path");
var request = require("request");
var cheerio = require("cheerio");
var app = express();
var bodyParser = require("body-parser");
var http = require("http");
var server = http.createServer(app);

const PORT = process.env.port || 3007;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "www")));

server.listen(PORT, function() {
  console.log(`server running on PORT ${PORT}`);
});

app.post("/metadata", function(req, res) {
  res.setHeader("Content-Type", "application/json");

  request(req.body.url, function(error, response, responseHtml) {
    var resObj = {};

    if (error) {
      res.end(JSON.stringify({ error: "There was an error of some kind" }));
      return;
    }

    (resObj = {}),
      ($ = cheerio.load(responseHtml)),
      ($title = $("head title").text()),
      ($desc = $('meta[name="description"]').attr("content")),
      ($ogkeywords = $('meta[property="og:keywords"]').attr("content")),
      ($images = $("img"));

    if ($title) {
      resObj.title = $title;
    }

    if ($desc) {
      resObj.description = $desc;
    }

    if ($ogkeywords && $ogkeywords.length) {
      resObj.ogkeywords = $ogkeywords;
    }

    if ($images && $images.length) {
      resObj.images = [];

      for (var i = 0; i < $images.length; i++) {
        resObj.images.push($($images[i]).attr("src"));
      }
    }
    res.send(JSON.stringify(resObj));
  });
});
