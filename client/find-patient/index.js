import "./findPatient.html"

import { Template } from "meteor/templating"
import { Meteor } from "meteor/meteor"
import { ReactiveVar } from "meteor/reactive-var"
import { Session } from "meteor/session"
import { Router } from "meteor/iron:router"
import {generateUniqueId} from "../utils/patientID"

Template.findPatient.onCreated(function findPatientOnCreated() {
	this.searchLastName = new ReactiveVar("")
	this.searchFirstName = new ReactiveVar("")
	this.searchDate = new ReactiveVar("")
	this.searchEncounter = new ReactiveVar("")
	this.headers = new ReactiveVar("")
	this.resultPatients = new ReactiveVar("")
	this.isFindLoading = new ReactiveVar(false);
	Session.set("isLastName", false)
});


Template.findPatient.helpers({
	headers() {
		return Session.get("headers")
	},
	findPatientHos() {
		return Session.get("findPatientHos")?.patients
	},
	findPatientPra() {
		return Session.get("findPatientPra")?.patients
	},
	isFindLoading() {
		return Template.instance().isFindLoading.get()
	},
    isActive() {
        return Session.get("isActive") === "hospital";
    },
	isLastName() {
		return Session.get("isLastName")
	},
})


Template.findPatient.events({
	async "submit .search-patient-form"(event, instance) {
		event.preventDefault()
		const target = event.target
		const lastName = target.lastName.value.toLowerCase()
		const firstName = target.firstName.value.toLowerCase()
		const birthday = target.birthday.value;

		if (!(lastName || firstName)) {
			return
		}

		instance.isFindLoading.set(true)
		const isActive = Session.get("isActive")
		const facility = Session.get("facilities")[0]
		const practice = Session.get("practices")[0]
		const authToken = Session.get("headers")
		const coreUrl = () => {
			if (isActive === "hospital") {
				return facility.systems[0].coreUrl
			} else {
				return practice.systems[0].coreUrl
			}
		}

		const buildQuery = () => {
			if (lastName && firstName) {
				if (!!birthday) {
					return `Patient?family=${lastName}&given=${firstName}&birthdate=${birthday}`
				} else {
					return `Patient?family=${lastName}&given=${firstName}`
				}
			} else {
				if (!!birthday) {
					return `Patient?family=${lastName}&birthdate=${birthday}`
				} else {
					return `Patient?family=${lastName}`
				}
			}
		}

		const getFindPatients = async (coreUrl, query, headers) => {
			return new Promise(function (resolver, reject) {
				console.log("find-patientURL", `${coreUrl}${query}`);
				Meteor.call(
					"patientTestQuery",
					`${coreUrl}/${query}`,
					headers,
					(error, result) => {
						if (error) {
							console.log("errorFinding", error)
							reject(error)
						} else {
							if (result.status === 200) {
								resolver(result)
							}
						}
					}
				)
			}).catch((error) => {
				// show error on screen
                Session.set("findPatientPra", null)
				// instance.isFindLoading.set(false)
				// alert("Error: " + "resourceType: " + JSON.stringify(error.message))
				// alert("Error: " + "There is no Search Result")
                
			})
		}
		const res = await getFindPatients(coreUrl(), buildQuery(), {
			Authorization: authToken,
		})
		console.log("res", res)
        
		instance.isFindLoading.set(false)
		if (isActive === "hospital") {
            if (res) {
                Session.set("findPatientHos", {
                    patients: res.bundle.entry,
                    cache: {
                        id: res.queryId,
                        pageNumber: res.pageNumber,
                        totalPages: res.pageNumber,
                        countInPage: res.countInPage,
                    },
                })
            } else {
                Session.set("findPatientHos", null)
            }
		}  else {
            
            if (res) {
            Session.set("findPatientPra", {
                patients: res.bundle.entry,
                cache: {
                    id: res.queryId,
    
                    pageNumber: res.pageNumber,
                    totalPages: res.pageNumber,
                    countInPage: res.countInPage,
                },
            })
            } else {
                Session.set("findPatientPra", null)
            }
		}
        
		return false
	},
    'click .reset': function (event, instance) {
		event.preventDefault()
        Session.set("findPatientHos", null)
        Session.set("findPatientPra", null)
		Session.set("isLastName", false);
		instance.find('#findLastName').value = '';
		instance.find('#findFirstName').value = '';
		instance.find('[name="birthday"]').value = '';
		instance.find('#findEncounter').value = '';
    },
    'change .inputFindPatient'(event, instance) {
        // Get select element
        const select = event.target;
        // Get selected value
        const value = select.value;
		console.log("value", value);
		console.log("click---", this);
		Session.set("selectedPatientInfo", this);
        // Handle based on entry and value
        if(value === 'View FHIR') {
			const data = JSON.stringify(this, null, 2)
			Session.set("fhirModalData", data);
			console.log('Viewing details for:', this);
			
		  $('#searchPatientFhirModal').modal('show');
        } else if(value === 'Save in Practice') {
			// const data = JSON.stringify(this.resource)
			Session.set("showSaveModal", true);
			Session.set("fhirModalData", this.resource.text.div);
			console.log('Viewing details for:', this.resource);
			
		  $('#searchPatientFhirModal').modal('show');
        }
      },
	'click .textRawPatient' (event, instance) {
		const currentPatient = "Patient: " + this.resource?.name[0]?.text + " - MRN: " + this.resource?.id;
		Session.set("currentPatientInfo", currentPatient);
		Session.set("currentPatientID", this.resource.id);
		Session.set("currentPatientName", this.resource?.name[0]?.text);
		const route = `/current-patient/${this.resource.id}`
    	Router.go(route)
	},
	'input #findLastName'(event, template) {
		const lastName = event.target.value;
		// Do something with the new value
		if (!!lastName) {
			Session.set("isLastName", true);
		} else {
			Session.set("isLastName", false);
		}
	},
})


