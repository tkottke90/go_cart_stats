import FirebaseService from '../services/firebase.service';
import { Router } from '../router';

export default async function(route: any, context: any, next: any) {
  const user = await FirebaseService.getCurrentUser();

  if (!user) {
    Router.navigate('/login');
    return;
  }

  next();
}