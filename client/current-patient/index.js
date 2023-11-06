import './currentPatient.html'
import { Template } from "meteor/templating"
import { Session } from "meteor/session"
import { ReactiveVar } from "meteor/reactive-var"
import { Meteor } from "meteor/meteor"
import { HTTP } from 'meteor/http';

const buildEndPoint = () => {
    let baseURL = Session.get("coreURL");
    baseURL += Session.get("resourceType");
    baseURL += `?patient=${Session.get("currentPatientID")}`;
    const startDate = Session.get("startDate");
    const endDate = Session.get("endDate");
    const documentType = Session.get("documentType");
    const filterCount = Session.get("filterCount");
    if (!!filterCount) {
        baseURL += `&_count=${filterCount}`
    } else {
        baseURL += `&_count=10`;
    }
    if (!!startDate) {
        baseURL += `&period=ge${startDate}`;
    }
    if (!!endDate) {
        baseURL += `&period=le${endDate}`;
    }
    if (!!documentType) {
        baseURL += `&type=${documentType}`;
    }
    return baseURL;
}

const clearQuery = () => {
    Session.set("startDate", null)
    Session.set("endDate", null)
    Session.set("documentType", null)
    Session.set("filterCount", null)
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
        // alert("Error: " + "There is no Search Result")
    })
}

const setDocs = (res) => {
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


Template.currentPatient.onCreated(function currentPatientOnCreated() {
    // const isFindingDoc = new ReactiveVar(false)
    Session.set("isFindingDoc", false);
    
})

Template.currentPatient.helpers({
    currentPatientInfo() {
        return Session.get("currentPatientInfo")
    },
    isFindingDoc() {
        return Session.get("isFindingDoc")
    },
    currentPatientDocs() {
        return Session.get("getPatientDocs")?.patients;
    },
    // existDocs() {
    //     return Session.get("")
    // }
})


Template.currentPatient.events({
    async 'change .filter-start-date'(event, instance) {
        if (Session.get("isFindingDoc")) return
        Session.set("isFindingDoc", true);
        const authToken = Session.get("headers")
        const startDate = event.target.value;
        Session.set("startDate", startDate)
        
        const res = await getPatientDocs(buildEndPoint(), {
			Authorization: authToken,
		});
        // setDocs(res);
        console.log("query---", buildEndPoint())
    },
    'change .filter-end-date'(event, instance) {
        const endDate = event.target.value;
        Session.set("endDate", endDate)
        console.log("query---", buildEndPoint())
    },
    'change .filter-document-type'(event, instance) {
        const documentType = event.target.value;
        Session.set("documentType",documentType)
        console.log("query---", buildEndPoint())
    },
    'change .filter-patient-count'(event, instance) {
        const filterCount = event.target.value;
        Session.set("filterCount", filterCount)
        console.log("query---", buildEndPoint())
    },
    'click #textRawDoc' (event, instance) {
        if (Session.get("isFindingDoc")) return
        Session.set("isFindingDoc", true);
        console.log("isFindingDoc", Session.get("isFindingDoc"))
        const pdfUrl = this.resource.content[0].attachment.url;
        
        const requestOptions = {headers: {
            Accept: "application/pdf"
        }};

        HTTP.get(pdfUrl, requestOptions, (error, response) => {
            if (error) {
              console.log("fetchPDF", error);
            } else {
              const blob = new Blob([response.content], { type: "application/pdf" });
              const pdfData = URL.createObjectURL(blob);
              Session.set("pdfData", pdfData); // Set the PDF data
            }
          });
        Session.set("isFindingDoc", false);
        $('#docPdfModal').modal('show');
        console.log("isFindingDoc", Session.get("isFindingDoc"))
        // console.log("resource", pdfUrl, requestOptions)
    }
});

Template.sidebar.onCreated(function sidebarOnCreated() {
    this.selectedResourceItem = new ReactiveVar("")
});

Template.sidebar.helpers({
    // isActive(item) {
    //     const activeItem = Template.instance().selectedResourceItem.get();
    //     console.log("isActive", activeItem)
    //     console.log("item", item)
    //     return item === activeItem ? 'active' : '';
    // }
    
})

Template.sidebar.events({
    async 'click .resource-item'(event, instance) {
        if (Session.get("isFindingDoc")) return
        Session.set("isFindingDoc", true);
        const authToken = Session.get("headers")
        const clickedItem = event.currentTarget.id;
        instance.selectedResourceItem.set(clickedItem)
        clearQuery();
        Session.set("resourceType", clickedItem)
        // $('#sidebar-nav-patient a').click(function(e) {
        //     $('#sidebar-nav-patient a').removeClass('current_page_item');
        //     $(`#${clickedItem}`).addClass('current_page_item');
        // });
        
	    const parentInstance = instance.view.parentView.templateInstance();
        const clearStartDate = parentInstance.find('#filter-start-date');
        const clearEndDate = parentInstance.find('#filter-end-date');
        const clearDocumentType = parentInstance.find('#filter-document-type');
        const clearCount = parentInstance.find('#filter-count');
        clearStartDate.value = "";
        clearEndDate.value = "";
        clearDocumentType.value = 'All';
        clearCount.value = "10";
        console.log("query---", buildEndPoint());

        const res = await getPatientDocs(buildEndPoint(), {
			Authorization: authToken,
		});
        setDocs(res);
        console.log('res---', res);
    }
})

Template.pdfModal.helpers({
    currentDocPdf() {
        return Session.get("pdfData");
    }
})



Template.pdfModal.onRendered(function() {
	// const modalElement = this.find('#docPdfModal');
	
	// const instance = this;
	// const parentInstance = instance.view.parentView.templateInstance();
	// $(modalElement).on('hidden.bs.modal', function (event) {
    // 	const selectElement = parentInstance.find('.inputFindPatient');
	//   $(selectElement).val('Select an Option');
	// 	Session.set("showSaveModal", false);

	// });
  });