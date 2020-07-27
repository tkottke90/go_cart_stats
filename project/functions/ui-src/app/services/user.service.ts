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
    const user = await FirebaseService.getCurrentUser() as firebase.User;

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

  public static async getUserDetails() {
    // Get user signed in
    const firebaseUser = await FirebaseService.getCurrentUser();

    // If no user signed in return false;
    if (!firebaseUser) {
      return false;
    }

    const user = firebaseUser as firebase.User;
      const response = await HTTPService.get(`/users/${user.uid}`).toPromise();
      
      if (response.status !== 200) {
        throw new Error(await response.json());
      }

      const userDetails = await response.json();
  
      return {
        ...userDetails,
        id: user.uid,
        email: user.email,
        displayName: user.displayName
      }
  }
}