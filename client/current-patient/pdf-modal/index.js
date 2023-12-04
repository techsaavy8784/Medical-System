import './pdfModal.html'

import { Template } from "meteor/templating"
import { Session } from "meteor/session"
import { ReactiveVar } from "meteor/reactive-var"
import { Meteor } from "meteor/meteor"
import { Router } from "meteor/iron:router"



Template.pdfModal.helpers({
    pdfDataUrl() {
        return Session.get("pdfDataUrl");
    },
    emptyPdfData() {
        return Session.get("emptyPdfData");
    },
    emptyXmlData() {
        return Session.get("emptyXmlData");
    }
})

Template.pdfModal.onCreated(function pdfModalOnCreated() {
    Session.set("emptyPdfData", false);
    Session.set("emptyXmlData", false);
});

