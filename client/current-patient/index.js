import './currentPatient.html'
import { Template } from "meteor/templating"
import { Session } from "meteor/session"
import { ReactiveVar } from "meteor/reactive-var"
import { Meteor } from "meteor/meteor"

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
        Session.set("isFindingDoc", false)
        alert("Error: " + "resourceType: " + error.error.response?.data?.resourceType)
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
    console.log("emptyPdfData", Session.get("emptyPdfData"));
    console.log("data", data);
    // console.log("pdfUrl", data.resource?.presentedForm[0]?.url)
    if (Session.get("isFindingDoc")) return
    let pdfUrl = "";
    if (!!data.resource.content || !!data.resource?.presentedForm) {
        if (Session.get("resourceType") === "DocumentReference") {
            pdfUrl = data.resource?.content[0]?.attachment.url;
        } else if (Session.get("resourceType") === "DiagnosticReport") {
            pdfUrl = data.resource?.presentedForm[0]?.url;
        }
    } else {
        Session.set("emptyPdfData", true);
        $('#docPdfModal').modal('show');
        return;
    }
    Session.set("isFindingDoc", true);
    // console.log("isFindingDoc", Session.get("isFindingDoc"))
    
    // console.log("pdfUrl", pdfUrl);
    
    const requestOptions  = {
        method: 'GET',
        headers: {
            Accept: "application/pdf"
        },
        redirect: 'follow',
      };
      try {
        const response = await fetch(pdfUrl, requestOptions);
        console.log("response", response);
        if (!response.ok) {
          throw new Error(`Failed to fetch PDF: ${response.status} ${response.statusText}`);
        }
        
        const blob = await response.blob();
        const pdfDataUrl = URL.createObjectURL(blob);
        
        Session.set("isFindingDoc", false);
        Session.set("emptyPdfData", false);
        Session.set("pdfDataUrl", pdfDataUrl);
        $('#docPdfModal').modal('show');
      } catch (error) {
        console.log('fetchPDF', error);
        // Handle the error as needed
      }
}

Template.currentPatient.onCreated(function currentPatientOnCreated() {
    Session.set("isFindingDoc", false);
    Session.set("filterCount", "10");

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
        if (Session.get("getPatientDocs")?.patients?.length) {
            return false
        } else {
            return true
        }
    },
    resourceId() {
        return Template.instance().data.resourceId;
    },
    startDate() {
        return Session.get("startDate");
    },
    endDate() {
        return Session.get("endDate");
    },
    documentType(value) {
        const documentType = Session.get("documentType") ? Session.get("documentType") : "all"
        return documentType === value ? "selected" : "";
    },
    filterCount(value) {
        const filterCount = Session.get("filterCount") ? Session.get("filterCount") : "10"
        return filterCount === value ? "selected" : "";
    }
});


