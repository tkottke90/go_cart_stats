import firebase from 'firebase/app';

fetch('/__/firebase/init.json').then(async response => {
  firebase.initializeApp(await response.json());

  // As httpOnly cookies are to be used, do not persist any state client side.
  firebase.auth().setPersistence(firebase.auth.Auth.Persistence.NONE);
});

import 'firebase/auth';

export default class FirebaseService {

  public static currentUser(): firebase.User | null {
    return firebase.auth().currentUser;
  }

  public static signInWithUNPW(email: string, password: string): Promise<firebase.auth.UserCredential> {
    console.log(email, password);

    return firebase.auth().signInWithEmailAndPassword(email, password);
  }

  public static signInWIthGoogle(): Promise<firebase.auth.UserCredential> {
    const provider = new firebase.auth.GoogleAuthProvider();

    return firebase.auth().signInWithPopup(provider);
  }

  public static signOut(): Promise<void> {
    return firebase.auth().signOut();
  }
}