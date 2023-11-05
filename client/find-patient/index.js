import "./findPatient.html"

import { Template } from "meteor/templating"
import { Meteor } from "meteor/meteor"
import { ReactiveVar } from "meteor/reactive-var"
import { Session } from "meteor/session"
import { Router } from "meteor/iron:router"
// import { Tracker } from "meteor/tracker"

Template.findPatient.onCreated(function findPatientOnCreated() {
	this.searchLastName = new ReactiveVar("")
	this.searchFirstName = new ReactiveVar("")
	this.searchDate = new ReactiveVar("")
	this.searchEncounter = new ReactiveVar("")
	this.headers = new ReactiveVar("")
	this.resultPatients = new ReactiveVar("")
	this.isFindLoading = new ReactiveVar(false)
})


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
})


Template.searchPatientFhirModal.helpers({
	fhirModalData() {
		return Session.get("fhirModalData");
	},
	showSaveModal() {
		return Session.get("showSaveModal");
	}
})

Template.findPatient.events({
	async "submit .search-patient-form"(event, instance) {
		event.preventDefault()
		const target = event.target
		const lastName = target.lastName.value.toLowerCase()
		const firstName = target.firstName.value.toLowerCase()

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
				return `Patient?family=${lastName}&given=${firstName}`
			} else {
				return `Patient?family=${lastName}`
			}
		}

		const getFindPatients = async (coreUrl, query, headers) => {
			return new Promise(function (resolver, reject) {
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
				instance.isFindLoading.set(false)
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
    'click reset': function () {
        console.log("click reset-------")
        Session.set("findPatientHos", null)
        Session.set("findPatientPra", null)
    },
    'change .inputFindPatient'(event, instance) {
        // Get select element
        const select = event.target;
        // Get selected value
        const value = select.value;
		console.log("value", value);
		
        // Handle based on entry and value
        if(value === 'View FHIR') {
			const data = JSON.stringify(this.resource)

			Session.set("fhirModalData", data);
			console.log('Viewing details for:', this.resource);
			
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
		console.log("textRawPatient", `Patient: ${this.resource?.name[0]?.text} - MRN:${this.resource?.id}`)
		const currentPatient = "Patient: " + this.resource?.name[0]?.text + "MRN: " + this.resource?.id;
		Session.set("currentPatientInfo", currentPatient);
		Session.set("currentPatientID", this.resource.id);
    	Router.go('/current-patient')
	}
})


Template.searchPatientFhirModal.onRendered(function() {
	const modalElement = this.find('#searchPatientFhirModal');
	
	const instance = this;
	const parentInstance = instance.view.parentView.templateInstance();
	$(modalElement).on('hidden.bs.modal', function (event) {
    	const selectElement = parentInstance.find('#inputFindPatient');
	  $(selectElement).val('Select an Option');
		Session.set("showSaveModal", false);

	});
  });