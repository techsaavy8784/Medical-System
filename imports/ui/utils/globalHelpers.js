/***** Global UI Helpers which can be used in any template *****/

import { Template } from "meteor/templating";
import { Session } from "meteor/session";

//global isAdmin helper for whole application usage
Template.registerHelper('isAdmin', function () {
    return Session.get("userRole") === "Admin";
});


//global isLogin helper for whole application usage
Template.registerHelper('isLogin', function () {
    return Session.get("isLogin")
});

//global userInfo helper for whole application usage
Template.registerHelper('userInfo', function () {
    return Session.get("userInfo")
});


//get any session singular values just by name param
Template.registerHelper('getSessionValue', function (name) {
    return Session.get[name] || '';
});


//get resource style based on given resourceType params
Template.registerHelper('getResourceStyle', function (resourceType) {
    return (Session.get("resourceType") === resourceType) ? "background: #c0c7d4;" : null;
});