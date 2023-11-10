import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';

Meteor.startup(() => {
  // code to run on server at startup
});

const baseUrl = Meteor.settings.public.LOGIN_BASE_URL

Meteor.methods({
  loginUser: function (username, password) {
    // Make an HTTP POST request to the authorize API endpoint
    const requestUrl = baseUrl + "authorize";
    console.log("requestUrl", requestUrl)
    try {
      const response = HTTP.post(requestUrl, {
        data: {
          userName: username,
          password: password
        }
      });

      return response.data;

    } catch (error) {
      console.error("Error fetching tagline:", error);
      throw new Meteor.Error('login', 'Network connection Error!');
    }

  },
  getTagLine: function() {
    // Make an HTTP GET request to the getTagLine API endpoint
    
    const requestUrl = baseUrl + "/TagLine";
    try {
      const res = HTTP.get(requestUrl);
      // const { data } = res;
      return res;
    } catch (error) {
      console.error("Error fetching tagline:", error);
      throw new Meteor.Error('tagline-fetch-failed', 'Failed to fetch tagline');
    }
  },
  async patientTestQuery(url, headers) {
    console.log("patientTestQuery")
    try {
      console.log("patientTestQuery-url:", url)
      console.log("patientTestQuery-headers : ", headers);
      const response = await HTTP.get(url, { headers });
      
      const { data } = response;
      data.bundle.entry = data.bundle.entry.map(e => {
        let title = data.resourceType;
        if (data.resourceType === "DocumentReference") {
          title = "Document Reference"
        } else if (data.resourceType === "DiagnosticReport") {
          title = "Diagnostic Report"
        }
          
        e.resource.text.div = e.resource.text.div.split(`<p><b>${title}</b></p>`).join("")
        return {...e, text: e.resource.text}
        });
      console.log("Response data: ", data.bundle.entry[0]);
      return data;
    } catch (e) {
      console.log("ERROR ", e);
      throw new Meteor.Error(e)
    }
  }
});