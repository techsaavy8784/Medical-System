Meteor.methods({
    async patientQuery(url, headers) {
        console.log("patientQuery")
        try {
          console.log("patientQuery-url:", url)
          
          const response = await HTTP.get(url, { headers });
          
          console.log("patientQueryResponse: ", response.data)
    
          const { data } = response;
    
          if (!!data?.bundle?.entry) {
            data.bundle.entry = data.bundle?.entry.map(e => {
              let title = data.resourceType;
              if (data.resourceType === "DocumentReference") {
                title = "Document Reference"
              } else if (data.resourceType === "DiagnosticReport") {
                title = "Diagnostic Report"
              }
                
              e.resource.text.div = e.resource.text.div.split(`<p><b>${title}</b></p>`).join("")
              return {...e, text: e.resource.text}
            });
          }
        return data;
        } catch (e) {
          console.log("ERROR ", e);
          return e;
        }
      },
      async savePatient (url, body, headers) {
        console.log("savePatientRequestUrl", url);
        console.log("body and headers ", {data: body, headers: headers})
    
        try {
          const res = await HTTP.post(url, {data: body, headers: headers});
          // const { data } = res;
          console.log("savePatientRequestUrl", url);
          console.log("savePatientResponse: ", res);
          return res;
        } catch (error) {
          console.error("Error saving patient in practice!", error);
          throw new Meteor.Error('Error saving patient in practice!', error);
        }
      },
      async getPdf_Xml (url, headers) {
        try {
          console.log("GetPdfUrl", url);
          console.log("GetPdfHeaders", headers);
          const res = await HTTP.get(url, { headers });
          console.log("GetPdfResponse", res);
          return res;
        } catch (error) {
    
        }
      },
    });
