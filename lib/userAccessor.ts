
import {
  UserRepository,
  UserData,
} from "./repositories/UserRepository";


import { UserService } from "./services/UserService";
const userRepository = new UserRepository();

// Dependency Injection:
// transmitem repository-ul catre service
const userService = new UserService(userRepository);

export async function getAllUsers() {
  return userService.getAllUsers();
}

export async function getUserById(id: number) {
  return userService.getUserById(id);
}

export async function addUser(data: UserData) {
  return userService.addUser(data);
}

export async function updateUser(
  id: number,
  data: UserData
) {
  return userService.updateUser(id, data);
}
export async function deleteUser(id: number) {
  return userService.deleteUser(id);
}
