import './header.html';
import '/imports/ui/common/creatorCreditsModal/creatorCredits.html';

import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { Meteor } from "meteor/meteor";
import { ReactiveVar } from 'meteor/reactive-var';
import { Router } from "meteor/iron:router";
import { localsHelpers } from "/imports/helpers/localsHelpers";
import { remotesHelpers } from "/imports/helpers/remotesHelpers";
import { patientHelpers } from "/imports/helpers/patientHelpers";

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

    //get the versionId on initial render
    Meteor.call('getVersionId', (error, result) => {
        if (error) {
            console.log('application version not found with error', error)
        } else {
            Session.set("versionId", result);
        }
    });
});

Template.header.helpers({

    activeHosPra() {
        if (Session.get("isActive") === "remote") {
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
        return Session.get("isActive") === "remote";
    },

    currentPatientSelected() {
        return Session.get("currentPatientSelected");
    },

    remoteStyle() {
        if (Session.get("isActive") === "remote") {
            return "color: blue";
        }
    },

    isLocalActive() {
        return Session.get("isActive") === "local";
    },

    positionStyle() {
        if (Session.get("isActive") === "remote") {
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
    'click .credits': function(event) {
        $('#creatorCreditsModal').modal('show');
    },
    'click .btn-logout': function(event) {
        event.preventDefault();
        Session.clear();
        if (Router.path() !== "/") {
            Router.go('/login'); // Redirect to the login page
        }

    },
    'click .click-Remote': function(event, instance) {
        Session.set("isActive", "remote");
        const remote = remotesHelpers.getRemotes()[0];
        Session.set("coreURL", remote.systems[0].coreUrl);
        //reset all saved session values related to current patient
        patientHelpers.setActiveRemotePatient();
    },
    'click .click-Local': function(event) {
        Session.set("isActive", "local");
        const local = localsHelpers.getLocals()[0];
        Session.set("coreURL", local.systems[0].coreUrl);
        //reset all saved session values related to current patient
        patientHelpers.setActiveLocalPatient();
    }
});