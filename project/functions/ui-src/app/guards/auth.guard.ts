import FirebaseService from '../services/firebase.service';

export default async function() {
  return await FirebaseService.getCurrentUser();
}