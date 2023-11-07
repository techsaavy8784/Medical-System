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

const showPdfModal = async (data) => {
    
    if (Session.get("isFindingDoc")) return
    Session.set("isFindingDoc", true);
    console.log("isFindingDoc", Session.get("isFindingDoc"))
    const pdfUrl = data.resource?.content[0]?.attachment.url;
    console.log("pdfUrl", pdfUrl);
    
    const requestOptions = {
        method: 'GET',
        headers: {
            Accept: "application/pdf"
        },
        redirect: 'follow',
      };
      fetch(pdfUrl, requestOptions)
        .then((response) => response.blob())
        .then((blob) => {
  
          const pdfDataUrl = URL.createObjectURL(blob);
          // window.open(pdfDataUrl, "_blank");
          
            Session.set("isFindingDoc", false);
            Session.set("pdfDataUrl", pdfDataUrl);
            $('#docPdfModal').modal('show');
        })
        .catch((error) => {
            console.log('fetchPDF', error);
        });
}

Template.currentPatient.onCreated(function currentPatientOnCreated() {
    // const isFindingDoc = new ReactiveVar(false)
    Session.set("isFindingDoc", false);
    Session.set("resourceType", null);
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
    emptySearchDocs() {
        // console.log("emptySearchDocs", Session.get("getPatientDocs")?.patients)
        // return Session.get("getPatientDocs")?.patients?.length ? false : true
        if (Session.get("getPatientDocs")?.patients?.length) {
            return false
        } else {
            return true
        }
    },
    resourceId() {
        return Template.instance().data.resourceId;
    }
})


