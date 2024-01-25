# Universal Chart

Universal Chart is a platform that allows local practices to sync patients' data between remote/local easily and securely.

#### **** If duplicate code is noticed in the application, especially in resources, please don't refactor it, before discussing it with the project owner, as it's intentional and added as per the project owner's instructions

<br>

## Running the Application

1. Install Meteor.js https://docs.meteor.com/install.html
2. Install application dependencies

~~~
meteor npm install
~~~

3. Run the server

~~~
meteor --settings settings.json
~~~

4. Go to http://localhost:3000/

<br>

## Project Information

#### January 2023

- Live: http://universalcharts.com/
- Stack: Meteor and Blaze
- Last Updated At: 12/01/2024
- Meteor Version: 2.13.3

<br>

## How to add your contribution?
- preferred branch names to be either by the programmer or by large project scope
- Preferred is your initials. That is why you see `dhf` and `dhfDev`
- make sure to prevent the docker build error by making a local docker build before the code push
- you must stop local mongodb if running on machine, else it will throw the same port error
- `docker compose up`

<br>

### Folder Structure

#### Top level folders

| Name | Details |
| ------ | ----------- |
| Client   | **Client** folder has only 3 root level files which are `main.html` `main.css` and `main.js` |
| Imports | **Imports** have all the application data files which can be imported in any files vs `/imports` details of imports folder given separately below. |
| Server | **Server** folder has only 1 root level file named `main.js` which is the entry point for server-only code |
| Docker | **docker** folder has only docker-related files. |

<br>

## Imports Folder

```
Imports

-- api
---- miscellaneous            # it contains old mix server methods.
---- patients                 # it contains patients-server methods.
---- users                    # it contains users related server methods.

-- helpers                    # application-level helpers function categorized by functionality.

-- startup                    # it has both client and server startup code.
---- client
------ index.js               # client startup index file. all UI templates imported here
------ routes.js              # router configuration file
---- server
------ index.js               # server startup index file
------ register-api.js        # All server methods are registered here

-- ui
---- common                     # common has all common templates like `PDFModal` `header` etc
---- home
---- login
---- patients                   # patients folder has patient related templates like `find-patient` and `current-patient` etc
---- resources                  # it has all types of resources and their isolated models so any change in one resource has no side effects on other resources

---- utils
------ globalHelpers            # these are global UI helpers like `isAdmin` and can be injected into any template (should be Pure functions) 

-- utils
---- constants                  # it has application level constans like `baseUrl` etc
```

### Methods (server Side)
Methods are the server-side functions that the Application uses to talk with any 3rd party API/services, so the current flow is a client calls the server-side method, and the server-side method talks with 3rd party URL and sends the result back to the client and the client display the changes, the client should never call any 3rd party API/URL directly

### Session Values

1. activeLocalPatient
2. activeRemotePatient
3. activeResourceType
4. coreURL
5. currentPatientInfo
6. currentPatientSelected
7. isActive
8. isLogin
9. locals
10. remotes
11. localSavedData
12. remoteSavedData
13. remoteURL
14. localURL
15. userInfo
