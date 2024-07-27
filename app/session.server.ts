import { createCookieSessionStorage, redirect } from "@remix-run/node";
import invariant from "tiny-invariant";

import type { User } from "~/models/user.server";
import { getUserById } from "~/models/user.server";
import type { Team } from "~/models/team.server";
import { getTeamById } from "~/models/team.server"; 

// Ensure SESSION_SECRET is set
invariant(process.env.SESSION_SECRET, "SESSION_SECRET must be set");

// Create session storage
export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secrets: [process.env.SESSION_SECRET],
    secure: process.env.NODE_ENV === "production",
  },
});

const USER_SESSION_KEY = "userId";
const TEAM_SESSION_KEY = "teamId";

// Get session from request
export async function getSession(request: Request) {
  const cookie = request.headers.get("Cookie");
  return sessionStorage.getSession(cookie);
}

// Get team ID from session
export async function getTeamId(request: Request): Promise<Team["id"] | undefined> {
  const session = await getSession(request);
  const teamId = session.get(TEAM_SESSION_KEY);
  return teamId;
}

// Get user ID from session
export async function getUserId(request: Request): Promise<User["id"] | undefined> {
  const session = await getSession(request);
  const userId = session.get(USER_SESSION_KEY);
  return userId;
}

// Get team from session
export async function getTeam(request: Request) {
  const teamId = await getTeamId(request);
  if (teamId === undefined) return null;

  const team = await getTeamById(teamId);
  if (team) return team;

  throw await logout(request);
}

// Require team ID
export async function requireTeamId(request: Request, redirectTo: string = new URL(request.url).pathname) {
  const teamId = await getTeamId(request);
  if (!teamId) {
    const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
    throw redirect(`/login?${searchParams}`);
  }
  return teamId;
}

// Require team
export async function requireTeam(request: Request) {
  const teamId = await requireTeamId(request);

  const team = await getTeamById(teamId);
  if (team) return team;

  throw await logout(request);
}

// Create team session
export async function createTeamSession({
  request,
  teamId,
  remember,
  redirectTo,
}: {
  request: Request;
  teamId: string;
  remember: boolean;
  redirectTo: string;
}) {
  const session = await getSession(request);
  session.set(TEAM_SESSION_KEY, teamId);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await sessionStorage.commitSession(session, {
        maxAge: remember ? 60 * 60 * 24 * 7 : undefined, // 7 days
      }),
    },
  });
}

// Logout function
export async function logout(request: Request) {
  const session = await getSession(request);
  return redirect("/", {
    headers: {
      "Set-Cookie": await sessionStorage.destroySession(session),
    },
  });
}

// Get user from session
export async function getUser(request: Request) {
  const userId = await getUserId(request);
  if (userId === undefined) return null;

  const user = await getUserById(userId);
  if (user) return user;

  throw await logout(request);
}

// Require user ID
export async function requireUserId(request: Request, redirectTo: string = new URL(request.url).pathname) {
  const userId = await getUserId(request);
  if (!userId) {
    const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
    throw redirect(`/login?${searchParams}`);
  }
  return userId;
}

// Require user
export async function requireUser(request: Request) {
  const userId = await requireUserId(request);

  const user = await getUserById(userId);
  if (user) return user;

  throw await logout(request);
}

// Create user session
export async function createUserSession({
  request,
  userId,
  remember,
  redirectTo,
}: {
  request: Request;
  userId: string;
  remember: boolean;
  redirectTo: string;
}) {
  const session = await getSession(request);
  session.set(USER_SESSION_KEY, userId);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await sessionStorage.commitSession(session, {
        maxAge: remember ? 60 * 60 * 24 * 7 : undefined, // 7 days
      }),
    },
  });
}
