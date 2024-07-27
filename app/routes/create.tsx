import { useFetcher } from "@remix-run/react";
import type { Team } from "@prisma/client";

const CreateTeam = ({ setTeamsDatabase }) => {
  const fetcher = useFetcher();

  const handleCreateTeam = async () => {
    const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const newName = prompt("Enter new team name:");

    if (!newName) {
      return;
    }

    fetcher.submit(
      { team_name: newName, team_code: randomCode },
      { method: "post", action: "/api/teams" }
    );

    if (fetcher.state === "idle" && fetcher.data?.team) {
      setTeamsDatabase((prevTeams: Team[]) => [
        ...prevTeams,
        {
          id: fetcher.data.team.id,
          title: fetcher.data.team.title,
          code: fetcher.data.team.code,
          created_date: fetcher.data.team.created_date,
        },
      ]);
      window.alert(`New team created: ${newName} (Code: ${randomCode})`);
    }
  };

  return (
    <button className="button-create-team" onClick={handleCreateTeam}>Create Team</button>
  );
};

export default CreateTeam;
