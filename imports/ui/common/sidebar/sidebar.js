import './sidebar.html';
import { Template } from "meteor/templating";
import { Session } from "meteor/session";
import { ReactiveVar } from "meteor/reactive-var";


const clearQuery = () => {
    Session.set("startDate", null);
    Session.set("endDate", null);
    Session.set("filterCount", null);
}

Template.sidebar.onCreated(function sidebarOnCreated() {
    this.selectedResourceItem = new ReactiveVar("")
});


Template.sidebar.helpers({

});


Template.sidebar.events({
    async 'click .resource-item'(event, instance) {
        Session.set("searchResult", false);
        const clickedItem = event.currentTarget.id;
        instance.selectedResourceItem.set(clickedItem);
        clearQuery();
        Session.set("resourceType", clickedItem)
        $("#findDocModal").modal("show");
    }
});

Template.sidebar.onRendered(function () {
    Session.set("resourceType", null);
})