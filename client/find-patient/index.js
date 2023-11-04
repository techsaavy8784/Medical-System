import "./findPatient.html"

import { Template } from "meteor/templating"
import { Meteor } from "meteor/meteor"
import { ReactiveVar } from "meteor/reactive-var"
import { Session } from "meteor/session"
// import { Tracker } from "meteor/tracker"

Template.findPatient.onCreated(function loginOnCreated() {
	this.searchLastName = new ReactiveVar("")
	this.searchFirstName = new ReactiveVar("")
	this.searchDate = new ReactiveVar("")
	this.searchEncounter = new ReactiveVar("")
	this.headers = new ReactiveVar("")
	this.resultPatients = new ReactiveVar("")
	this.isFindLoading = new ReactiveVar(false)
    // this.isActive = new ReactiveVar("")
    
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
    // resultPatients() {
    //     return Template.instance().resultPatients.get();
    // },
	isFindLoading() {
		return Template.instance().isFindLoading.get()
	},
    isActive() {
        return Session.get("isActive") === "hospital";
    }
})

// Tracker.autorun(() => {
    
  
//     if (Template.instance().findPatientHos.get()) {
//     //   Session.set('oldest', oldest.name);
        
//     }
//   });

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
	"change #inputState": function (event, data) {
		// event.target.value contains selected value
		console.log("Selection changed to: " + event.target.value)

		console.log("Selection changed to: " + data)
		// handle change here
	},
})
