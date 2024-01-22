import './ConditionSaveModal.html';

import { Template } from "meteor/templating";
import { Session } from "meteor/session";
import { Meteor } from "meteor/meteor";
import { localsHelpers } from "/imports/helpers/localsHelpers";
import { resourceHelpers } from "/imports/helpers/resourceHelpers";


Template.ConditionSaveModal.onCreated(function resourceOnCreated(){
    Session.set("showDocSaveModal", false);
    Session.set("showDocFhirModal", false);
    Session.set("showXMLModal", false);
    Session.set("confirmPatientDetails", false);
});

Template.ConditionSaveModal.onRendered( function () {
    const modalElement = this.find('#ConditionSaveModal');

    const instance = this;
    const parentInstance = instance.view.parentView.templateInstance();
    $(modalElement).on('hidden.bs.modal', function (event) {
        Session.set('confirmPatientDetails', false);
        const selectElement = parentInstance.find('.inputFindDoc');
        $(selectElement).val('Select an Option');

        Session.set("showDocSaveModal", false);
        Session.set("showDocFhirModal", false);
        Session.set("showXMLModal", false);

        Session.set("emptyPdfData", false);
        Session.set("emptyXmlData", false);
    });
});

Template.ConditionSaveModal.helpers({
    showDocSaveModal() {
        return Session.get("showDocSaveModal");
    },
    saveDocModalData() {
        return Session.get("saveDocModalData");
    },
    showDocFhirModal() {
        return Session.get("showDocFhirModal");
    },
    showXMLModal() {
        return Session.get("showXMLModal");
    },
    fhirDocModalData() {
        return Session.get("fhirDocModalData");
    },
    docXMLModalData() {
        return Session.get("docXMLModalData");
    },
    patientMrn() {
        return Session.get("currentPatientID")
    },
    patientID() {
        return Session.get("currentPatientData")?.resource?.name[0]?.id;
    },
    patientDetailsConfirmed() {
        return Session.get('confirmPatientDetails');
    },
    isPatientDetailsConfirmed() {
        return !Session.get('confirmPatientDetails');
    },
});

Template.ConditionSaveModal.events({
    async 'click .save-doc-data'(event, instance) {
        event.preventDefault();

        //first check that user confirm the patient data or not
        if(!Session.get('confirmPatientDetails')){
            alert('Please confirm the Patient Details first');
            return;
        }

        //Extra Checks added as per ticket #186882040
        // TODO: what will do in that case
        const res = await resourceHelpers.matchPatientDetails();

        if(!res){
            return;
        }


        const canSave = Session.get("showDocSaveModal");

        let destSystemURL = localsHelpers.getdestSystemURL();

        const url = destSystemURL + "Patient";
        const patientId = Session.get("currentPatientID");
        const patientName = Session.get("currentPatientName");
        const activeResourceType = Session.get("activeResourceType");
        const destSystemId = localsHelpers.getdestSystemId();
        const srcResource = Session.get("selectedDoc")?.resource;
        const srcResourceId = Session.get("selectedDoc")?.resource.id;
        const body = {
            "resourceType": activeResourceType,
            "destPatientId": patientId,
            "destPatientName": patientName,
            "destSystemId": destSystemId,
            "srcResourceId": srcResourceId,
            "SrcResource": srcResource
        }
        console.group(Session.get("activeResourceType"))
        let destSystemName = destSystemId === `640ba5e3bd4105586a6dda74` ? `remote`: `local`
        console.log('desSystemId', destSystemId, destSystemName)
        console.log("payload", body);
        console.groupEnd();
        const token = Session.get("headers");
        // if (canSave) {
            console.log("save button is clicked.");
            Meteor.call('savePatientResource', url, body, {Authorization: token}, (error, result) => {
                if (error) {
                    console.log("error", error);
                    const errorInfo = error?.reason.response?.data
                    alert("ERROR !" + errorInfo.resourceType + "\n" + errorInfo.issue[0]?.details?.text);
                } else {
                    console.log("result: ", result)
                    const localName = localsHelpers.getLocals()[0]?.displayName
                    alert(`Resource successfully imported to your ${localName}`)
                }
            });
        // }
    },
    'click .confirm-patient-details' (event, instance) {
        Session.set('confirmPatientDetails', true);
    }
})
