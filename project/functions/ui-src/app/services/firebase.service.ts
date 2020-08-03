import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore'

export default class FirebaseService {

  public static getCurrentUser = () => {
    return new Promise((resolve, reject) => {
      const unsubscribe = firebase.auth().onAuthStateChanged( user => {
        unsubscribe();
        resolve(user);
      }, reject);
    });
  };

  public static init() {
    return new Promise(async (resolve, reject) => {
      console.log('init firebase');
      fetch('/__/firebase/init.json')
        .then(async response => {
          console.log('got config');
          firebase.initializeApp(await response.json());
          console.log('initialized');
          // As httpOnly cookies are to be used, do not persist any state client side.
          firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);
          resolve(true);
        })
        .catch( async error => {
          console.error('error starting firebase');
          reject(false);
        });

    });
  }

  public static currentUser(): firebase.User | null {
    return firebase.auth().currentUser;
  }

  public static signInWithUNPW(email: string, password: string): Promise<firebase.auth.UserCredential> {
    return firebase.auth().signInWithEmailAndPassword(email, password);
  }

  public static signInWIthGoogle(): Promise<firebase.auth.UserCredential> {
    const provider = new firebase.auth.GoogleAuthProvider();

    return firebase.auth().signInWithPopup(provider);
  }

  public static signOut(): Promise<void> {
    return firebase.auth().signOut();
  }

  public static $currentVotes() {
    const now = new Date();
    now.getUTCFullYear
    const docName = `${now.getUTCFullYear()}-${now.getUTCMonth() + 1}-${now.getUTCDate()}`;
    console.dir(docName);
    return firebase.firestore().collection('dailyVotes').doc(docName);
  }
}