import User from "../interfaces/User";

const API_URL = import.meta.env.VITE_API_URL as string;

export const getUsers = async () => {
  const res = await fetch(`${API_URL}/api/users`);
  const data = (await res.json()) as User[];
  return data;
};
