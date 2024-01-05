import "./home.html"

import { Template } from 'meteor/templating';
import { Meteor } from "meteor/meteor"
import { ReactiveVar } from 'meteor/reactive-var';

Template.home.onCreated(function tagLineOnCreated() {
    this.tagLineText = new ReactiveVar("");

    Meteor.call('getTagLine', (error, result) => {
        if (error) {
          this.tagLineText.set("Network Error!");
        } else {
          if (result.statusCode === 200) {
            this.tagLineText.set(result.content);
          } else {
            this.tagLineText.set("Network Error!");
          }
        }
      });
})


Template.home.helpers({
    tagLineText() {
      return Template.instance().tagLineText.get();
    },
  });