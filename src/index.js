var config = require("./config");
var express = require("express");

var app = express();
app.use(require("cookie-parser")());
app.use(require("body-parser").json());
require("./routes")(app, config.catalyze, config.data.className);
app.use(express.static("static"));

app.listen(config.server.port, function() {
    console.log("Listening on port %d", config.server.port);
});
