import { prisma } from "~/db.server";
export type { Team } from "@prisma/client";

function generateRandomCode(length: number = 6): string {
  return Math.random().toString(36).substring(2, 2 + length).toUpperCase();
}

export async function getTeamById(id: number): Promise<Team | null> {
  return prisma.team.findUnique({
    where: { id },
    include: { members: true }
  });
}

export async function createTeam(title: string): Promise<Team> {
  const code = generateRandomCode(); 

  return prisma.team.create({
    data: {
      title,
      code,
      // created_date: new Date(),
    },
  });
}

export async function deleteTeamById(id: number): Promise<Team> {
  return prisma.team.delete({ where: { id } });
}

export async function addMembersToTeam(teamId: number, memberIds: string[]) {
  return prisma.team.update({
    where: { id: teamId },
    data: {
      members: {
        connect: memberIds.map(id => ({ id })),
      },
    },
    include: { members: true },
  });
}

export async function removeMemberFromTeam(teamId: number, memberId: string) {
  return prisma.team.update({
    where: { id: teamId },
    data: {
      members: {
        disconnect: { id: memberId },
      },
    },
    include: { members: true },
  });
}

export async function verifyTeamLogin(teamName: string, teamCode: string) {
  const team = await prisma.team.findFirst({
    where: { title: teamName },
  });

  if (!teamName || team.code !==teamCode) {
    return null;
  }

  return team;
}
