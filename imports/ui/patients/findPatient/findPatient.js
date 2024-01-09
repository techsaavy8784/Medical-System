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


Template.findPatient.onCreated(function findPatientOnCreated() {
	this.headers = new ReactiveVar("");
	Session.set("isLastName", false);
});

Template.findPatient.helpers({
	headers() {
		return Session.get("headers");
	},
	findPatientHos() {
		return Session.get("findPatientHos")?.patients;
	},
	findPatientPra() {
		return Session.get("findPatientPra")?.patients;
	},
	isFindLoading() {
		return Session.get("isFindLoading");
	},
	isActive() {
		return Session.get("isActive") === "hospital";
	},
	searchPatientQuery() {
		if (Session.get("isActive") === "hospital") {
			return Session.get("findPatientHos")?.query;
		} else {
			return Session.get("findPatientPra")?.query;
		}
	},
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
	'click .textRawPatient' (event, instance) {
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
					let activePatient = result.data.patient;
					const currentPatient = "Patient: ID: "+ this.resource.id + " " + this.resource?.name[0]?.text + " - DOB: " + this.resource?.birthDate;
					const patientDisplaySummary = "Patient: ID: "+ activePatient.id + " " + activePatient?.name[0]?.text + " - DOB: " + activePatient?.birthDate;

					//	oldCode start
					// TODO refactor it when setActivePatient is done
					Session.set("currentPatientInfo", patientDisplaySummary);
					Session.set("currentPatientData", this);
					Session.set("currentPatientID", activePatient.id);
					Session.set("currentPatienDOB", activePatient?.DOB);
					Session.set("currentPatientName", activePatient?.name[0]?.text);
					const route = `/current-patient/${activePatient.id}`
					Router.go(route)
					Session.set("selectedPatientInfo", this);
					Session.set("patientMrn", activePatient.id);
					Session.set("fhirModalData", activePatient.text.div);
					//	oldCode ENd
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
