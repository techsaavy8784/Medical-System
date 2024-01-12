import "bootstrap/dist/js/bootstrap.bundle";
import "bootstrap/dist/css/bootstrap.css";

import { Router } from "meteor/iron:router";
import { Session } from "meteor/session";

import "/client/main.html";
import "/imports/ui/common/loading/loading";
import "/imports/ui/login/login";
import "/imports/ui/home/home";
import "/imports/ui/common/header/header";
import "/imports/ui/patients/findPatient/findPatient";
import "/imports/ui/patients/currentPatient/currentPatient";

//Document Reference
import "/imports/ui/resources/DocumentReference/DocumentReferenceSearchModal/DocumentReferenceSearchModal";
import "/imports/ui/resources/DocumentReference/DocumentReferenceSaveModal/DocumentReferenceSaveModal";

//Diagnostic Report
import "/imports/ui/resources/DiagnosticReport/DiagnosticReportSearchModal/DiagnosticReportSearchModal";
import "/imports/ui/resources/DiagnosticReport/DiagnosticReportSaveModal/DiagnosticReportSaveModal";

//Observation
import "/imports/ui/resources/Observation/ObservationSearchModal/ObservationSearchModal";
import "/imports/ui/resources/Observation/ObservationSaveModal/ObservationSaveModal";

//Condition
import "/imports/ui/resources/Condition/ConditionSearchModal/ConditionSearchModal";
import "/imports/ui/resources/Condition/ConditionSaveModal/ConditionSaveModal";

Router.configure({
    layoutTemplate: 'mainContainer',
    loadingTemplate: 'loading'
});

Router.route("/", function () {
    this.render("home");
    this.layout('mainContainer');
})

Router.route("/login", function () {
    this.render("login");
    this.layout('mainContainer');
})

Router.route("/find-patient", function () {
    Session.set("getPatientDocs", null)
    Session.set("getLocalPatientDocs", null)
    Session.set("currentPatientInfo", null)
    const isLogin = Session.get("isLogin")
    this.render("findPatient")
    if (!isLogin) {
        Router.go("/login")
    } else {
    }
    this.layout('mainContainer');
})

Router.route("/current-patient", function () {
    const isLogin = Session.get("isLogin")
    this.render("currentPatient")
    if (!isLogin) {
        Router.go("/login")
    } else {
    }
    this.layout('mainContainer');
})

Router.route("/current-patient/:_id", function () {
    // This function will be called when the route is accessed
    const isLogin = Session.get("isLogin");
    // Access the dynamic parameter using this.params._id
    const resourceId = this.params._id;

    // Perform actions or render templates based on the dynamic parameter
    // For example:
    if (!isLogin) {
        Router.go("/login")
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
    this.layout('mainContainer');
})