Template.searchPatientFhirModal.helpers({
	fhirModalData() {
		return Session.get("fhirModalData");
	},
	showSaveModal() {
		return Session.get("showSaveModal");
	},
})


Template.searchPatientFhirModal.events({
	async 'click .fhir-data-save'(event, instance) {
        event.preventDefault();
		const canSave = Session.get("showSaveModal");
		// const url = Session.get("coreURL").replace("30300", "30100") + "Patient";
		const url = Session.get("coreURL") + "Patient";
		// const patientId = Session.get("currentPatientID");
		const patientId = generateUniqueId(5);
		// const resourceId = 
		const patientName = Session.get("selectedPatientInfo").resource.name[0].text;
		const destSystemId = Session.get("practices")[0].systems[0].id;
		// const srcSystemId = Session.get("facilities")[0].systems[0].id;
		const srcResource = Session.get("selectedPatientInfo").resource;
		// const patientName = Session.get("selectedPatientInfo").resource?.name[0]?.text;

		const body = {
			"ResourceType": "Patient",
			"DestPatientId": patientId,
			"destSystemId": destSystemId,
			"SrcResource": srcResource
		}

		// const body = {
		// 	"resourceType": "DiagnosticReport",
		// 	"destPatientId": patientId,
        //     "destPatientName": patientName,
		// 	"destSystemId": destSystemId,
        //     "srcResourceId": "197369077",
		// 	"SrcResource": srcResource
		// }

		console.log("payload", body);
		const token = Session.get("headers");
		if (canSave) {
			console.log("save button is clicked.")
			Meteor.call('savePatientResource', url, body, {Authorization: token}, (error, result) => {
				if (error) {
				  console.log("error", error);
				  alert("ERROR !" + error?.reason.response?.data?.issue[0].details.text)
				} else {
					console.log("result: ", result)
					alert("Success saving patient: " + result?.data?.issue[0].details.text)
				}
			  });
		}
    }
});



Template.searchPatientFhirModal.onRendered(function() {
	const modalElement = this.find('#searchPatientFhirModal');
	
	const instance = this;
	const parentInstance = instance.view.parentView.templateInstance();
	$(modalElement).on('hidden.bs.modal', function (event) {
    	const selectElement = parentInstance.find('.inputFindPatient');
	  $(selectElement).val('Select an Option');
		Session.set("showSaveModal", false);
		console.log("modal is hidden.")
	});
  });