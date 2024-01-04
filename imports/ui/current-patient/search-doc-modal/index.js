import './searchDocModal.html'

import { Template } from "meteor/templating"
import { Session } from "meteor/session"
import { ReactiveVar } from "meteor/reactive-var"
import { Meteor } from "meteor/meteor"
import { Router } from "meteor/iron:router"


const buildEndPoint = () => {
    let baseURL = Session.get("coreURL");
    baseURL += Session.get("resourceType");
    const resourceId = Session.get("resourceId");
    const provenance = Session.get("provenance");
    if (resourceId) {
        baseURL += `?_id=${resourceId}`;
        if (provenance)
        baseURL += `&_revinclude=${provenance}`;
        return baseURL;
    }
    baseURL += `?patient=${Session.get("currentPatientID")}`;
    const startDate = Session.get("startDate");
    const endDate = Session.get("endDate");
    const category = Session.get("category");
    const encounter = Session.get("encounter");

    const filterCount = Session.get("filterCount");
    if (!!filterCount) {
        baseURL += `&_count=${filterCount}`
    } 
    else {
        baseURL += `&_count=10`;
    }
    if (!!startDate) {
        baseURL += `&period=ge${startDate}`;
    }
    if (!!endDate) {
        baseURL += `&period=le${endDate}`;
    }
    if (!!category) {
        baseURL += `&http://loinc.org|${category}`;
    }
    if (!!encounter) {
        baseURL += `&encounter=${encounter}`;
    }
    if (provenance) {
        baseURL += `&_revinclude=${provenance}`;
    }
    return baseURL;
}


const getPatientDocs = async (url, headers) => {

    return new Promise(function (resolver, reject) {
        Meteor.call(
            "patientTestQuery",
            url,
            headers,
            (error, result) => {
                if (error) {
                    console.log("errorFinding", error)
                    if (error.error?.response?.statusCode === 401) {
                        alert("Your session has expired, please login");
                        // Session.set("isLogin", false)
                        // Session.set("isFindLoading", false)
                        // function refreshPage() {
                            Session.clear();
                            Router.go("/login");
                            // location.reload();
                        //   }
                        return
                    }
                    reject(error)
                } else {
                    if (result.status === 200) {
                        resolver(result)
                    }
                }
            }
        )
    }).catch((error) => {
        // show error on screen
        Session.set("getPatientDocs", null)
        Session.set("isFindingDoc", false)
        // alert("Error: " + "resourceType: " + error.error.response?.data?.resourceType)
        // alert("Error: " + "There is no Search Result")
    })
}

const setDocs = (res) => {
    Session.set("searchResult", true);
    Session.set("isFindingDoc", false);
    Session.set("getPatientDocs", {
        patients: res?.bundle?.entry,
            cache: {
                id: res?.queryId,
                pageNumber: res?.pageNumber,
                totalPages: res?.pageNumber,
                countInPage: res?.countInPage,
            },
    })
}


Template.findDocModal.onCreated(function findDocModalOnCreated() {
    this.resourceId = new ReactiveVar("");
});

Template.findDocModal.helpers({
    filterCount(value) {
        const filterCount = Session.get("filterCount") ? Session.get("filterCount") : "10"
        return filterCount === value ? "selected" : "";
    },
    resourceType() {
        return Session.get("resourceType");
    },
    isResourceId() {
        return Template.instance().resourceId.get();
    },
    isAdmin() {
        const isAdmin = Session.get("userRole") === "Admin";
        return isAdmin ? true : false;
    }
})


Template.findDocModal.events({
    // async 'change .filter-start-date'(event, instance) {
    //     event.preventDefault()
    //     if (Session.get("isFindingDoc")) return
    //     Session.set("isFindingDoc", true);
    //     const authToken = Session.get("headers")
    //     const startDate = event.target.value;
    //     Session.set("startDate", startDate)
        
    //     setTimeout(() => {
    //         Session.set("isFindingDoc", false);
    //       }, 2500);
    //       console.log("requestURL---", buildEndPoint())
    // },
    // 'change .filter-end-date'(event, instance) {
    //     Session.set("isFindingDoc", true)
    //     const endDate = event.target.value;
    //     Session.set("endDate", endDate)
    //     setTimeout(() => {
    //         Session.set("isFindingDoc", false);
    //       }, 2500);
    //     console.log("requestURL---", buildEndPoint())
    // },
    // async 'change .filter-document-type'(event, instance) {
    //     event.preventDefault()
    //     if (Session.get("isFindingDoc")) return
    //     Session.set("isFindingDoc", true);
        
    //     setTimeout(() => {
    //         Session.set("isFindingDoc", false);
    //       }, 2500);
    //     console.log("requestURL---", buildEndPoint())
    // },
    // async 'change .filter-patient-count'(event, instance) {
    //     event.preventDefault()
    //     if (Session.get("isFindingDoc")) return
    //     Session.set("isFindingDoc", true);
    //     const filterCount = event.target.value;
    //     Session.set("filterCount", filterCount)
    //     const authToken = Session.get("headers").toUpperCase()
        
    //     const res = await getPatientDocs(buildEndPoint(), {
	// 		Authorization: authToken,
	// 	});
    //     setDocs(res);
    //     console.log("resourceURL---", buildEndPoint())
    // },
    async 'submit .search-doc-form' (event, instance) {
        event.preventDefault()
		$('#findDocModal').modal('hide');

		const target = event.target
		const startDate = target.startDate.value
		const endDate = target.endDate.value
		const filterCount = target.filterCount.value;
        const category = target.category.value;
        const encounter = target.encounter.value;
        const provenance = target.provenance.value;

        Session.set("startDate", startDate)
        Session.set("endDate", endDate)
        Session.set("filterCount", filterCount);
        Session.set("category", category);
        Session.set("encounter", encounter);
        Session.set("provenance", provenance);

        console.log("isFindingDoc", Session.get("isFindingDoc"));
        if (Session.get("isFindingDoc")) return
        Session.set("isFindingDoc", true);
        const authToken = Session.get("headers");
        
        console.log("resourceURL---", buildEndPoint());
        const res = await getPatientDocs(buildEndPoint(), {
			Authorization: authToken,
		});
        setDocs(res);

        Session.set("executeFinding", true);
        console.log('res---', res);
    },
    'input #document-id' (event, instance) {
        const resourceId = event.target.value;
        if (!!resourceId) {
            instance.resourceId.set(true);
        } else {
            instance.resourceId.set(false);
        }
    }
})
