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
  });
  
  Template.login.events({
    'submit .login-form'(event, instance) {
        event.preventDefault();
        
        const target = event.target;
        const username = target.username.value.toLowerCase();
        const password = target.password.value.toLowerCase();
        
        if (!(username && password)) {
          alert('Input all field values!')
          return;
        }
        instance.isLogging.set(true);
        try {
          Meteor.call('loginUser', username, password, (error, result) => {
  
              if (error) {
                console.log("loginError", result);
                
                alert(error)
                isLogin.set(false);
                instance.isLogging.set(false);
              } else {
                console.log("loginResult", result);
                  if (result.status === 200) {
                  console.log("loginResponse: ", result);
                  isLogin.set(true);
                  instance.userInfo.set(result);
                  instance.isLogging.set(false);
                  

                  Session.set("userRole", result.role);
                  console.log("userRole", result.role)
                  Session.set('practices', result?.locals);
                  Session.set('facilities', result?.remotes);
                  Session.set('isLogin', true);
                  Session.set('isActive', "hospital");
                  Session.set('headers', result?.token);
                  
                  Session.set("coreURL", result?.remotes[0].systems[0].coreUrl);

                  
                  Router.go('/');
                } else if (result.response?.statusCode === 401) {
                  instance.isLogging.set(false);
                  const errorMessage = result.response?.data?.message;
                  alert("Not Authorized: " + `${errorMessage}`)
                } else {
                  alert("Internet Connection error!")
                  isLogin.set(false);
                  instance.isLogging.set(false);
                }
              }
            });
        } catch (error) {
          console.log("network error")
          instance.isLogging.set(false);
        }
    },
  });
  
  Template.login.onRendered(function () {

  })