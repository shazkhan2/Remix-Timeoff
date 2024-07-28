
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, Form } from "@remix-run/react";
import { useState } from "react";
import { getTeamById, addMembersToTeam, removeMemberFromTeam } from "~/models/team.server";
import { getAllUsers } from "~/models/user.server";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const teamId = parseInt(params.teamId, 10);
  const team = await getTeamById(teamId);
  if (!team) {
    throw new Response("Not Found", { status: 404 });
  }
  const users = await getAllUsers(); // Fetch all users
  return json({ team, users });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const teamId = parseInt(formData.get("teamId") as string, 10);
  const userId = formData.get("userId");

  if (userId) {
    await removeMemberFromTeam(teamId, userId as string);
  } else {
    const userIds = formData.getAll("members").map(id => id as string);
    if (userIds.some(id => !id)) {
      throw new Error("Invalid user ID");
    }
    await addMembersToTeam(teamId, userIds);
  }
  return json({ success: true });

};

export default function TeamDetail() {
  const { team, users } = useLoaderData<typeof loader>();
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const options = event.target.options;
    const selected = Array.from(options)
      .filter(option => option.selected)
      .map(option => option.value);
    setSelectedUsers(selected);
  };

  return (
    <div className="flex min-h-screen flex-col items-center mt-10 gap-y-8">
      <h1><span className="text-2xl font-bold">Name: </span> {team.title}</h1>
      <p><span className="text-2xl font-bold">Code: </span> {team.code}</p>
      <p><span className="text-2xl font-bold">Created Date: </span>{new Date(team.created_date).toLocaleDateString()}</p>

      <Form method="post" className="flex flex-col items-center gap-y-4">
        <select
          name="members"
          multiple
          value={selectedUsers}
          onChange={handleSelectChange}
          className="w-full p-2 border border-gray-500 rounded"
        >
          {users.map(user => (
            <option key={user.id} value={user.id}>
              {user.email}
            </option>
          ))}
        </select>
        <input type="hidden" name="teamId" value={team.id} />
        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">Add Members</button>
      </Form>

      <div className="mt-8">
        <h2 className="text-xl font-bold">Team Members</h2>
        <ul className="list-disc">
          {team.members.map(user => (
            <li key={user.id}>
              {user.email}
              <Form method="post" className="inline">
                <input type="hidden" name="teamId" value={team.id} />
                <input type="hidden" name="userId" value={user.id} />
                <button type="submit" className="ml-2 text-red-500">Remove</button>
              </Form>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
