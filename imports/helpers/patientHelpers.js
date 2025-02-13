/***** all patients related helpers can be added here *****/

import { Meteor } from "meteor/meteor";
import { Session } from "meteor/session";
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';

export const patientHelpers = {
    async getPatients(coreUrl, query, headers) {
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

                            FlowRouter.go("/login");
                        }
                        Session.set("isFindLoading", false)
                        reject(error)
                        // return error;
                    } else {
                        console.log("success: ", result)
                        if (Session.get("isActive") === "remote") {
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
        })
    },

    //this helper will reset current user info when user
    //switch between local and remote
    setCurrentPatient(activePatient) {
        console.log(activePatient)
        Session.set("currentPatientSelected", true);
        Session.set("currentPatientID", activePatient.id);
        Session.set("currentPatientName", activePatient?.name[0]?.text);
        // Session.set("selectedPatientInfo", this);
        Session.set("patientMrn", activePatient.id);
        Session.set("fhirModalData", activePatient.text.div);
    },

    //this helper will reset current user info when user
    //switch between local and remote
    resetCurrentPatient() {
        Session.set('currentPatientInfo', null)
        Session.set("currentPatientSelected", null);
        Session.set("currentPatientID", null);
        Session.set("currentPatientName", null);
        Session.set("selectedPatientInfo", null);
        Session.set("patientMrn", null);
        Session.set("fhirModalData", null);
        FlowRouter.go(`/find-patient`);
    },

    //below functions save active patients only in session
    //first it check if both params supplied then it save new values
    //else it will check for old values and set the session
    //in case both not found it will do nothing
    setActiveLocalPatient(patient) {
        console.log('setActiveLocalPatient', patient)
        if(patient){
            Session.set('activeLocalPatient', patient);
        } else {
            patient = Session.get('activeLocalPatient');
        }
        Session.set('currentPatientInfo', patient);
        if(patient?.data) {
            this.setCurrentPatient(patient?.data);
        } else {
            this.resetCurrentPatient();
        }
    },
    //below functions save active patients only in session
    //first it check if both params supplied then it save new values
    //else it will check for old values and set the session
    //in case both not found it will do nothing
    setActiveRemotePatient(patient) {
        if(patient){
            Session.set('activeRemotePatient', patient);
        } else {
            patient = Session.get('activeRemotePatient');
        }
        Session.set('currentPatientInfo', patient);
        if(patient?.data) {
            this.setCurrentPatient(patient?.data);
        } else {
            this.resetCurrentPatient();
        }
    }
};