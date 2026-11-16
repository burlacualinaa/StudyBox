
import { createMapper, createMap, forMember, mapFrom } from "@automapper/core";
import { classes } from "@automapper/classes";
import { UserDTO } from "./UserDTO";

export class UserSource {
  id: number = 0;
  name: string = "";
  email: string = "";
  role: string = "";
  active: boolean = true;
}

export const userMapper = createMapper({
  strategyInitializer: classes(),
});

createMap(
  userMapper,
  UserSource,
  UserDTO,
  forMember((dest) => dest.id, mapFrom((src) => src.id)),
  forMember((dest) => dest.name, mapFrom((src) => src.name)),
  forMember((dest) => dest.email, mapFrom((src) => src.email)),
  forMember((dest) => dest.role, mapFrom((src) => src.role)),
  forMember((dest) => dest.active, mapFrom((src) => src.active))
);
