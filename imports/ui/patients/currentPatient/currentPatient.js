import './currentPatient.html';
import '/imports/ui/common/sidebar/sidebar';
import '/imports/ui/common/pdfModal/pdfModal';
import '/imports/ui/common/saveResourceModal/saveResourceModal';
import '/imports/ui/common/searchResourceModal/SearchResourceModal';
import { localsHelpers } from "/imports/helpers/localsHelpers";

import { Template } from "meteor/templating";
import { Session } from "meteor/session";
import { Meteor } from "meteor/meteor";
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { remotesHelpers } from "/imports/helpers/remotesHelpers";
import { resourceHelpers } from "/imports/helpers/resourceHelpers";
import { logHelpers } from "/imports/helpers/logHelpers";


const showPdfModal = async (data) => {
    console.log("emptyPdfData", Session.get("emptyPdfData"));
    console.log("data", data);
    // console.log("pdfUrl", data.resource?.presentedForm[0]?.url)
    if (Session.get("isFindingDoc")) return
    let pdfUrl = "";
    
	const isActive = Session.get("isActive");
    const remote = remotesHelpers.getRemotes()[0];
    const local = localsHelpers.getLocals()[0];
    const authToken = Session.get("headers");
    const coreUrl = () => {
        if (isActive === "remote") {
            return remote?.systems[0]?.coreUrl;
        } else {
            return local?.systems[0]?.coreUrl;
        }
    }
    if (!!data.resource.content || !!data.resource?.presentedForm) {
        if (Session.get("activeResourceType") === "DocumentReference") {
            const corePdf = data.resource?.content[0]?.attachment?.url.split("/")
            pdfUrl = coreUrl() + "Binary/" + corePdf[corePdf.length - 1];
        } else if (Session.get("activeResourceType") === "DiagnosticReport") {
            const corePdf = data.resource?.presentedForm[0]?.url.split("/");
            pdfUrl = coreUrl() + "Binary/" + corePdf[corePdf.length - 1];
        }
    } else {
        Session.set("emptyPdfData", true);
        $('#docPdfModal').modal('show');
        return;
    }
    Session.set("isFindingDoc", true);

    console.log("pdfUrl", pdfUrl);
    
    const requestOption  = { Authorization: authToken };

      return new Promise(function (resolver, reject) {
        Meteor.call(
            "getPdfXml",
            pdfUrl,
            requestOption,
            (error, result) => {
                if (error) {
                    console.log("getPdfError", error);
                    reject(error);
                } else if (result?.statusCode === 200) {
                    console.log("getPdf", result);

                    const base64Data = atob(result?.data?.rawResource?.data);
                    
                        const uint8Array = new Uint8Array(base64Data.length);
                        for (let i = 0; i < base64Data.length; i++) {
                            uint8Array[i] = base64Data.charCodeAt(i);
                        }
                        const blob = new Blob([uint8Array], { type: 'application/pdf' });
                        const pdfDataUrl = URL.createObjectURL(blob);
                        Session.set("pdfDataUrl", pdfDataUrl);
                        Session.set("isFindingDoc", false);
                        Session.set("emptyPdfData", false);
                        $('#docPdfModal').modal('show');
                } else {
                    Session.set("isFindingDoc", false);
                    Session.set("emptyPdfData", true);
                    $('#docPdfModal').modal('show');
                }
            }
        )
    }).catch((error) => {

    });
}

const showXmlModal = async (data) => {
    
    let xmlUrl = "";
	const isActive = Session.get("isActive")
    const remote = remotesHelpers.getRemotes()[0]
    const local = localsHelpers.getLocals()[0]
    const authToken = Session.get("headers");
    const coreUrl = () => {
        if (isActive === "remote") {
            return remote.systems[0].coreUrl
        } else {
            return local.systems[0].coreUrl
        }
    }
    console.log("dataXML", data);
    if (!!data.resource?.content || !!data.resource?.presentedForm) {
        if (Session.get("activeResourceType") === "DocumentReference") {
            // xmlUrl = data.resource?.content[0]?.attachment?.url
            const coreXml = data.resource?.content[1]?.attachment?.url.split("/");
            xmlUrl = coreUrl() + "Binary/" + coreXml[coreXml.length - 1];
        } else if (Session.get("activeResourceType") === "DiagnosticReport") {
            const coreXml = data.resource?.presentedForm[1]?.url.split("/");
            xmlUrl = coreUrl() + "Binary/" + coreXml[coreXml.length - 1];

        }
    } else {
        Session.set("emptyXmlData", true);
        $('#saveResourceModal').modal('show');
        return;
    }
    Session.set("isFindingDoc", true);
            
    console.log("xmlUrl", xmlUrl);
    
    const requestOption  = { Authorization: authToken };

      return new Promise(function (resolver, reject) {
        Meteor.call(
            "getPdfXml",
            xmlUrl,
            requestOption,
            (error, result) => {
                if (error) {
                    console.log("getXmlError", error);
                    reject(error);
                } else if (result?.statusCode === 200) {
                    console.log("getXml", result);
                    
                    const base64Data = result?.data?.rawResource?.data;
                    if (base64Data) {
                      const decodedData = atob(base64Data);
                      const parser = new DOMParser();
                      const xmlData = parser.parseFromString(decodedData, "application/xml");
                      const xmlString = new XMLSerializer().serializeToString(xmlData);
                      const xmlStringify = JSON.stringify(xmlString, null, 2)
                      console.log("xmlData", xmlStringify);
                      Session.set("docXMLModalData", xmlStringify);
                      Session.set("isFindingDoc", false);
                      Session.set("showXMLModal", true);
                      $('#saveResourceModal').modal('show');
                      return xmlStringify
                    }
                } else {
                    Session.set("isFindingDoc", false);
                    Session.set("emptyXmlData", true);
                    $('#saveResourceModal').modal('show');
                }
            }
        )
    }).catch((error) => {

    });

}

