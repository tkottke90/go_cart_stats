import FirebaseService from './firebase.service';
import HTTPService from './http.service';

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

  public static async checkSession() {
    return HTTPService.get('/auth/status').toPromise();;
  }

  public static async getSession() {
    const user = this.getUser();

    if (!user) {
      return;
    }

    const tokenId = await user.getIdToken();
    const headers = new Headers();
    headers.set('Content-Type', 'application/json');
    return HTTPService.post('/auth/sessionLogin', { tokenId }, headers).toPromise();
  }

  public static logout() {
    return FirebaseService.signOut();
  }
}