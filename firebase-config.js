const firebaseConfig = {
    apiKey: "AIzaSyDRbeACKim-cIly8ymnwekMR4czcAXgvDA",
    authDomain: "moodboardz-d0cad.firebaseapp.com",
    databaseURL: "https://moodboardz-d0cad-default-rtdb.firebaseio.com",
    projectId: "moodboardz-d0cad",
    storageBucket: "moodboardz-d0cad.firebasestorage.app",
    messagingSenderId: "78488698227",
    appId: "1:78488698227:web:1eeceb4e97f922f6a89906"
  };

  firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth();
  const db = firebase.database();