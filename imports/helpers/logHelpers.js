import { Session } from "meteor/session";
import { Meteor } from "meteor/meteor";

/***** all common helpers related to logging will be added here *****/

export const logHelpers = {
    // TODO: complete and integrate logging after current fixes
    logAction(logType = "logType", logMessage = "Test HipaaLog") {
        let systemId, srcSystemId, destSystemId, srcPatientId, destPatientId;
        if(Session.get("isActive") === "local"){
            systemId = Session.get('locals')[0].systems[0].id || null;
            srcSystemId = Session.get('locals')[0].systems[0].id || null;
            destSystemId = Session.get('remotes')[0].systems[0].id || null;
            srcPatientId = Session.get('activeLocalPatient')?.patientId || null;
            destPatientId = Session.get('activeRemotePatient')?.patientId || null;
        } else {
            systemId = Session.get('remotes')[0].systems[0].id || null;
            srcSystemId = Session.get('remotes')[0].systems[0].id || null;
            destSystemId = Session.get('locals')[0].systems[0].id || null;
            srcPatientId = Session.get('activeRemotePatient')?.patientId || null;
            destPatientId = Session.get('activeLocalPatient')?.patientId || null;
        }
        let resourceType = Session.get("activeResourceType") || null;
        let currentPatient = Session.get("currentPatientInfo")
        let userInfo = Session.get("userInfo")
        let resource = Session.get('selectedDoc')?.resource
        let body =  {
            // "_id" : ObjectId("65aca4fc9da1cbb6d2a57df4"),
            "userId" : userInfo?.id,
            "patientId" : currentPatient.patientId,
            "srcPatientId" : srcPatientId,
            "destPatientId" : destPatientId,
            "resourceType" : resourceType,
            "resourceId" : resource.id,
            "srcResourceId" : resource.id,
            "destResourceId" : "", //TODO: from where I can get this confirm all (srcResourceID and destResourceId)
            "systemId" : systemId,
            "srcSystemId" : srcSystemId,
            "destSystemId" : destSystemId,
            "logType" : logType,
            // "logTime" : ISODate("2024-01-21T05:00:44.516+0000"),
            "logMessage" : logMessage
        }

        console.group('Log User Action');

        const url = 'http://universalcharts.com/api/rest/v1/LogHipaa';
        console.log("url", url);
        console.log("payload", body);
        console.groupEnd();

        const token = Session.get("headers");


        Meteor.call('logUserAction', url, body, {Authorization: token}, (error, result) => {
            if (error) {
                console.log("error", error);
                // const errorInfo = error?.reason.response?.data
                // alert("ERROR !" + errorInfo.resourceType + "\n" + errorInfo.issue[0]?.details?.text);
            } else {
                console.log("result: ", result)
                // const localName = localsHelpers.getLocals()[0]?.displayName
                // alert(`Resource successfully imported to your ${localName}`)
            }
        });
    }
};