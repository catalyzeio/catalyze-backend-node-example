"use strict";

angular.module("NodeExample", [])
.controller("ExampleController", function($scope, $http) {
    $scope.session = null;

    var resetForm = function() {
        $scope.formLoading = true;
        $scope.errors = [];
        $scope.registerSuccess = false;
    };

    var formDone = function() {
        $scope.formLoading = false;
    };

    var error = function(errors) {
        for (var i = 0; i < errors.errors.length; i++) {
            if (errors.errors[i].code == 401) {
                $scope.session = null;
            } else {
                $scope.errors.push(errors.errors[i].message);
            }
        }
        formDone();
    };

    resetForm();
    $http.get("/checksession")
    .success(function(data) {
        $scope.session = data;
        formDone();
    })
    .error(error);

    $scope.isRegisterMode = false;
    $scope.registerSuccess = false;

    $scope.username = "";
    $scope.password = "";
    $scope.email = "";

    $scope.signIn = function() {
        resetForm();
        $http.post("/signin", {
            username: $scope.username,
            password: $scope.password
        })
        .success(function(data) {
            $scope.session = data;
            $scope.username = "";
            $scope.password = "";
            $scope.notes = $scope.getNotes();
        })
        .error(error);
    };

    $scope.signUp = function() {
        resetForm();
        $scope.registerSuccess = false;
        $http.post("/signup", {
            username: $scope.username,
            password: $scope.password,
            email: $scope.email
        })
        .success(function(data) {
            $scope.registerSuccess = true;
            $scope.email = "";
            $scope.isRegisterMode = false;
            formDone();
        })
        .error(error);
    };

    $scope.signOut = function() {
        resetForm();
        $http.post("/signout", {})
        .then(function() {
            $scope.session = null;
            formDone();
        });
    };

    $scope.notes = [];
    $scope.newNote = "";

    $scope.getNotes = function() {
        $http.get("/notes")
        .success(function(data) {
            $scope.notes = data;
            formDone();
        })
        .error(error);
    };

    $scope.addNote = function() {
        resetForm();
        $http.post("/add", {
            note: $scope.newNote
        })
        .success(function(data) {
            $scope.notes = $scope.getNotes();
            formDone();
        })
        .error(error)
        .then(function() {
            $scope.newNote = "";
        });
    };
});
