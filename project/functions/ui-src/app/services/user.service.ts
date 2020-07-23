import FirebaseService from './firebase.service';


export default class UserService {

  public static login(username, password) {
    return FirebaseService.signInWithUNPW(username, password);
  }

  public static loginWithGoogle() {
    return FirebaseService.signInWIthGoogle();
  }

  public static logout() {
    return FirebaseService.signOut();
  }
}