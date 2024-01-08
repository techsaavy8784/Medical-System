/***** all patients related helpers can be added here *****/

import { Meteor } from "meteor/meteor";
import { Session } from "meteor/session";
import { Router } from "meteor/iron:router"

export const patientHelpers = {
    async getPatients(coreUrl, query, headers) {
        return new Promise(function (resolver, reject) {
            console.log("find-patientURL", `${coreUrl}${query}`);
            Meteor.call(
                "patientTestQuery",
                `${coreUrl}/${query}`,
                headers,
                (error, result) => {
                    if (error) {
                        console.log("errorFinding", error)
                        if (error.error?.response?.statusCode === 401) {
                            alert("Your session has expired, please login");
                            Session.set("isLogin", false)
                            Session.set("isFindLoading", false)

                            Router.go("/login");
                        }
                        Session.set("isFindLoading", false)
                        reject(error)
                        // return error;
                    } else {
                        console.log("success: ", result)
                        if (Session.get("isActive") === "hospital") {
                            if (result.status === 200 && result.message === " No resources found") {

                                resolver(result)
                            } else {
                                resolver(result)
                            }
                        } else {
                            if (result.statusCode === 404) {
                                resolver(result)

                            } else {
                                resolver(result)
                            }
                        }
                        Session.set("isFindLoading", false)
                    }
                }
            )
        }).catch((error) => {
            console.log("errorFinding", error)
        })
    }
};