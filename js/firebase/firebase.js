
 'use strict' //modo estrito

/********************************************** 
* Renomeie este arquivo para firebase.js!
***********************************************/

// Cole as informações do seu RealTime Database do Firebase abaixo:
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
//   apiKey: "AIzaSyDgAzWRM6_hlwQVvlLYONQ6YP7UX5ypzf4",
//   authDomain: "crud-firebase-vanilla-js1.firebaseapp.com",
//   databaseURL: "https://crud-firebase-vanilla-js1-default-rtdb.firebaseio.com",
//   projectId: "crud-firebase-vanilla-js1",
//   storageBucket: "crud-firebase-vanilla-js1.appspot.com",
//   messagingSenderId: "168460464295",
//   appId: "1:168460464295:web:34c307d2d029571c98eb82",
//   measurementId: "G-SEY00EHFXP"
// };

  // Your web app's Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyDgkUZCCkXJajq6QwJrbkCvNt_fQMJ76V4",
    authDomain: "sgafirebase-c3586.firebaseapp.com",
    databaseURL: "https://sgafirebase-c3586-default-rtdb.firebaseio.com",
    projectId: "sgafirebase-c3586",
    storageBucket: "sgafirebase-c3586.appspot.com",
    messagingSenderId: "1054886444777",
    appId: "1:1054886444777:web:d05cd51ede0f52a0787a78"
  };

// Inicializando o Firebase
firebase.initializeApp(firebaseConfig);
// Crie uma referência para o Realtime Database do Firebase
const database = firebase.database();
// Crie uma referência para o armazenamento do Firebase
const storageRef = firebase.storage().ref();
