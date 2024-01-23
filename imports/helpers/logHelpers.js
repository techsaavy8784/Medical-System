import { Session } from "meteor/session";

/***** all common helpers related to logging will be added here *****/

export const logHelpers = {
    // TODO: complete and integrate logging after current fixes
    logAction() {
        if(Session.get("isActive") === "local"){
            let systemId = Session.get('remotes')[0].systems[0].id
            let srcSystemId = Session.get('remotes')[0].systems[0].id
            let destSystemId = Session.get('remotes')[0].systems[0].id
        }
        let currentPatient = Session.get("currentPatientInfo")
        let userInfo = Session.get("userInfo")
        let resource = Session.get('selectedDoc')?.resource
        console.log
        let payload =  {
            // "_id" : ObjectId("65aca4fc9da1cbb6d2a57df4"),
            "userId" : "65833bd42fefe64f96ac3b2a",
            "patientId" : "",
            "srcPatientId" : "",
            "destPatientId" : "",
            "resourceType" : Session.get("activeResourceType"),
            "resourceId" : resource.id,
            "srcResourceId" : "",
            "destResourceId" : "",
            "systemId" : "",
            "srcSystemId" : "",
            "destSystemId" : "",
            "logType" : "Test",
            // "logTime" : ISODate("2024-01-21T05:00:44.516+0000"),
            "logMessage" : "Test HipaaLog"
        }
    }
};