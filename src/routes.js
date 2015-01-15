"use strict";

var catalyze = require("catalyze");

var getSession = function(req, res, callback) {
    var usersId = req.cookies.usersId;
    var token = req.cookies.token;

    if (!(usersId && token)) {
        sendErrors([{code: 401, message: "Cookies not set" }], res);
    } else {
        catalyze.sessionFromToken(usersId, token, function(errors, session) {
            if (errors) {
                unsetSession(res);
                sendErrors(errors, res);
            } else {
                callback(session);
            }
        });
    }
};

var setSession = function(res, usersId, token) {
    res.cookie("usersId", usersId);
    res.cookie("token", token);
};

var unsetSession = function(res) {
    res.clearCookie("usersId");
    res.clearCookie("token");
};

var sendErrors = function(errors, res) {
    res.status(errors[0].code).send(errors);
};

module.exports = function(app, config, className) {
    catalyze.config(config);

    app.post("/signin", function(req, res) {
        var username = req.param("username"),
            password = req.param("password");

        catalyze.signIn(username, password, function(errors, session) {
            if (errors) {
                sendErrors(errors, res);
            } else {
                setSession(res, session.usersId, session.token);
                res.send(session.sessionUser);
            }
        });
    });

    app.get("/checksession", function(req, res) {
        getSession(req, res, function(session) {
            res.send(session.sessionUser);
        });
    });

    app.post("/signout", function(req, res) {
        getSession(req, res, function(session) {
            session.signOut(function() {
                res.send();
            });
        });
    });

    app.post("/signup", function(req, res) {
        var username = req.param("username"),
            password = req.param("password"),
            email = req.param("email");
        var body = {
            "username": username,
            "password": password,
            "name": {
                "firstName": username
            },
            "email": {
                "primary": email
            }
        };
        catalyze.signUp(body, function(errors, response) {
            if (errors) {
                sendErrors(errors, res);
            } else {
                res.send(response);
            }
        });
    });

    app.post("/add", function(req, res) {
        var entry = {
            "text": req.param("note")
        };
        getSession(req, res, function(session) {
            session.createClassEntry(className, entry, function(errors, response) {
                if (errors) {
                    sendErrors(errors, res);
                } else {
                    res.send(response);
                }
            });
        });
    });

    app.get("/notes", function(req, res) {
        getSession(req, res, function(session) {
            session.queryClassEntries(className, {
                    "orderBy": "@createdAt",
                    "direction": "desc",
                    "pageSize": 5
                },
                function(errors, results) {
                    if (errors) {
                        sendErrors(res, errors);
                    } else {
                        res.send(results);
                    }
                });
        });
    });
};
