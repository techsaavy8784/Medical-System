import "bootstrap/dist/js/bootstrap.bundle"
import "bootstrap/dist/css/bootstrap.css"

import { Template } from "meteor/templating"
import { Router } from "meteor/iron:router"
import { Session } from "meteor/session"
import "./main.html"
import "./login"
import "./home"
import "./header"
import "./find-patient"
import "./current-patient"

// Template.layout.onCreated(function () {
//   this.layout = new IronLayout({ template: 'layout' });
// });

Router.configure({
	layoutTemplate: "mainContainer",
})

Router.route("/", function () {
	this.render("home")
})

// Router.route('/newNav', function () {
//   this.render('newNav');
// });

Router.route("/login", function () {
	this.render("login")
})

Router.route("/find-patient", function () {
	Session.set("getPatientDocs", null)
	Session.set("currentPatientInfo", null)
	const isLogin = Session.get("isLogin")
	this.render("findPatient")
	if (!isLogin) {
		Router.go("/login")
	} else {
	}
	// this.render('notFound');
})

Router.route("/current-patient", function () {
	const isLogin = Session.get("isLogin")
	this.render("currentPatient")
	if (!isLogin) {
		Router.go("/login")
	} else {
	}
})

Router.route("/current-patient/:_id", function () {
	// This function will be called when the route is accessed
	const isLogin = Session.get("isLogin")
	// Access the dynamic parameter using this.params._id
	const resourceId = this.params._id

	// Perform actions or render templates based on the dynamic parameter
	// For example:
	if (!isLogin) {
	} else {
		this.render("currentPatient", {
			data: function () {
				// Here you can pass any data to the template based on the resource ID
				return {
					resourceId: resourceId,
				}
			},
		})
	}
})

// Router.route('/:resourceId/reference', function () {
//   // This function will be called when the route is accessed

//   // Access the dynamic parameter using this.params.resourceId
//   const resourceId = this.params.resourceId;

//   // Perform actions or render templates based on the dynamic parameter
//   // For example:
//   this.render('currentPatient', {
//     data: function () {
//       // Here you can pass any data to the template based on the resource ID
//       return {
//         resourceId: resourceId
//       };
//     }
//   });
// });
