import './header.html';

import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { Meteor } from "meteor/meteor"
import { ReactiveVar } from 'meteor/reactive-var';
import { Router } from "meteor/iron:router";
import { localsHelpers } from "/imports/helpers/localsHelpers";
import { remotesHelpers } from "/imports/helpers/remotesHelpers";

const activeHopital = () => {
    const remotes = remotesHelpers.getRemotes();
    if (remotes?.length) {
        return (remotes[0]?.name + "/" + remotes[0]?.systems[0]?.name);
    }
}

const activeLocal = () => {
    const locals = localsHelpers.getLocals();
    if (locals?.length) {
        return (locals[0].displayName + "/" + locals[0].systems[0].displayName);
    }
}

Template.header.onCreated(function headerOnCreated() {
    this.locals = new ReactiveVar(localsHelpers.getLocals());
    this.versionId = new ReactiveVar("");

    //get the versionId on initial render
    Meteor.call('getVersionId', (error, result) => {
        if (error) {
            console.log('application version not found with error', error)
        } else {
            this.versionId.set(result);
        }
    });
});

Template.header.helpers({
    versionId() {
        return Template.instance().versionId.get();
    },

    activeHosPra() {
        if (Session.get("isActive") === "hospital") {
            return activeHopital();
        } else if (Session.get("isActive") === "local") {
            return activeLocal();
        }
    },

    visitHopital() {
        return activeHopital();
    },

    visitLocal() {
        return activeLocal();
    },

    isActiveHos() {
        return Session.get("isActive") === "hospital";
    },

    currentPatientInfo() {  
        return Session.get("currentPatientInfo");
    },

    hospitalStyle() {
        if (Session.get("isActive") === "hospital") {
            return "color: blue";
        }
    },

    positionStyle() {
        if (Session.get("isActive") === "hospital") {
            return "justify-content: start";
        } else {
            return "justify-content: end";
        }
    },

    localStyle() {
        if (Session.get("isActive") === "local") {
            return "color: blue";
        }
    }
});

Template.header.events({
    'click .btn-logout': function(event) {
        event.preventDefault();
        Session.clear();
        if (Router.path() !== "/") {
            Router.go('/login'); // Redirect to the login page
        }

    },
    'click .click-Hospital': function(event, instance) {
        Session.set("isActive", "hospital");
        const remote = remotesHelpers.getRemotes()[0];
        Session.set("coreURL", remote.systems[0].coreUrl);
    },
    'click .click-Local': function(event) {
        Session.set("isActive", "local");
        const local = localsHelpers.getLocals()[0];
        Session.set("coreURL", local.systems[0].coreUrl);
    }
});