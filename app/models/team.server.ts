import { prisma } from "~/db.server";
export type { Team } from "@prisma/client";

function generateRandomCode(length: number = 6): string {
  return Math.random().toString(36).substring(2, 2 + length).toUpperCase();
}

export async function getTeamById(id: number): Promise<Team | null> {
  return prisma.team.findUnique({ where: { id } });
}

export async function createTeam(title: string): Promise<Team> {
  const code = generateRandomCode(); 

  return prisma.team.create({
    data: {
      title,
      code,
      created_date: new Date(),
    },
  });
}

export async function deleteTeamById(id: number): Promise<Team> {
  return prisma.team.delete({ where: { id } });
}