Template.currentPatient.events({
    async 'change .filter-start-date'(event, instance) {
        event.preventDefault()
        if (Session.get("isFindingDoc")) return
        Session.set("isFindingDoc", true);
        const authToken = Session.get("headers")
        const startDate = event.target.value;
        Session.set("startDate", startDate)
        
        // const res = await getPatientDocs(buildEndPoint(), {
		// 	Authorization: authToken,
		// });
        // setDocs(res);
        setTimeout(() => {
            // alert("Delayed alert!");
            // const inputElement = instance.find("#filter-start-date");
            // inputElement.value = Session.get("startDate");
            // instance.find(".filter-start-date").value = Session.get("startDate")
            Session.set("isFindingDoc", false);
          }, 2500);
        console.log("query---", buildEndPoint())
    },
    'change .filter-end-date'(event, instance) {
        Session.set("isFindingDoc", true)
        const endDate = event.target.value;
        Session.set("endDate", endDate)
        setTimeout(() => {
            Session.set("isFindingDoc", false);
          }, 2500);
        console.log("query---", buildEndPoint())
    },
    async 'change .filter-document-type'(event, instance) {
        event.preventDefault()
        if (Session.get("isFindingDoc")) return
        Session.set("isFindingDoc", true);
        const documentType = event.target.value;
        Session.set("documentType",documentType)
        
        // const authToken = Session.get("headers")
        // const res = await getPatientDocs(buildEndPoint(), {
		// 	Authorization: authToken,
		// });
        // setDocs(res);
        setTimeout(() => {
            Session.set("isFindingDoc", false);
          }, 2500);
        console.log("query---", buildEndPoint())
    },
    async 'change .filter-patient-count'(event, instance) {
        event.preventDefault()
        if (Session.get("isFindingDoc")) return
        Session.set("isFindingDoc", true);
        const filterCount = event.target.value;
        Session.set("filterCount", filterCount)
        const authToken = Session.get("headers")
        
        const res = await getPatientDocs(buildEndPoint(), {
			Authorization: authToken,
		});
        setDocs(res);
        console.log("query---", buildEndPoint())
    },
    async 'click #textRawDoc' (event, instance) {

        await showPdfModal(this);
        // console.log("resource", pdfUrl, requestOptions)
    },
    'change .inputFindDoc'(event, instance) {
        // Get select element
        const select = event.target;
        // Get selected value
        const value = select.value;
		console.log("value", value);
		
        // Handle based on entry and value
        if(value === 'FHIR') {
			const data = JSON.stringify(this, null, 2);

			Session.set("fhirDocModalData", data);
            Session.set("showDocFhirModal", true);
			console.log('Viewing details for:', this);
			
		  $('#resourceDocModal').modal('show');
        } else if(value === 'Save') {
			Session.set("showDocSaveModal", true);
			Session.set("saveDocModalData", this.text.div);
		  $('#resourceDocModal').modal('show');
        } else if (value === "Show PDF") {
            showPdfModal(this);
        } else if (value === "Show XML") {
            const xmlUrl = this.resource?.content[1]?.attachment.url;
            console.log("xmlUrl: ----", xmlUrl);
            async function fetchAndShowXML() {
                Session.set("isFindingDoc", true);
            
                try {
                const response = await fetch(xmlUrl, {
                    headers: {
                    Accept: "application/xml",
                    },
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP request failed with status ${response.status}`);
                }
            
                const xmlContent = await response.text();
                const xmlStringify = JSON.stringify(xmlContent, null, 2)
                console.log("xmlContent", xmlStringify);
                Session.set("docXMLModalData", xmlStringify);
                $('#resourceDocModal').modal('show');
                } catch (error) {
                    console.error("Error fetching XML file: ", error);
                }
                Session.set("isFindingDoc", false);
                Session.set("showXMLModal", true);
          }
          
          fetchAndShowXML();
        }
      },
});

Template.sidebar.onCreated(function sidebarOnCreated() {
    this.selectedResourceItem = new ReactiveVar("")
});

Template.sidebar.helpers({
    referenceStyle() {
        return  (Session.get("resourceType") === "DocumentReference") ? "background: #c0c7d4;" : null
    },
    reportStyle() {
        return (Session.get("resourceType") === "DiagnosticReport") ? "background: #c0c7d4;" : null
    },
    observationStyle() {
        return (Session.get("resourceType") === "Observation") ? "background: #c0c7d4;" : null
    },
    conditionStyle() {
        return (Session.get("resourceType") === "Condition") ? "background: #c0c7d4;" : null
    },
    immunizationStyle() {
        return (Session.get("resourceType") === "Immunization") ? "background: #c0c7d4;" : null
    },
    questionnaireStyle() {
        return (Session.get("resourceType") === "QuestionnaireResponse") ? "background: #c0c7d4;" : null
    }
})

Template.sidebar.events({
    async 'click .resource-item'(event, instance) {
        console.log("isFindingDoc", Session.get("isFindingDoc"));
        if (Session.get("isFindingDoc")) return
        Session.set("isFindingDoc", true);
        const authToken = Session.get("headers")
        const clickedItem = event.currentTarget.id;
        instance.selectedResourceItem.set(clickedItem)
        clearQuery();
        Session.set("resourceType", clickedItem)

        console.log("query---", buildEndPoint());

        const res = await getPatientDocs(buildEndPoint(), {
			Authorization: authToken,
		});
        setDocs(res);
        console.log('res---', res);
    }
})

Template.pdfModal.helpers({
    pdfDataUrl() {
        return Session.get("pdfDataUrl");
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
    // console.log("currentDocPdf", this.data.currentDocPdf);
  });

  Template.resourceDocModal.events({    
  })

  
  Template.resourceDocModal.onCreated(function resourceOnCreated(){
    Session.set("showDocSaveModal", false);
    Session.set("showDocFhirModal", false);
    Session.set("showXMLModal", false);
    
  })

  Template.resourceDocModal.helpers({
    showDocSaveModal() {
        return Session.get("showDocSaveModal")
    },
    saveDocModalData() {
        return Session.get("saveDocModalData")
    },
    showDocFhirModal() {
        return Session.get("showDocFhirModal")
    },
    showXMLModal() {
        return Session.get("showXMLModal");
    },
    fhirDocModalData() {
        return Session.get("fhirDocModalData");
    },
    
    docXMLModalData() {
        return Session.get("docXMLModalData");
    },
  })

  Template.resourceDocModal.onRendered(function () {
    
	const modalElement = this.find('#resourceDocModal');
	
	const instance = this;
	const parentInstance = instance.view.parentView.templateInstance();
	$(modalElement).on('hidden.bs.modal', function (event) {
    	const selectElement = parentInstance.find('.inputFindDoc');
	    $(selectElement).val('Select an Option');
		Session.set("showDocSaveModal", false);
        Session.set("showDocFhirModal", false);
        Session.set("showXMLModal", false);
	});
    console.log("currentDocPdf", this.data.currentDocPdf);
  })