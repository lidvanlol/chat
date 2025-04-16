Welcome to Simple Chat Application that uses react native expo and convex for backend.
1.How to use
* TO use this app you should get repo on your machine and do this:
* Frontend run - npm run start 
* Backend run - npx convex dev to run localy convex database and npx convex deploy if you want to deploy db to server
* To run tests you should do command npm run test
* To run lint and format you can run npm run lint and npm run format
* For Backend to work when repo is on machine create .env.local file and put this inside
* CONVEX_DEPLOYMENT=dev:helpful-albatross-575 # team: filip-e571a, project: chat-1d2cc
* EXPO_PUBLIC_CONVEX_URL=https://helpful-albatross-575.convex.cloud
this is needed becouse of convex file for connection
2.*App will create Users based on device and then he can create chat room and join.Other users will see new chat room appear and they can join it to chat.
  *Qr Code is inside chat so user can scan it with device camera and then enter chat room.  
3.Notificions setup for ios we need to have apple account connected with expo eas and android needs to have google-services.json file from firebase and chat-file which is from google that is genereted trhough eas credentials.
  When that is downloaded we need to do this :
  First run npx expo prebuild --clean to create android and ios folder then run npx expo run:android or run:ios to build app as development.
  Notifications are setuped in Layout but they cant be triggered from backend and they are triggered througfh client

