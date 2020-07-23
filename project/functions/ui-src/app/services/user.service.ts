import FirebaseService from './firebase.service';


export default class UserService {

  public static getUser() {
    return FirebaseService.currentUser();
  }

  public static login(username: string, password: string) {
    return FirebaseService.signInWithUNPW(username, password);
  }

  public static loginWithGoogle() {
    return FirebaseService.signInWIthGoogle();
  }

  public static logout() {
    return FirebaseService.signOut();
  }
}