import './currentPatient.html'
import './sidebar'
import './pdf-modal'
import './show-doc-modal'
import './search-doc-modal'

import { Template } from "meteor/templating"
import { Session } from "meteor/session"
import { ReactiveVar } from "meteor/reactive-var"
import { Meteor } from "meteor/meteor"
import { Router } from "meteor/iron:router"


const showPdfModal = async (data) => {
    console.log("emptyPdfData", Session.get("emptyPdfData"));
    console.log("data", data);
    // console.log("pdfUrl", data.resource?.presentedForm[0]?.url)
    if (Session.get("isFindingDoc")) return
    let pdfUrl = "";
    
	const isActive = Session.get("isActive")
    const facility = Session.get("facilities")[0]
    const practice = Session.get("practices")[0]
    const authToken = Session.get("headers");
    const coreUrl = () => {
        if (isActive === "hospital") {
            return facility.systems[0].coreUrl
        } else {
            return practice.systems[0].coreUrl
        }
    }
    if (!!data.resource.content || !!data.resource?.presentedForm) {
        if (Session.get("resourceType") === "DocumentReference") {
            const corePdf = data.resource?.content[0]?.attachment?.url.split("/")
            pdfUrl = coreUrl() + "Binary/" + corePdf[corePdf.length - 1];
            // pdfUrl = data.resource?.content[0]?.attachment?.url
        } else if (Session.get("resourceType") === "DiagnosticReport") {
            const corePdf = data.resource?.presentedForm[0]?.url.split("/");
            pdfUrl = coreUrl() + "Binary/" + corePdf[corePdf.length - 1];
        }
    } else {
        Session.set("emptyPdfData", true);
        $('#docPdfModal').modal('show');
        return;
    }
    Session.set("isFindingDoc", true);
    // console.log("isFindingDoc", Session.get("isFindingDoc"))
    
    console.log("pdfUrl", pdfUrl);
    
    const requestOption  = { Authorization: authToken };

      return new Promise(function (resolver, reject) {
        Meteor.call(
            "getPdfXml",
            pdfUrl,
            requestOption,
            (error, result) => {
                if (error) {
                    console.log("getPdfError", error);
                    reject(error);
                } else if (result?.statusCode === 200) {
                    console.log("getPdf", result);

                    const base64Data = atob(result?.data?.rawResource?.data);
                    
                        const uint8Array = new Uint8Array(base64Data.length);
                        for (let i = 0; i < base64Data.length; i++) {
                            uint8Array[i] = base64Data.charCodeAt(i);
                        }
                        const blob = new Blob([uint8Array], { type: 'application/pdf' });
                        const pdfDataUrl = URL.createObjectURL(blob);
                        Session.set("pdfDataUrl", pdfDataUrl);
                        Session.set("isFindingDoc", false);
                        Session.set("emptyPdfData", false);
                        $('#docPdfModal').modal('show');
                } else {
                    Session.set("isFindingDoc", false);
                    Session.set("emptyPdfData", true);
                    $('#docPdfModal').modal('show');
                }
            }
        )
    }).catch((error) => {

    });
    //   try {
    //     const response = await fetch(pdfUrl, requestOptions);
    //         console.log("response", response);
    //         if (!response.ok) {
    //         throw new Error(`Failed to fetch PDF: ${response.status} ${response.statusText}`);
    //         }
        
    //     const blob = await response.blob();
    //     const pdfDataUrl = URL.createObjectURL(blob);
        
    //     Session.set("isFindingDoc", false);
    //     Session.set("emptyPdfData", false);
    //     Session.set("pdfDataUrl", pdfDataUrl);
    //     $('#docPdfModal').modal('show');
    //   } catch (error) {
    //     console.log('fetchPDF', error);
    //     // Handle the error as needed
    //   }

    
}

const showXmlModal = async (data) => {
    
    let xmlUrl = "";
	const isActive = Session.get("isActive")
    const facility = Session.get("facilities")[0]
    const practice = Session.get("practices")[0]
    const authToken = Session.get("headers");
    const coreUrl = () => {
        if (isActive === "hospital") {
            return facility.systems[0].coreUrl
        } else {
            return practice.systems[0].coreUrl
        }
    }
    console.log("dataXML", data);
    if (!!data.resource?.content || !!data.resource?.presentedForm) {
        if (Session.get("resourceType") === "DocumentReference") {
            // xmlUrl = data.resource?.content[0]?.attachment?.url
            const coreXml = data.resource?.content[1]?.attachment?.url.split("/");
            xmlUrl = coreUrl() + "Binary/" + coreXml[coreXml.length - 1];
        } else if (Session.get("resourceType") === "DiagnosticReport") {
            const coreXml = data.resource?.presentedForm[1]?.url.split("/");
            xmlUrl = coreUrl() + "Binary/" + coreXml[coreXml.length - 1];

        }
    } else {
        Session.set("emptyXmlData", true);
        $('#resourceDocModal').modal('show');
        return;
    }
    Session.set("isFindingDoc", true);
            
    console.log("xmlUrl", xmlUrl);
    
    const requestOption  = { Authorization: authToken };

      return new Promise(function (resolver, reject) {
        Meteor.call(
            "getPdfXml",
            xmlUrl,
            requestOption,
            (error, result) => {
                if (error) {
                    console.log("getXmlError", error);
                    reject(error);
                } else if (result?.statusCode === 200) {
                    console.log("getXml", result);
                    
                    const base64Data = result?.data?.rawResource?.data;
                    if (base64Data) {
                      const decodedData = atob(base64Data);
                      const parser = new DOMParser();
                      const xmlData = parser.parseFromString(decodedData, "application/xml");
                      const xmlString = new XMLSerializer().serializeToString(xmlData);
                      const xmlStringify = JSON.stringify(xmlString, null, 2)
                      console.log("xmlData", xmlStringify);
                      Session.set("docXMLModalData", xmlStringify);
                      Session.set("isFindingDoc", false);
                      Session.set("showXMLModal", true);
                      $('#resourceDocModal').modal('show');
                      return xmlStringify
                    }
                } else {
                    Session.set("isFindingDoc", false);
                    Session.set("emptyXmlData", true);
                    $('#resourceDocModal').modal('show');
                }
            }
        )
    }).catch((error) => {

    });

}

Template.currentPatient.onCreated(function currentPatientOnCreated() {
    Session.set("isFindingDoc", false);
    Session.set("filterCount", "10");
});

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
    resourceType() {
        return  Session.get("resourceType");
    },
    searchResult() {
        return Session.get("searchResult");
    }
});


Template.currentPatient.events({
    async 'click #textRawDoc' (event, instance) {
        await showPdfModal(this);
    },
    async 'change .inputFindDoc'(event, instance) {
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
          showXmlModal(this);
        
        }
        
    
    },
    'click .btn-show-search-doc-modal' (event, instance) {
        $("#findDocModal").modal("show");
    }
});

Template.currentPatient.onRendered( function (){
    
});
