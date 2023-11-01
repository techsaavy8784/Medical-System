
import { Template } from 'meteor/templating';
// import { Session } from 'meteor/session';
import { Meteor } from "meteor/meteor"
import { ReactiveVar } from 'meteor/reactive-var';
import {isLogin} from '../login'
import { Router } from "meteor/iron:router"

import './header.html'



Template.header.onCreated(function headerOnCreated() {
    // this.isLoginHeader = new ReactiveVar(Session.get('isLogin'));
    
//   this.autorun(() => {
//     this.isLoginHeader.set(Session.get('isLogin'));
//   });
})



Template.header.helpers({
    isLogin() {
      return isLogin.get();
    },
  });

  Template.header.events({
    'click .btn-logout': function(event) {
      event.preventDefault();
      if (isLogin.get()) {
        // Perform logout logic here
        isLogin.set(null); // Clear the userInfo ReactiveVar
        Router.go('/login'); // Redirect to the login page
      }
    }
  });