import "./searchModal.html"

import { Template } from "meteor/templating"
import { Meteor } from "meteor/meteor"
import { ReactiveVar } from "meteor/reactive-var"
import { Session } from "meteor/session"
import { Router } from "meteor/iron:router"


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
					reject(error)
					// return error;
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
		const id = target.patientId.value;
		
		if (!(lastName || firstName)) {
			return
		}

		Session.set("isFindLoading", true)
		const isActive = Session.get("isActive")
		const authToken = Session.get("headers")
		const facility = Session.get("facilities")[0]
		const practice = Session.get("practices")[0]
		const coreUrl = () => {
			if (isActive === "hospital") {
				return facility.systems[0].coreUrl
			} else {
				return practice.systems[0].coreUrl
			}
		}
		let searchPatientQuery = "";
		const buildQuery = () => {
			if (id) {
				return `Patient?_id=${id}`
			} else {
				if (lastName && firstName) {
				   if (!!birthday) {
					   searchPatientQuery = `family=${lastName}&given=${firstName}&birthdate=${birthday}`;
					   
					   return `Patient?${searchPatientQuery}`
				   } else {
					   searchPatientQuery = `family=${lastName}&given=${firstName}`;
					   
					   return `Patient?${searchPatientQuery}`
				   }
			   } else {
				   if (!!birthday) {
					   searchPatientQuery = `Patient?family=${lastName}&birthdate=${birthday}`
					   
					   return `Patient?${searchPatientQuery}`
				   } else {
					   searchPatientQuery = `family=${lastName}`
					   
					   return `Patient?${searchPatientQuery}`
				   }
			   }
			}
		}

		const res = await getFindPatients(coreUrl(), buildQuery(), {
			Authorization: authToken,
		})
		console.log("res", res)
        
		Session.set("isFindLoading", false)

		if (!res.bundle?.entry?.length === true) {
			console.log("res", true)
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
					query: searchPatientQuery
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
				query: searchPatientQuery,
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
	
	// const inputField = this.find('#patient-id');
	// console.log("inputField", inputField);
	// inputField.focus();
	// $('input').focus()
	$('#patient-id').focus();

	const searchPatientModal = this.find('#searchPatientModal');

  $(searchPatientModal).on('shown.bs.modal', function (event) {
    $('#patient-id').focus();
  });

	$(searchPatientModal).on('hidden.bs.modal', function (event) {
		// form.reset();
	});
})