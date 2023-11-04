import './findPatient.html'

import { Template } from 'meteor/templating'
import { Meteor } from "meteor/meteor"
import { ReactiveVar } from 'meteor/reactive-var';
import { Session } from 'meteor/session';



Template.findPatient.onCreated(function loginOnCreated() {
    this.searchLastName = new ReactiveVar("");
    this.searchFirstName = new ReactiveVar("");
    this.searchDate = new ReactiveVar("");
    this.searchEncounter = new ReactiveVar("");
    this.headers = new ReactiveVar("");
    this.findPatientHos = new ReactiveVar("");
    this.findPatientPra = new ReactiveVar(""); 
    this.isFindLoading = new ReactiveVar(false);
  });
  
  Template.findPatient.helpers({
    headers() {
        return Session.get("headers")
    },
    findPatientHos() {
        return Template.instance().findPatientHos.get();
    },
    findPatientPra() {
        return Template.instance().findPatientPra.get();
    },
    isFindLoading() {
        return Template.instance().isFindLoading.get();
    }
  });
  
  Template.findPatient.events({
    async 'submit .search-patient-form'(event, instance) {
        event.preventDefault();
        const target = event.target;
        const lastName = target.lastName.value.toLowerCase();
        const firstName = target.firstName.value.toLowerCase();
        

        if (!(lastName || firstName )) {
            
            return
        }
        
        instance.isFindLoading.set(true);
        const isActive = Session.get("isActive")
        const facility = Session.get("facilities")[0]
        const practice = Session.get("practices")[0]
        const authToken = Session.get("headers")
        const coreUrl = () => {
            if (isActive === "hospital") {
                return facility.systems[0].coreUrl;
            } else {
                return practice.systems[0].coreUrl;
            }
        }
        
        const buildQuery = () => {

            if (lastName && firstName) {
                return `Patient?family=${lastName}&given=${firstName}`
            } else {
                return `Patient?family=${lastName}`
            }
        }
        const findPatientBody = {
            facility: facility.id,
            fhirSystem: facility.systems[0].id,
            fhirAuthToken: authToken.split(" ")[1]
        }

        const getFindPatients = async (coreUrl, query, headers) => {
            return new Promise(function (resolver, reject) {
                Meteor.call(
                    "patientTestQuery",
                    `${coreUrl}/${query}`,
                    headers,
                    (error, result) => {
                        if (error) {
                            console.log("errorFinding", error);
                            reject(error)
                        } else {
                            if (result.status === 200) {
                                
                                resolver(result)
                            }
                        }
                    }
                );
            });
        };
        const res = await getFindPatients(coreUrl(), buildQuery(), {Authorization: authToken})
        console.log("res", res)
        instance.isFindLoading.set(false);
        Session.set("findPatientHos", {
            patients: res.bundle.entry,
            cache: {
                id: res.queryId,
                pageNumber: res.pageNumber,
                totalPages: res.pageNumber,
                countInPage: res.countInPage,
            }
        });
        // const patients = res.bundle.entry.map((e) => (
        //     e.text.div.replace('div', 'div style=\'display: flex;\'')
        // ))
        // instance.findPatientHos.set(patients);
        instance.findPatientHos.set(res.bundle.entry);
        console.log("patients--", instance.findPatientHos.get());
        
        return false;
    },
  });
  
  