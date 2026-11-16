
import {
  IUserRepository,
  UserData,
} from "../repositories/UserRepository";

export class UserService {
  constructor(
    private readonly userRepository: IUserRepository
  ) {}

  async getAllUsers() {
    return this.userRepository.getAll();
  }

  async getUserById(id: number) {
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error("ID invalid");
    }

    return this.userRepository.getById(id);
  }

  async addUser(data: UserData) {
    if (!data.name.trim() || !data.email.trim()) {
      throw new Error("Numele si emailul sunt obligatorii");
    }

    return this.userRepository.create(data);
  }

  async updateUser(id: number, data: UserData) {
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error("ID invalid");
    }

    return this.userRepository.update(id, data);
  }
}
