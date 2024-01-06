import './displayResourceModal.html'

import { Template } from "meteor/templating"
import { Session } from "meteor/session"
import { Meteor } from "meteor/meteor"


Template.resourceDocModal.onCreated(function resourceOnCreated(){
    Session.set("showDocSaveModal", false);
    Session.set("showDocFhirModal", false);
    Session.set("showXMLModal", false);
})

  Template.resourceDocModal.events({
    async 'click .save-doc-data'(event, instance) {
        event.preventDefault();
        const canSave = Session.get("showDocSaveModal");
        const url = Session.get("coreURL") + "Patient";
        const patientId = Session.get("currentPatientID");
        const patientName = Session.get("currentPatientName");
        const resourceType = Session.get("resourceType");
		const destSystemId = Session.get("practices")[0].systems[0].id;
        const srcResource = Session.get("selectedDoc").resource;
        const srcResourceId = Session.get("selectedDoc").resource.id;
		const body = {
			"resourceType": resourceType,
			"destPatientId": patientId,
            "destPatientName": patientName,
			"destSystemId": destSystemId,
            "srcResourceId": srcResourceId,
			"SrcResource": srcResource
		}
        console.log("payload", body);
		const token = Session.get("headers");
        if (canSave) {
			console.log("save button is clicked.")
			Meteor.call('savePatientResource', url, body, {Authorization: token}, (error, result) => {
				if (error) {
				  console.log("error", error);
                  const errorInfo = error?.reason.response?.data
				  alert("ERROR !" + errorInfo.resourceType + "\n" + errorInfo.issue[0]?.details?.text)
				} else {
					console.log("result: ", result)
                    const practiceName = Session.get("practices")[0]?.displayName
					alert(`Resource successfully imported to your ${practiceName}`)
				}
			  });
		}
    }
})

  Template.resourceDocModal.helpers({
    showDocSaveModal() {
        return Session.get("showDocSaveModal")
    },
    saveDocModalData() {
        return Session.get("saveDocModalData")
    },
    showDocFhirModal() {
        return Session.get("showDocFhirModal")
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
    }
  })

  Template.resourceDocModal.onRendered( function () {
	const modalElement = this.find('#resourceDocModal');
	
	const instance = this;
	const parentInstance = instance.view.parentView.templateInstance();
	$(modalElement).on('hidden.bs.modal', function (event) {
    	const selectElement = parentInstance.find('.inputFindDoc');
	    $(selectElement).val('Select an Option');

		Session.set("showDocSaveModal", false);
        Session.set("showDocFhirModal", false);
        Session.set("showXMLModal", false);
        
        Session.set("emptyPdfData", false);
        Session.set("emptyXmlData", false);
	});
  });