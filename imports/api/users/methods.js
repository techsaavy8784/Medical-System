import { Meteor } from "meteor/meteor";
import { baseUrl } from "/imports/utils/constants";
import { HTTP } from "meteor/http";

Meteor.methods({
    loginUser: function (username, password) {
        // Make an HTTP POST request to the authorize API endpoint
        const requestUrl = baseUrl + "authorize";
        console.log("requestUrl", requestUrl);
        try {
            const response = HTTP.post(requestUrl, {
                data: {
                    userName: username,
                    password: password
                }
            });
            console.log("loginResponse: ", response.data);
            return response?.data;

        } catch (error) {
            console.error("Error in loginUser:", error);
            return error;
        }
    }
})