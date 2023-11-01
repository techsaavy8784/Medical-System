import './login.html'

import { Template } from 'meteor/templating'
import { Meteor } from "meteor/meteor"
import { ReactiveVar } from 'meteor/reactive-var';
import { Router } from "meteor/iron:router"
// import { Session } from 'meteor/session';


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
        const username = target.username.value;
        const password = target.password.value;

        if (!(username && password)) return

        Meteor.call('loginUser', username, password, (error, result) => {
            if (error) {
              console.error(error);
              isLogin.set(false);
            } else {
                if (result.status == 200) {
                  console.log("login---", result);
                
                isLogin.set(true);
                instance.userInfo.set(result);
                instance.isLogging.set(false);
                
                localStorage.setItem('userInfo', result);
                
                localStorage.setItem('token', result.token);

                localStorage.setItem('facilities', result.facilities);

                localStorage.setItem('practices', result.practices);

                localStorage.setItem('isLogin', true);

                Router.go('/');
              } else {
                isLogin.set(false);
              }
            }
          });
    },
  });
  
  Template.login.onRendered(function () {

  })

  
//   Session.set('userInfo', result);
//   Session.set('token', result.token);
//   Session.set('facilities', result.facilities);
//   Session.set('practices', result.practices);
//   Session.set('isLogin', true);