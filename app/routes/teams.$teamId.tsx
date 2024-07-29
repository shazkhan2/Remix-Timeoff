
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, Form, Link } from "@remix-run/react";
import { useState } from "react";
import { getTeamById, addMembersToTeam, removeMemberFromTeam } from "~/models/team.server";
import { getAllUsers } from "~/models/user.server";
import { getNoteListItems } from "~/models/note.server";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const teamId = parseInt(params.teamId, 10);
  const team = await getTeamById(teamId);
  if (!team) {
    throw new Response("Not Found", { status: 404 });
  }
  
  const users = await getAllUsers();
  
  // Fetch notes for all team members
  const notesPromises = team.members.map(member =>
    getNoteListItems({ userId: member.id })
  );
  const notesResults = await Promise.all(notesPromises);
  
  // Flatten notes results
  const notes = notesResults.flat();

  return json({ team, users, notes });
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
  const { team, users, notes } = useLoaderData<typeof loader>();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // Filter notes based on selected user
  const filteredNotes = selectedUserId
    ? notes.filter(note => note.userId === selectedUserId)
    : notes;

  const handleUserChange = (userId: string) => {
    setSelectedUserId(userId);
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar for Users and Notes */}
      <div className="w-80 border-r bg-gray-50 p-4">
        <h2 className="text-xl font-bold">Team Users</h2>
        <ul>
          {team.members.map(user => (
            <li key={user.id}>
              <button
                onClick={() => handleUserChange(user.id)}
                className={`block p-2 ${selectedUserId === user.id ? 'bg-blue-200' : ''}`}
              >
                {user.email}
              </button>
            </li>
          ))}
        </ul>
        <hr />
        <h2 className="text-xl font-bold">Notes</h2>
        <ul>
          {filteredNotes.map(note => (
            <li key={note.id}>
              <Link
                to={`/notes/${note.id}`}
                className="block p-2"
              >
                📝 {note.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Right Side: Team Details */}
      <div className="flex-1 p-6">
        <h1 className="text-3xl font-bold">Team: {team.title}</h1>
        <p>Code: {team.code}</p>
        <p>Created Date: {new Date(team.created_date).toLocaleDateString()}</p>

        <Form method="post" className="flex flex-col items-center gap-y-4 mt-6">
          <select
            name="members"
            multiple
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
    </div>
  );
}