Template.currentPatient.events({
    async 'change .filter-start-date'(event, instance) {
        event.preventDefault()
        if (Session.get("isFindingDoc")) return
        Session.set("isFindingDoc", true);
        const authToken = Session.get("headers")
        const startDate = event.target.value;
        Session.set("startDate", startDate)
        
        setTimeout(() => {
            Session.set("isFindingDoc", false);
          }, 2500);
          console.log("requestURL---", buildEndPoint())
    },
    'change .filter-end-date'(event, instance) {
        Session.set("isFindingDoc", true)
        const endDate = event.target.value;
        Session.set("endDate", endDate)
        setTimeout(() => {
            Session.set("isFindingDoc", false);
          }, 2500);
        console.log("requestURL---", buildEndPoint())
    },
    async 'change .filter-document-type'(event, instance) {
        event.preventDefault()
        if (Session.get("isFindingDoc")) return
        Session.set("isFindingDoc", true);
        const documentType = event.target.value;
        Session.set("documentType", documentType)
        
        setTimeout(() => {
            Session.set("isFindingDoc", false);
          }, 2500);
        console.log("requestURL---", buildEndPoint())
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
        console.log("resourceURL---", buildEndPoint())
    },
    async 'click #textRawDoc' (event, instance) {
        await showPdfModal(this);
    },
    'change .inputFindDoc'(event, instance) {
        // Get select element
        const select = event.target;
        // Get selected value
        const value = select.value;
		console.log("value", value);
        console.log("selectedDoc", this);
		Session.set("selectedDoc", this);
        // Handle based on entry and value
        if(value === 'FHIR') {
			const data = JSON.stringify(this, null, 2);

			Session.set("fhirDocModalData", data);
            Session.set("showDocFhirModal", true);
			console.log('Viewing details for:', this);
			
		  $('#resourceDocModal').modal('show');
        } else if(value === 'Save to MyEMR') {
			Session.set("showDocSaveModal", true);
			Session.set("saveDocModalData", this.text.div);
		  $('#resourceDocModal').modal('show');
        } else if (value === "Show PDF") {
            showPdfModal(this);
        } else if (value === "Show XML") {
            let xmlUrl = "";
            if (!!this.resource.content || !!this.resource?.presentedForm) {
                if (Session.get("resourceType") === "DocumentReference") {
                    xmlUrl = this.resource?.content[1]?.attachment?.url;
                } else if (Session.get("resourceType") === "DiagnosticReport") {
                    xmlUrl = this.resource?.presentedForm[1]?.url;
                }
            } else {
                Session.set("emptyXmlData", true);
                $('#resourceDocModal').modal('show');
                return;
            }
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

Template.currentPatient.onRendered( function (){
    
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

        console.log("resourceURL---", buildEndPoint());

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
    },
    emptyPdfData() {
        return Session.get("emptyPdfData");
    },
    emptyXmlData() {
        return Session.get("emptyXmlData");
    }
})

Template.pdfModal.onCreated(function pdfModalOnCreated() {
    Session.set("emptyPdfData", false);
    Session.set("emptyXmlData", false);
})

  
  Template.resourceDocModal.onCreated(function resourceOnCreated(){
    Session.set("showDocSaveModal", false);
    Session.set("showDocFhirModal", false);
    Session.set("showXMLModal", false);
    
  })

  Template.resourceDocModal.events({
    async 'click .save-doc-data'(event, instance) {
        event.preventDefault();
        const canSave = Session.get("showDocSaveModal");
        const url = Session.get("coreURL") + "Patient";
        const patientId = Session.get("currentPatientID");
        const patientName = Session.get("currentPatientName");
        const resourceType = Session.get("resourceType");
		const destSystemId = Session.get("practices")[0].systems[0].id;
		// const srcSystemId = Session.get("facilities")[0].systems[0].id;
        const srcResource = Session.get("selectedDoc").resource;
        const srcResourceId = Session.get("selectedDoc").resource.id;
		const body = {
			"resourceType": resourceType,
			"destPatientId": patientId,
            "destPatientName": patientName,
			"destSystemId": destSystemId,
            "srcResourceId": srcResourceId,
			"SrcResource": srcResource
		}
        console.log("payload", body);
		const token = Session.get("headers");
        if (canSave) {
			console.log("save button is clicked.")
			Meteor.call('savePatientResource', url, body, {Authorization: token}, (error, result) => {
				if (error) {
				  console.log("error", error);
                  const errorInfo = error?.reason.response?.data
				  alert("ERROR !" + errorInfo.resourceType + "\n" + errorInfo.issue[0]?.details?.text)
				} else {
					console.log("result: ", result)
                    const practiceName = Session.get("practices")[0]?.displayName
					alert(`Resource successfully imported to your ${practiceName}`)
				}
			  });
		}
    }
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
    patientMrn() {
        return Session.get("patientMrn")
    }
  })

  Template.resourceDocModal.onRendered( function () {
	const modalElement = this.find('#resourceDocModal');
	
	const instance = this;
	const parentInstance = instance.view.parentView.templateInstance();
	$(modalElement).on('hidden.bs.modal', function (event) {
    	const selectElement = parentInstance.find('.inputFindDoc');
	    $(selectElement).val('Select an Option');

		Session.set("showDocSaveModal", false);
        Session.set("showDocFhirModal", false);
        Session.set("showXMLModal", false);
        
        Session.set("emptyPdfData", false);
        Session.set("emptyXmlData", false);
	});
    console.log("currentDocPdf", this.data.currentDocPdf);
  })