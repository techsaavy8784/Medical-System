import "./findPatient.html";
import '/imports/ui/common/fhirModal/fhirModal';
import './savePatientModal/savePatientModal';
import './searchPatientModal/searchPatientModal';

import { Template } from "meteor/templating";
import { ReactiveVar } from "meteor/reactive-var";
import { Session } from "meteor/session";
import { Router } from "meteor/iron:router";
import { Meteor } from "meteor/meteor";
import { alertHelpers } from "/imports/helpers/alertHelpers";
import { patientHelpers } from "/imports/helpers/patientHelpers";


Template.findPatient.onCreated(function findPatientOnCreated() {
	this.headers = new ReactiveVar("");
	Session.set("isLastName", false);
});

Template.findPatient.helpers({
	headers() {
		return Session.get("headers");
	},
	remoteSavedData() {
		return Session.get("remoteSavedData")?.patients;
	},
	localSavedData() {
		return Session.get("localSavedData")?.patients;
	},
	isFindLoading() {
		return Session.get("isFindLoading");
	},
	isActive() {
		return Session.get("isActive") === "remote";
	},
	searchPatientQuery() {
		if (Session.get("isActive") === "remote") {
			return Session.get("remoteSavedData")?.query;
		} else {
			return Session.get("localSavedData")?.query;
		}
	},
	getActiveLocalPatient() {
		return Session.get("currentPatientID") === this?.resource?.id;

	},
	getActiveRemotePatient() {
		return Session.get("currentPatientID") === this?.resource?.id;
	}
})

Template.findPatient.events({
	'change .inputFindPatient'(event, instance) {
		// Get select element
		const select = event.target;
		// Get selected value
		const value = select.value;
		console.log("value", value);
		console.log("click---", this);
		Session.set("selectedPatientInfo", this);
		Session.set("patientMrn", this.resource.id);
		Session.set("fhirModalData", this.resource.text.div);
		// Handle based on entry and value

		if(value === 'View FHIR') {
			const data = JSON.stringify(this, null, 2)
			Session.set("fhirModalData", data);
			console.log('Viewing details for:', this);

			$('#fhirModal').modal('show');
		} else if(value === 'Save Patient') {
			console.log('Viewing details for:', this.resource);

			$('#savePatientModal').modal('show');
		} else if (value === 'Show Resource') {
			$('#showResourceModal').modal('show');
		}
	},
	'change input[name="select-patient"], click .textRawPatient' (event, instance) {
		//below is the patient on which user clicked
		let patient = this;

		//now call the setActivePatient
		console.group('SetActivePatientCall');
		console.group('serverCall');
		let { resource } = patient;
		let coreURL = Session.get("coreURL");
		const url = Session.get("coreURL") + "ActivePatient";
		let body = {
			resourceType : "Patient",
			destSystemId: coreURL,
			srcResource: resource
		}
		console.log('calling method vs url', url)
		console.log('and body is', body)

		//get the user Active token from session
		const token = Session.get("headers");

		try {
			alertHelpers.showLoading();
			Meteor.call('setActivePatient', url, body, {Authorization: token}, (error, result) => {
				alertHelpers.stopLoading();
				console.group('serverResponse');
				if (error) {
					console.log("error", error);
					const errorInfo = error?.reason?.response?.data
					alert("ERROR !" + errorInfo?.resourceType + "\n" + errorInfo?.issue[0]?.details?.text)
				} else {
					console.log("result: ", result)
					Session.set('currentPatientInfo', result?.data);
					let { patientMRN, patientId, patientSummary, patientName, patientDOB} = result?.data;
					let activePatient = result?.data?.patient;
					let summaryRecord = {
						data: activePatient,
						patientId,
						patientName: patientName,
						patientDOB,
						patientMRN,
						patientSummary: patientSummary?.replaceAll(';', " -")
					}
					if(Session.get("isActive") === "local"){
						Session.set("activeLocalPatient", summaryRecord);
					} else {
						Session.set("activeRemotePatient", summaryRecord);
					}

					//save both (remote/local) Session values to display both at once
					if(Session.get('isActive') === 'local'){
						patientHelpers.setActiveLocalPatient(activePatient);
					} else {
						patientHelpers.setActiveRemotePatient(activePatient);
					}
					const route = `/current-patient/${activePatient.id}`
					Router.go(route)
				}
			});
			console.groupEnd();
		} catch (error) {
			console.log(error)
			alertHelpers.supportAlert();
		}
	},

	'click .btn-show-search-modal' (event, instance) {
		$('#searchPatientModal').modal('show');
	},
});
