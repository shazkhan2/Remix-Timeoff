import { prisma } from "~/db.server";
export type { Team } from "@prisma/client";

export async function getTeamById(id: number): Promise<Team | null> {
  return prisma.team.findUnique({ where: { id } });
}

export async function createTeam(title: string, code: string): Promise<Team> {
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
