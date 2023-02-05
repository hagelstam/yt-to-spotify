import { Button } from "@mui/joy";
import { useQuery } from "@tanstack/react-query";
import { getUsers } from "./api/users";

const App = () => {
  const {
    isLoading,
    isError,
    data: users,
  } = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
  });

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error</div>;

  return (
    <>
      <Button variant="solid">Hello World</Button>
      {users.map((user) => (
        <div key={user.id}>
          <p>{user.name}</p>
          <p>{user.email}</p>
        </div>
      ))}
    </>
  );
};

export default App;
