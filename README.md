Welcome to Simple Chat Application that uses react native expo and convex for backend.
1.How to use
* TO use this app you should get repo on your machine and do this:
* Frontend run - npm run start 
* Backend run - npx convex dev to run localy convex database and npx convex deploy if you want to deploy db to server
* To run tests you should do command npm run test
* To run lint and format you can run npm run lint and npm run format
2.*App will create Users based on device and then he can create chat room and join.Other users will see new chat room appear and they can join it to chat.
  *Qr Code is inside chat so user can scan it with device camera and then enter chat room.  
3.Notificions setup for ios we need to have apple account connected with expo eas and android needs to have google-services.json file from firebase and chat-file which is from google that is genereted trhough eas credentials.
  I had to delete mine credetentials for google so you have to create your own.First create project on firebase then create webapp and android app 
  When that is downloaded we need to do this : first run npx expo install firebase then create firebase file 
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
Then for google.services.json we need it to load inside expo to app.json file 
"android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "googleServicesFile": "./google-services.json",
      "permissions": [
        "android.permission.CAMERA",
        "android.permission.RECORD_AUDIO"
      ],
      "package": "com.filipj90.chat"
    },

  First run npx expo prebuild --clean to create android and ios folder then run npx expo run:android or run:ios to build app as development.
  Notifications are setuped in Layout but they cant be triggered from backend and they are triggered througfh client
  Notification is improvised on client with useEffect when users enters chat and he recives messege that way becouse i could not solve to get notification from backend.

