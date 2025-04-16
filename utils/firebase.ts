import { initializeApp } from 'firebase/app';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyDw7PdVjKn8-fexkGIbkhfgEsQ2FfmVBt0',
  authDomain: 'chat-ec2da.firebaseapp.com',
  projectId: 'chat-ec2da',
  storageBucket: 'chat-ec2da.firebasestorage.app',
  messagingSenderId: '909157587410',
  appId: '1:909157587410:web:fa965bed07b6cbd39b500b',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export { app };
