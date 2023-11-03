import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';

Meteor.startup(() => {
  // code to run on server at startup
});

const baseUrl = "http://dev.vertisoft.com:30300/api/rest/v1"

Meteor.methods({
  loginUser: function (username, password) {
    // Make an HTTP POST request to the authorize API endpoint
    const requestUrl = baseUrl + "/authorize";
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
      throw new Meteor.Error('tagline-fetch-failed', 'Failed to fetch tagline');
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
      console.log("Response data: ", data.bundle.entry[0]);
      return data;
    } catch (e) {
      console.log("ERROR ", e);
      throw new Meteor.Error(e)
    }
  }
});