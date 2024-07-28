/*
  Warnings:

  - You are about to drop the `Member` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `allowed_daysoff` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `created_date` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `daysoff` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `first_name` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `last_name` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Member` DROP FOREIGN KEY `Member_team_id_fkey`;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `allowed_daysoff` INTEGER NOT NULL,
    ADD COLUMN `created_date` DATETIME(3) NOT NULL,
    ADD COLUMN `daysoff` INTEGER NOT NULL,
    ADD COLUMN `first_name` VARCHAR(191) NOT NULL,
    ADD COLUMN `last_name` VARCHAR(191) NOT NULL,
    ADD COLUMN `team_id` INTEGER NULL;

-- DropTable
DROP TABLE `Member`;

-- CreateTable
CREATE TABLE `TimeOff` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `start_date` DATETIME(3) NOT NULL,
    `end_date` DATETIME(3) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `created_date` DATETIME(3) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_team_id_fkey` FOREIGN KEY (`team_id`) REFERENCES `Team`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TimeOff` ADD CONSTRAINT `TimeOff_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
