import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getTeamById } from "~/models/team.server";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const teamId = parseInt(params.teamId, 10);
  const team = await getTeamById(teamId);
  if (!team) {
    throw new Response("Not Found", { status: 404 });
  }
  return json({ team });
};

export default function TeamDetail() {
  const { team } = useLoaderData<typeof loader>();

  return (
    <div>
      <h1>{team.title}</h1>
      <p>Code: {team.code}</p>
      <p>Created Date: {new Date(team.created_date).toLocaleDateString()}</p>
    </div>
  );
}
