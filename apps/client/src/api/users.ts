import User from "../interfaces/User";

export const getUsers = async () => {
  const res = await fetch("http://localhost:8080/api/users");
  const data = (await res.json()) as User[];
  return data;
};