Template.currentPatient.onCreated(function currentPatientOnCreated() {
    Session.set("isFindingDoc", false);
    Session.set("filterCount", "10");
});

Template.currentPatient.onRendered( function (){
    Session.set("executeFinding", false);
    //if patient not selected just return to find patients templates
    if(!Session.get('currentPatientSelected')){
        FlowRouter.redirect('/find-patient');
    }
});

Template.currentPatient.helpers({
    destSystemName() {
        if(Session.get('isActive') === 'local'){
            return 'Remote EMR';
        }
        return 'My EMR';

    },
    currentPatientSelected() {
        return Session.get("currentPatientSelected");
    },
    isFindingDoc() {
        return Session.get("isFindingDoc");
    },
    currentPatientDocs() {
        if(Session.get('isActive') === 'local'){
            return Session.get("getLocalPatientDocs")?.patients;
        } else {
            return Session.get("getPatientDocs")?.patients;
        }
    },
    emptySearchDocs() {
        if(Session.get('isActive') === 'local'){
            return !Session.get("getLocalPatientDocs")?.patients?.length;
        } else {
            return !Session.get("getPatientDocs")?.patients?.length;
        }
    },
    resourceId() {
        return Template.instance().data.resourceId;
    },
    startDate() {
        return Session.get("startDate");
    },
    endDate() {
        return Session.get("endDate");
    },
    searchResult() {
        return Session.get("searchResult");
    },
    executeFinding() {
        return Session.get("executeFinding");
    }
});

Template.currentPatient.events({
    async 'click #textRawDoc' (event, instance) {
        await showPdfModal(this);
    },
    async 'change .inputFindDoc'(event, instance) {
        // Get select element
        const select = event.target;
        // Get selected value
        const value = select?.value;
		console.log("value", value);
        console.log("selectedDoc", this);
		Session.set("selectedDoc", this);
        // Handle based on entry and value
        if(value === 'FHIR') {
            logHelpers.logAction("FHIR", "User Viewed the FHIR Resource");
			const data = JSON.stringify(this, null, 2);

			Session.set("fhirDocModalData", data);
            Session.set("showDocFhirModal", true);
			console.log('Viewing details for:', this);
			
		  $('#saveResourceModal').modal('show');
        } else if(value === 'save-resource') {
            logHelpers.logAction("Save-Resource", "User Click on 'Save Resource'");
            // check that opposite system patient selected/exists or not
            let patientDetails;
            if(Session.get('isActive') === 'local'){
                patientDetails = Session.get('activeRemotePatient');
            } else {
                patientDetails = Session.get('activeLocalPatient');
            }
            if(!patientDetails){
                alert('Please Select the patient for local system');
                return;
            }

            //Extra Checks added as per ticket #186882040
            const res = await resourceHelpers.matchPatientDetails();
            if(!res){
                return;
            }
			Session.set("showDocSaveModal", true);
			Session.set("saveDocModalData", this.text.div);
            resourceHelpers.openActiveResourceModal('Save');
        } else if (value === "Show PDF") {
            logHelpers.logAction("Show-PDF", "User Viewed the PDF Resource");
            showPdfModal(this);
        } else if (value === "Show XML") {
            logHelpers.logAction("Show-XML", "User Viewed the XML Resource");
          showXmlModal(this);
        
        }
        
    
    },
    'click .btn-show-search-doc-modal' (event, instance) {
        resourceHelpers.openActiveResourceModal('Search');
        // $("#SearchResourceModal").modal("show");
    }
});
