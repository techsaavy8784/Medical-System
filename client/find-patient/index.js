import "./findPatient.html"

import { Template } from "meteor/templating"
import { Meteor } from "meteor/meteor"
import { ReactiveVar } from "meteor/reactive-var"
import { Session } from "meteor/session"
import { Router } from "meteor/iron:router"
import {generateUniqueId} from "../utils/patientID"


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
					if (error.error?.response?.statusCode === 401) {
						alert("Your session has expired, please login");
						Session.set("isLogin", false)
						Session.set("isFindLoading", false)

						Router.go("/login");
					}
					Session.set("isFindLoading", false)
					// reject(error)
					return error;
				} else {
					console.log("success: ", result)
					if (Session.get("isActive") === "hospital") {
						if (result.status === 200 && result.message === " No resources found") {
							
							resolver(result)
						} else {
							resolver(result)
						}
					} else {
						if (result.statusCode === 404) {
							resolver(result)

						} else {
							resolver(result)
						}
					}
					Session.set("isFindLoading", false)
				}
			}
		)
	}).catch((error) => {
		console.log("errorFinding", error)
		// Session.set("findPatientPra", null)
	})
}


Template.findPatient.onCreated(function findPatientOnCreated() {
	this.searchLastName = new ReactiveVar("")
	this.searchFirstName = new ReactiveVar("")
	this.searchDate = new ReactiveVar("")
	this.searchEncounter = new ReactiveVar("")
	this.headers = new ReactiveVar("")
	this.resultPatients = new ReactiveVar("")
	Session.set("isLastName", false)
});

Template.findPatient.helpers({
	headers() {
		return Session.get("headers")
	},
	findPatientHos() {
		// console.log("findPatientHos Patients", Session.get("findPatientHos")?.patients);
		return Session.get("findPatientHos")?.patients
	},
	findPatientPra() {
		return Session.get("findPatientPra")?.patients
	},
	isFindLoading() {
		return Session.get("isFindLoading")
	},
    isActive() {
        return Session.get("isActive") === "hospital";
    },
	searchPatientQuery() {
		return Session.get("searchPatientQuery");
	},
	// patientsEmpty() {
	// 	if (Session.get("isActive") === "hospital") {
	// 		return (!!Session.get("findPatientHos")?.patients);
	// 	} else if (Session.get("isActive") === "hospital") {
	// 		return (!!Session.get("findPatientPra")?.patients);
	// 	}
	// }
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
			// const data = JSON.stringify(this.resource)
			console.log('Viewing details for:', this.resource);
			
		  	$('#savePatientModal').modal('show');
        } else if (value === 'Show Resource') {
			$('#showResourceModal').modal('show');
		}
		// else if (value === 'Save to MyEMR') {
		// 	console.log("show Save Resource Modal");
		// 	$('#saveResourceModal').modal('show');
		// }
      },
	'click .textRawPatient' (event, instance) {
		const currentPatient = "Patient: " + this.resource?.name[0]?.text + " - MRN: " + this.resource?.id;
		Session.set("currentPatientInfo", currentPatient);
		Session.set("currentPatientData", this);
		Session.set("currentPatientID", this.resource.id);
		Session.set("currentPatientName", this.resource?.name[0]?.text);
		const route = `/current-patient/${this.resource.id}`
    	Router.go(route)
	},
	'click .btn-show-search-modal' (event, instance) {
		$('#searchPatientModal').modal('show');
	}
});

Template.searchPatientModal.onCreated( function searchModalOnCreated(){
	this.patientMrn = new ReactiveVar("");
	this.patientId = new ReactiveVar("");
	this.isValue = new ReactiveVar("");

})

Template.searchPatientModal.helpers({
	isLastName() {
		return Session.get("isLastName")
	},
	isUnique() {
		const isUnique = !!Template.instance().patientMrn.get() || !!Template.instance().patientId.get();
		return isUnique ? true : false;
	},
	isMrn() {
		return !!Template.instance().patientMrn.get()
	},
	isId() {
		return !!Template.instance().patientId.get()
	},
	canInputMrn() {
		const inputValid = !!Template.instance().patientId.get() || !!Session.get("isLastName")
		return !inputValid;
	},
	canInputId() {
		const inputValid = !!Template.instance().patientMrn.get() || !!Session.get("isLastName")
		return !inputValid;
	}
});


