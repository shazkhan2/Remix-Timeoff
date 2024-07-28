/*
  Warnings:

  - You are about to drop the column `created_date` on the `Team` table. All the data in the column will be lost.
  - You are about to drop the column `created_date` on the `TimeOff` table. All the data in the column will be lost.
  - You are about to drop the column `created_date` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Team` DROP COLUMN `created_date`,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `TimeOff` DROP COLUMN `created_date`,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `User` DROP COLUMN `created_date`;
