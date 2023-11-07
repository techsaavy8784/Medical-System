import './login.html'

import { Template } from 'meteor/templating'
import { Meteor } from "meteor/meteor"
import { ReactiveVar } from 'meteor/reactive-var';
import { Router } from "meteor/iron:router"
import { Session } from 'meteor/session';


export const isLogin = new ReactiveVar(false);

Template.login.onCreated(function loginOnCreated() {
    this.userInfo = new ReactiveVar(null);
    this.isLogging = new ReactiveVar(false);
  });
  
  Template.login.helpers({
    userInfo() {
      return Template.instance().userInfo.get();
    },
    isLogin() {
        return isLogin.get();
    },
    
    isLogging() {
        return Template.instance().isLogging.get();
    }
    // username() {
    //   return Template.instance().counter.get();
    // },
  });
  
  Template.login.events({
    'submit .login-form'(event, instance) {
        event.preventDefault();
        
        instance.isLogging.set(true);
        const target = event.target;
        const username = target.username.value.toLowerCase();
        const password = target.password.value.toLowerCase();

        if (!(username && password)) return

        Meteor.call('loginUser', username, password, (error, result) => {

            if (error) {
              console.error(error);
              isLogin.set(false);
              instance.isLogging.set(false);
              
            } else {
                if (result.status == 200) {
                
                isLogin.set(true);
                instance.userInfo.set(result);
                instance.isLogging.set(false);
                
                Session.set('practices', result?.practices);
                Session.set('facilities', result?.facilities);
                Session.set('isLogin', true);
                Session.set('isActive', "hospital");
                Session.set('headers', result?.token);
                
                Session.set("coreURL", result?.facilities[0].systems[0].coreUrl)
                
                Router.go('/');
              } else {
                isLogin.set(false);
                instance.isLogging.set(false);
              }
            }
            
          });
    },
  });
  
  Template.login.onRendered(function () {

  })