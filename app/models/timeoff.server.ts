import { TimeOff } from "@prisma/client";
import { prisma } from "~/db.server";
export type { User, TimeOff } from "@prisma/client";


export async function createTimeOff({
    startDate,
    endDate,
    description,
    userId,
  }: {
    startDate: string;
    endDate: string;
    description: string;
    userId: string; 
  }): Promise<TimeOff> {
    return prisma.timeOff.create({
      data: {
        start_date: new Date(startDate),
        end_date: new Date(endDate),
        description,
        user_id: userId, 
      },
    });
  }

  export async function deleteTimeoffById(id: number): Promise<TimeOff> {
    return prisma.timeOff.delete({ where: { id } });
  }

  export async function getTimeoffById(id: number): Promise<TimeOff | null> {
  return prisma.timeOff.findUnique({
    where: { id },
    include: { user: true }
  });
}

export async function updateTimeOff({
    id,
    startDate,
    endDate,
    description,
  }: {
    id: number;
    startDate: string; 
    endDate: string;
    description?: string;
  }): Promise<TimeOff> {
    return prisma.timeOff.update({
      where: { id },
      data: {
        start_date: startDate ? new Date(startDate) : undefined,
        end_date: endDate ? new Date(endDate) : undefined,
        description: description,
      },
    });
  }