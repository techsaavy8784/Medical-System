
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { Meteor } from "meteor/meteor"
import { ReactiveVar } from 'meteor/reactive-var';
import { Router } from "meteor/iron:router"

import './header.html'

const activeHopital = () => {
    const facilities = Session.get("facilities");
    // console.log("facilities", facilities)
    if (facilities?.length) {
        const activeText = facilities[0].facilityName + "/" + facilities[0].systems[0].name;
        // console.log("Session.isActive", activeText)
        return activeText;
    }
}

const activePractice = () => {
    const practices = Session.get("practices");
    if (practices?.length) {
    const activeText = practices[0].displayName + "/" + practices[0].systems[0].displayName;
    return activeText;
    }
}

Template.header.helpers({
    isLogin() {
      return Session.get("isLogin");
    },
    activeHosPra() {
        if (Session.get("isActive") === "hospital") {
            const activeText = activeHopital();

            return activeText;
        } else if (Session.get("isActive") === "practice") {
            const activeText = activePractice();
            return activeText;
        }
    },
    visitHopital() {
        const activeText = activeHopital();
        return activeText;
    },
    visitPractice() {
        const activeText = activePractice();
        return activeText;
    },
    isActiveHos() {
        if (Session.get("isActive") === "hospital") {
            return true
        } else {
            return false
        }
    },
    currentPatientInfo() {  
        return Session.get("currentPatientInfo")
    },
    hospitalStyle() {
        if (Session.get("isActive") === "hospital") {
            return "color: blue"
        }
    },
    practiceStyle() {
        if (Session.get("isActive") === "practice") {
            return "color: blue"
        }
    }
  });

  Template.header.onCreated(function headerOnCreated() {
    this.practices = new ReactiveVar(Session.get("practices"));
    this.isLogin = new ReactiveVar(Session.get("isLogin"));
    this.activeHosPra = new ReactiveVar("");
    this.visitHopital = new ReactiveVar("");
    this.visitPractice = new ReactiveVar("");
    this.isActiveHos = new ReactiveVar(true);
});


  Template.header.events({
    'click .btn-logout': function(event) {
      event.preventDefault();
        Session.clear();
        if (Router.path() !== "/") {
            
            Router.go('/login'); // Redirect to the login page
        }
        
    },
    'click .click-Hospital': function(event) {
        // event.target.classList.add('nav-link active click-Hospital');
        Session.set("isActive", "hospital")
        const facility = Session.get("facilities")[0]
        Session.set("coreURL", facility.systems[0].coreUrl)
    },
    'click .click-Practice': function(event) {
        // event.target.classList.add('nav-link click-Practice active');
        Session.set("isActive", "practice")
        const practice = Session.get("practices")[0]
        Session.set("coreURL", practice.systems[0].coreUrl)
    }
  });

