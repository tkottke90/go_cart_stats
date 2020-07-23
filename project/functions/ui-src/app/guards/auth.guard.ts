import UserService from '../services/user.service';

export default function() {
  return UserService.getUser();
}