import "./findPatient.html";
import './fhir-modal';
import './save-patient-modal';
import './search-patient-modal';

import { Template } from "meteor/templating";
import { ReactiveVar } from "meteor/reactive-var";
import { Session } from "meteor/session";
import { Router } from "meteor/iron:router";


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
			
		  $('#searchPatientFhirModal').modal('show');
        } else if(value === 'Save Patient') {
			console.log('Viewing details for:', this.resource);
			
		  	$('#savePatientModal').modal('show');
        } else if (value === 'Show Resource') {
			$('#showResourceModal').modal('show');
		}
      },
	  'click .textRawPatient' (event, instance) {
		const currentPatient = "Patient: ID: "+ this.resource.id + " " + this.resource?.name[0]?.text + " - DOB: " + this.resource?.birthDate;
		Session.set("currentPatientInfo", currentPatient);
		Session.set("currentPatientData", this);
		Session.set("currentPatientID", this.resource.id);
		Session.set("currentPatienDOB", this.resource?.DOB);
		Session.set("currentPatientName", this.resource?.name[0]?.text);
		const route = `/current-patient/${this.resource.id}`
    	Router.go(route)
		Session.set("selectedPatientInfo", this);
		Session.set("patientMrn", this.resource.id);
		Session.set("fhirModalData", this.resource.text.div);
		},
		
	
	'click .btn-show-search-modal' (event, instance) {
		$('#searchPatientModal').modal('show');
	},
});
