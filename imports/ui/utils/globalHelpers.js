/***** Global UI Helpers which can be used in any template *****/

import { Template } from "meteor/templating";
import { Session } from "meteor/session";

//global versionId helper for whole application usage
Template.registerHelper('versionId', function () {
    return Session.get("versionId");
});

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
    return Session.get(`${name}`) || '';
});


//get active resource type for whole application
Template.registerHelper('activeResourceType', function () {
    return Session.get("activeResourceType");
});

//get resource style based on given resourceType params
Template.registerHelper('getResourceStyle', function (activeResourceType) {
    return (Session.get("activeResourceType") === activeResourceType) ? "background: #c0c7d4;" : null;
});

//get resource style based on given resourceType params
Template.registerHelper('getPatientSummary', function (type) {
    let patient;
    if(type === 'local'){
        patient = Session.get('activeLocalPatient')
    } else {
        patient = Session.get('activeRemotePatient')
    }
    if(patient){
        return patient.patientSummary;
        // let { familyName, givenName, birthDate, patientId, MRN } = patient;
        // return `${familyName}, ${givenName}, ${birthDate}, ${patientId}, ${MRN}`
    }
});

//get allowed abilities based on selected and dest system
Template.registerHelper('isSaveDestSystemAllowed', function () {
    // if both system patient not selected just don't display it
    if(!(Session.get('activeRemotePatient') && Session.get('activeLocalPatient'))){
        return;
    }
    let isActive = Session.get('isActive');
    let destSystem = isActive === 'local' ? Session.get('remotes') : Session.get('locals');
    return destSystem[0]?.systems[0]?.abilities.includes('SAVE');
});

//get opposite patient details for displaying in resource modals (save)
Template.registerHelper('oppositePatientDetail', function (key) {
    let patientDetails;
    if(Session.get('isActive') === 'local'){
        patientDetails = Session.get('activeRemotePatient');
    } else {
        patientDetails = Session.get('activeLocalPatient');
    }
    return patientDetails && patientDetails[key]
});