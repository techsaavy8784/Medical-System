import "bootstrap/dist/js/bootstrap.bundle";
import "bootstrap/dist/css/bootstrap.css";

import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { Session } from "meteor/session";

import "/client/main.html";
import "/imports/ui/common/loading/loading";
import "/imports/ui/login/login";
import "/imports/ui/home/home";
import "/imports/ui/common/header/header";
import "/imports/ui/patients/findPatient/findPatient";
import "/imports/ui/patients/currentPatient/currentPatient";
import "/imports/ui/common/patientMatchModal/patientMatchModal";

//Document Reference
import "/imports/ui/resources/DocumentReference/DocumentReferenceSearchModal/DocumentReferenceSearchModal";
import "/imports/ui/resources/DocumentReference/DocumentReferenceSaveModal/DocumentReferenceSaveModal";

//Diagnostic Report
import "/imports/ui/resources/DiagnosticReport/DiagnosticReportSearchModal/DiagnosticReportSearchModal";
import "/imports/ui/resources/DiagnosticReport/DiagnosticReportSaveModal/DiagnosticReportSaveModal";

//Observation
import "/imports/ui/resources/Observation/ObservationSearchModal/ObservationSearchModal";
import "/imports/ui/resources/Observation/ObservationSaveModal/ObservationSaveModal";

//QuestionnaireResponse
import "/imports/ui/resources/QuestionnaireResponse/QuestionnaireResponseSearchModal/QuestionnaireResponseSearchModal";
import "/imports/ui/resources/QuestionnaireResponse/QuestionnaireResponseSaveModal/QuestionnaireResponseSaveModal";

//Immunization
import "/imports/ui/resources/Immunization/ImmunizationSearchModal/ImmunizationSearchModal";
import "/imports/ui/resources/Immunization/ImmunizationSaveModal/ImmunizationSaveModal";

//Condition
import "/imports/ui/resources/Condition/ConditionSearchModal/ConditionSearchModal";
import "/imports/ui/resources/Condition/ConditionSaveModal/ConditionSaveModal";


FlowRouter.route('/', {
    name: 'uc.home',
    action() {
        this.render('mainContainer', 'home');
    }
});

FlowRouter.route('/login', {
    name: 'uc.login',
    action() {
        this.render('mainContainer', 'login');
    }
});

FlowRouter.route('/find-patient', {
    name: 'uc.findPatient',
    action() {
        Session.set("getPatientDocs", null);
        Session.set("getLocalPatientDocs", null);
        const isLogin = Session.get("isLogin");
        if(!isLogin) {
            FlowRouter.go('/login');
        } else {
            this.render('mainContainer', 'findPatient');
        }
    }
});

//any params with ? in flowRouter handled as optional params like :id?
// so below router code works for both /current-patient and /current-patient/id
FlowRouter.route('/current-patient/:_id?', {
    name: 'uc.currentPatient',
    action() {
        const isLogin = Session.get("isLogin");
        if(!isLogin) {
            FlowRouter.go('/login');
        } else {
            this.render('mainContainer', 'currentPatient');
        }
    }
});

//if Route not found just redirect to homePage
FlowRouter.notFound = {
    action: function() {
        FlowRouter.go('/')
    }
};
