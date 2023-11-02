import 'bootstrap/dist/js/bootstrap.bundle';
import 'bootstrap/dist/css/bootstrap.css'

import { Template } from 'meteor/templating';
import {Router} from "meteor/iron:router"
import { Session } from 'meteor/session';
import './main.html';
import './login'
import './home'
import './header'
import './find-patient'

// Template.layout.onCreated(function () {
//   this.layout = new IronLayout({ template: 'layout' });
// });

Router.configure({
  layoutTemplate: "mainContainer"
})

Router.route('/', function () {
  this.render('home');
});

Router.route('/login', function () {
  this.render('login');
});




Router.route('/find-patient', function () {
  console.log("isLogin", Session.get("isLogin"))
  const isLogin = Session.get("isLogin")
  if (!isLogin) {
    Router.go("/login")
  } else {
    
  }
  // this.render('notFound');
});
