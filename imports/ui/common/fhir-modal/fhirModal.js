import "./fhirModal.html";

import { Template } from "meteor/templating";
import { Session } from "meteor/session";

Template.searchPatientFhirModal.onRendered(function() {
	const searchFhirModal = this.find('#searchPatientFhirModal');
	const instance = this;
	const parentInstance = instance.view.parentView.templateInstance();

	$(searchFhirModal).on('hidden.bs.modal', function (event) {

		const selectElements = parentInstance.findAll('.inputFindPatient');
		selectElements.forEach(function(selectElement) {
			$(selectElement).val('Select an Option');
		});
	});

});

Template.searchPatientFhirModal.helpers({
	fhirModalData() {
		return Session.get("fhirModalData");
	},
})
