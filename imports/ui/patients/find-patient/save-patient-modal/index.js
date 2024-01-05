import "./saveModal.html";

import { Template } from "meteor/templating";
import { Meteor } from "meteor/meteor";
import { Session } from "meteor/session";
import { Router } from "meteor/iron:router";

Template.savePatientModal.onRendered(function() {
	const savePatientModal = this.find('#savePatientModal');
	const instance = this;
	const parentInstance = instance.view.parentView.templateInstance();

	$(savePatientModal).on('hidden.bs.modal', function (event) {

		const selectElements = parentInstance.findAll('.inputFindPatient');
		selectElements.forEach(function(selectElement) {
			$(selectElement).val('Select an Option');
		});
		instance.find("#patientMRN").value = "";

		event.preventDefault();
	});

})

Template.savePatientModal.helpers({
	patientMrn() {
		return Session.get("patientMrn");
	},
	fhirModalData() {
		return Session.get("fhirModalData");
	},
})

Template.savePatientModal.events({
	async 'click .btn-save-patient'(event, instance) {
        event.preventDefault();
		const inputMrn = instance.find('#patientMRN').value;
		const url = Session.get("coreURL") + "Patient";
		const destSystemId = Session.get("practices")[0].systems[0].id;
		const srcResource = Session.get("selectedPatientInfo").resource;

		const body = {
			"ResourceType": "Patient",
			"DestPatientId": inputMrn,
			"destSystemId": destSystemId,
			"SrcResource": srcResource
		}

		console.log("url", url);
		console.log("payload", body);
		const token = Session.get("headers");

		console.log("save button is clicked.");

		Meteor.call('savePatientResource', url, body, {Authorization: token}, (error, result) => {
			if (error) {
				console.log("error", error);
				if (error.reason?.statusCode === "406" || error.reason?.code === "ECONNRESET") {
					alert("Your session has expired, please login");
					Session.set("isLogin", false)
					Session.set("isFindLoading", false)

					Router.go("/login");
					return ;
				}
				const errorInfo = error?.reason?.response?.data
				alert(errorInfo?.issue[0]?.details?.text)
			} else {
				console.log("result: ", result)
				if (result.statusCode === 201) {
					const practiceName = Session.get("practices")[0]?.displayName
					alert(`Patient successfully imported to ${practiceName}`)
				} else if (result.statusCode === 401) {
					alert("Your session has expired, please login");
					Router.go("/login")
				}
			}
		});
    },
});

