/*
  Warnings:

  - You are about to alter the column `appointmentDate` on the `Appointment` table. The data in that column could be lost. The data in that column will be cast from `Time(0)` to `DateTime(3)`.
  - You are about to alter the column `startTime` on the `StaffSchedule` table. The data in that column could be lost. The data in that column will be cast from `Time(0)` to `DateTime(3)`.
  - You are about to alter the column `endTime` on the `StaffSchedule` table. The data in that column could be lost. The data in that column will be cast from `Time(0)` to `DateTime(3)`.

*/
-- AlterTable
ALTER TABLE `Appointment` MODIFY `appointmentDate` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `StaffSchedule` MODIFY `startTime` DATETIME(3) NOT NULL,
    MODIFY `endTime` DATETIME(3) NOT NULL;
