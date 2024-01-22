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

    matchPatientDetails(){
        //Extra Checks added as per ticket #186882040
        let activeRemotePatient = Session.get('activeRemotePatient');
        let activeLocalPatient = Session.get('activeLocalPatient');
        if(!(activeLocalPatient && activeRemotePatient)){
            return
        }
        //local and remote patient name check
        if(activeLocalPatient?.patientName !== activeRemotePatient?.patientName){
            console.log('patient name match failed')
            console.log('Local Patient Name is : ', activeLocalPatient?.patientName);
            console.log('Remote Patient Name is : ', activeRemotePatient?.patientName);
            alert("Patient Name check failed");
        }

        //local and remote patient DOB check
        if(activeLocalPatient?.patientDOB !== activeRemotePatient?.patientDOB){
            console.log('patient name match failed')
            console.log('Local Patient DOB is : ', activeLocalPatient?.patientDOB);
            console.log('Remote Patient DOB is : ', activeRemotePatient?.patientDOB);
            alert("Patient DOB check failed")
        }

        let currentPatientInfo = Session.get("currentPatientInfo");
        let selectedResource = Session.get("selectedDoc")?.resource;
        console.log('RESOURCE', Session.get("selectedDoc")?.resource.subject);

        if(selectedResource?.subject?.reference?.split("/")[1] !== currentPatientInfo?.patientId){
            console.log('Resource patient ID match failed');
            console.log('Resource Patient ID is: ', selectedResource?.subject?.reference.split("/")[1]);
            console.log('Session Active Patient ID is: ', currentPatientInfo?.patientId);
            alert("Patient ID check failed");
        }
        if(selectedResource?.subject?.display !== currentPatientInfo.patientName){
            console.log('Resource Patient Name match failed')
            console.log('Resource Patient Name is: ', selectedResource?.subject?.display)
            console.log('Active Patient Name is: ', currentPatientInfo.patientName);
            alert("Patient Name check failed");
        }
    }
};