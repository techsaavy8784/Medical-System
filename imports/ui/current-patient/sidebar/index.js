import './sidebar.html'
import { Template } from "meteor/templating"
import { Session } from "meteor/session"
import { ReactiveVar } from "meteor/reactive-var"
import { Router } from "meteor/iron:router"


const clearQuery = () => {
    Session.set("startDate", null)
    Session.set("endDate", null)
    Session.set("filterCount", null)
}

Template.sidebar.onCreated(function sidebarOnCreated() {
    this.selectedResourceItem = new ReactiveVar("")
});


Template.sidebar.helpers({
    referenceStyle() {
        return  (Session.get("resourceType") === "DocumentReference") ? "background: #c0c7d4;" : null
    },
    reportStyle() {
        return (Session.get("resourceType") === "DiagnosticReport") ? "background: #c0c7d4;" : null
    },
    observationStyle() {
        return (Session.get("resourceType") === "Observation") ? "background: #c0c7d4;" : null
    },
    conditionStyle() {
        return (Session.get("resourceType") === "Condition") ? "background: #c0c7d4;" : null
    },
    immunizationStyle() {
        return (Session.get("resourceType") === "Immunization") ? "background: #c0c7d4;" : null
    },
    questionnaireStyle() {
        return (Session.get("resourceType") === "QuestionnaireResponse") ? "background: #c0c7d4;" : null
    }
});


Template.sidebar.events({
    async 'click .resource-item'(event, instance) {
        Session.set("searchResult", false);
        const clickedItem = event.currentTarget.id;
        instance.selectedResourceItem.set(clickedItem)
        clearQuery();
        Session.set("resourceType", clickedItem)
        
        // if (Session.get("isFindingDoc")) return
        // Session.set("isFindingDoc", true);
        // const authToken = Session.get("headers");
        
        // console.log("resourceURL---", buildEndPoint());
        // const res = await getPatientDocs(buildEndPoint(), {
		// 	Authorization: authToken,
		// });
        // Session.set("isFindingDoc", false);

        // setDocs(res);
        // console.log('res---', res);

        $("#findDocModal").modal("show");

    }
});

Template.sidebar.onRendered(function () {
    Session.set("resourceType", null);
})