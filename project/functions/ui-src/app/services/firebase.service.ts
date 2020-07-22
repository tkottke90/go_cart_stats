import * as firebase from 'firebase/app';

import 'firebase/auth';
import 'firebase/analytics'

export class FirebaseService {

  constructor() {
    firebase.initializeApp({});
  }

  signInWithUNPW(email: string, password: string) {
    return firebase.auth().signInWithEmailAndPassword(email, password);
  }

  async signInWIthGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    
    try {
      const loginAttempt = firebase.auth().signInWithPopup(provider);
    
    } catch (err) {
      console.error(err);
      firebase.analytics().logEvent('exception', { error: err });
      return false;
    }
  }

  signOut() {
    return firebase.auth().signOut();
  }
}