import 'bootstrap/dist/js/bootstrap.bundle';
import 'bootstrap/dist/css/bootstrap.css'

import { Template } from 'meteor/templating';
import {Router} from "meteor/iron:router"
import { isLogin } from './login'; 

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
  this.render('find-patient');
});

// Create a 404 route (catch-all)
// Router.route('/asd', function () {
//   if (!isLogin) {

//   } else {
//     Router.go("/")
    
//   }
//   // this.render('notFound');
// });