Template.searchPatientModal.events({
	
	async "submit .search-patient-form"(event, instance) {
		event.preventDefault()
		$('#searchPatientModal').modal('hide');

		const target = event.target
		const lastName = target.lastName.value.toLowerCase()
		const firstName = target.firstName.value.toLowerCase()
		const birthday = target.birthday.value;
		
		if (!(lastName || firstName)) {
			return
		}

		Session.set("isFindLoading", true)
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
					const searchPatientQuery = `family=${lastName}&given=${firstName}&birthdate=${birthday}`;
					Session.set("searchPatientQuery", searchPatientQuery)
					return `Patient?${searchPatientQuery}`
				} else {
					const searchPatientQuery = `family=${lastName}&given=${firstName}`;
					Session.set("searchPatientQuery", searchPatientQuery)
					return `Patient?${searchPatientQuery}`
				}
			} else {
				if (!!birthday) {
					const searchPatientQuery = `Patient?family=${lastName}&birthdate=${birthday}`
					Session.set("searchPatientQuery", searchPatientQuery)
					return `Patient?${searchPatientQuery}`
				} else {
					const searchPatientQuery = `family=${lastName}`
					Session.set("searchPatientQuery", searchPatientQuery)
					return `Patient?${searchPatientQuery}`
				}
			}
		}


		const res = await getFindPatients(coreUrl(), buildQuery(), {
			Authorization: authToken,
		})
		console.log("res", res)
        
		Session.set("isFindLoading", false)

		if (!res.bundle?.entry?.length === true) {
			$('#searchPatientModal').modal('show');
		}

		if (isActive === "hospital") {
            if (res.bundle) {
                Session.set("findPatientHos", {
                    patients: res.bundle?.entry,
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
            
            if (res.bundle) {
            Session.set("findPatientPra", {
                patients: res.bundle?.entry,
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
		instance.find('#patient-mrn').value = '';
    },
	'input #findLastName'(event, instance) {
		const lastName = event.target.value;
		// Do something with the new value
		if (!!lastName) {
			Session.set("isLastName", true);
		} else {
			Session.set("isLastName", false);
		}
	},
	'input #patient-mrn'(event, instance) {
		const patientMrn = event.target.value;
		if (!!patientMrn) {
			instance.patientMrn.set(patientMrn);
		} else {
			instance.patientMrn.set("");
		}
	},
	'input #patient-id'(event, instance) {
		const patientId = event.target.value;
		if (!!patientId) {
			instance.patientId.set(patientId);
		} else {
			instance.patientId.set("");
		}
	},
	'input #findFirstName'(event, instance) {
		const firstName = event.target.value;
		
		if (!!firstName) {
			instance.isValue.set(firstName);
		} else {
			instance.isValue.set("");
		}
	},
	'input #birthday'(event, instance) {
		const birthDay = event.target.value;
		if (!!birthDay) {
			instance.isValue.set(birthDay);
		} else {
			instance.isValue.set("");
		}
	}
})


Template.searchPatientModal.onRendered(function () {
	
	// const inputField = this.find('#primary-key');
	// console.log("inputField", inputField);
	// inputField.focus();
	// $('input').focus()
	$('#primary-key').focus();	

	const searchPatientModal = this.find('#searchPatientModal');

  $(searchPatientModal).on('shown.bs.modal', function (event) {
    $('#primary-key').focus();
  });

	$(searchPatientModal).on('hidden.bs.modal', function (event) {
		// form.reset();
	});
})


Template.searchPatientFhirModal.helpers({
	fhirModalData() {
		return Session.get("fhirModalData");
	},
})


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


  Template.savePatientModal.events({
	async 'click .btn-save-patient'(event, instance) {
        event.preventDefault();
		const inputMrn = instance.find('#patientMRN').value;
		// const patientId = Session.get("selectedPatientInfo")?.resource?.id;
		// console.log("inputMrn", inputMrn)
		// console.log("patientId", patientId)
		// if (inputMrn != patientId) {
		// 	event.preventDefault();
			
		// 	alert("Input patient's MRN again!");
		// 	$('#savePatientModal').modal('show');
		// 	return;
		// }
		// const url = Session.get("coreURL").replace("30300", "30100") + "Patient";
		const url = Session.get("coreURL") + "Patient";
		// const patientId = generateUniqueId(5);
		// const resourceId =  
		const destSystemId = Session.get("practices")[0].systems[0].id;
		// const srcSystemId = Session.get("facilities")[0].systems[0].id;
		const srcResource = Session.get("selectedPatientInfo").resource;
		// const patientName = Session.get("selectedPatientInfo").resource?.name[0]?.text;

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
					alert(`Patient successfully imported to your ${practiceName}`)
				} else if (result.statusCode === 401) {
					alert("Your session has expired, please login");
					Router.go("/login")
				}
			}
		});
    },
});

Template.savePatientModal.helpers({
	patientMrn() {
		return Session.get("patientMrn");
	},
	fhirModalData() {
		return Session.get("fhirModalData");
	},
})

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

// Template.showResourceModal.onRendered(function() {
// 	const showResourceModal = this.find('#showResourceModal');
// 	const instance = this;
// 	const parentInstance = instance.view.parentView.templateInstance();


// 	$(showResourceModal).on('hidden.bs.modal', function (event) {
		
// 		const selectElements = parentInstance.findAll('.inputFindPatient');
// 		selectElements.forEach(function(selectElement) {
// 		$(selectElement).val('Select an Option');
// 		});
// 	});

//   });

//   Template.showResourceModal.helpers({
// 	// fhirModalData() {
// 	// 	return Session.get("fhirModalData")
// 	// },
// 	selectedPatientMRN() {
// 		return Session.get("selectedPatientInfo")?.resource?.id;
// 		// return Session.get("practices")[0].systems[0].id;
// 	},
// 	selectedPatientID() {
// 		return Session.get("selectedPatientInfo")?.resource?.name[0]?.id;
// 		// return Session.get("selectedPatientInfo")?.resource?.id;
// 	},
// 	selectedPatientFamily() {
// 		return Session.get("selectedPatientInfo")?.resource?.name[0]?.family;
// 	},
// 	selectedPatientGiven(){
// 		return Session.get("selectedPatientInfo")?.resource?.name[0]?.given[0];
// 	},
// 	selectedPatientDOB() {
// 		const date = Session.get("selectedPatientInfo")?.resource?.birthDate;
// 		return date ? date : ""
// 	}
//   });
