import {Session} from "meteor/session";

/***** all common helpers related to resources will be added here *****/

//param modalType ('Save' or 'Search')
export const resourceHelpers = {
    openActiveResourceModal(modalType) {
        let activeResourceType = Session.get("activeResourceType");
        //if activeResourceType not selected alert about it
        if(!activeResourceType){
            alert('Please Select Resource Type');
            return;
        }
        console.log(activeResourceType)
        console.log(`#${activeResourceType}${modalType}Modal`)
        $(`#${activeResourceType}${modalType}Modal`).modal("show");
    },

    resourceDetails(key) {
        let resource = Session.get("activeResourceType")?.resource;
        if(resource){
            return resource[key];
        }

    },

    async matchPatientDetails(){
        return new Promise(function (resolver, reject) {
            let matchedFailed = false;
            let matchFailedValues = [];
            //Extra Checks added as per ticket #186882040
            let activeRemotePatient = Session.get('activeRemotePatient');
            let activeLocalPatient = Session.get('activeLocalPatient');
            if(!(activeLocalPatient && activeRemotePatient)){
                return;
            }
            //local and remote patient name check
            if(activeLocalPatient?.patientName !== activeRemotePatient?.patientName){
                matchedFailed = true;
                matchFailedValues.push(
                    { text: `Save to Patient Name is :  ${activeLocalPatient?.patientName}`},
                    { text: `Source Patient Name is :  ${activeRemotePatient?.patientName}`}
                );
            }

            //local and remote patient DOB check
            if(activeLocalPatient?.patientDOB !== activeRemotePatient?.patientDOB){
                matchedFailed = true;
                matchFailedValues.push(
                    { text: `Save to Patient DOB is :  ${activeLocalPatient?.patientDOB}`},
                    { text: `Source Patient DOB is :  ${activeRemotePatient?.patientDOB}`}
                );
            }

            // let currentPatientInfo = Session.get("currentPatientInfo");
            // let selectedResource = Session.get("selectedDoc")?.resource;
            // console.log('RESOURCE', Session.get("selectedDoc")?.resource.subject);
            //
            // if(selectedResource?.subject?.reference?.split("/")[1] !== currentPatientInfo?.patientId){
            //     matchedFailed = true;
            //     console.log('Resource patient ID match failed');
            //     console.log('Resource Patient ID is: ', selectedResource?.subject?.reference.split("/")[1]);
            //     console.log('Session Active Patient ID is: ', currentPatientInfo?.patientId);
            //     matchFailedValues.push(
            //         { text: `Resource Patient ID is:  ${selectedResource?.subject?.reference.split("/")[1]}`},
            //         { text: `Session Active Patient ID is:  ${currentPatientInfo?.patientId}`}
            //     );
            //     // alert("Patient ID check failed");
            // }
            // if(selectedResource?.subject?.display !== currentPatientInfo.patientName){
            //     matchedFailed = true;
            //     console.log('Resource Patient Name match failed')
            //     console.log('Resource Patient Name is: ', selectedResource?.subject?.display)
            //     console.log('Active Patient Name is: ', currentPatientInfo.patientName);
            //     matchFailedValues.push(
            //         { text: `Resource Patient Name is:  ${selectedResource?.subject?.display}`},
            //         { text: `Active Patient Name is:  ${currentPatientInfo.patientName}`}
            //     );
            //     // alert("Patient Name check failed");
            // }
            if(matchedFailed){
                Session.set('matchFailedValues', matchFailedValues)
                $('#patientMatchModal').modal('show');
                let backgroundCheckInterval = Meteor.setInterval(()=> {
                    if(!($('#patientMatchModal').is(':visible'))){
                        let decision = Session.get('patientOverRideConfirmed');
                        decision ? resolver(true) : resolver(false);
                        clearInterval(backgroundCheckInterval)
                    }
                }, 1000)
            } else {
                resolver(true)
            }
        })
    }
};