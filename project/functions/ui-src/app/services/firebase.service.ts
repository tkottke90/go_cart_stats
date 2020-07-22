import * as firebase from 'firebase/app';

import 'firebase/auth';
import 'firebase/analytics'

export default class FirebaseService {

  constructor() {
    firebase.initializeApp({});
  }

  public static signInWithUNPW(email: string, password: string) {
    return firebase.auth().signInWithEmailAndPassword(email, password);
  }

  public static async signInWIthGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    
    try {
      const loginAttempt = firebase.auth().signInWithPopup(provider);
    
    } catch (err) {
      console.error(err);
      firebase.analytics().logEvent('exception', { error: err });
      return false;
    }
  }

  public static signOut() {
    return firebase.auth().signOut();
  }
}