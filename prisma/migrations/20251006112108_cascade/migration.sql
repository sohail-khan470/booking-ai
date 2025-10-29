-- DropForeignKey
ALTER TABLE `Appointment` DROP FOREIGN KEY `Appointment_customerId_fkey`;

-- DropForeignKey
ALTER TABLE `Appointment` DROP FOREIGN KEY `Appointment_serviceId_fkey`;

-- DropForeignKey
ALTER TABLE `Appointment` DROP FOREIGN KEY `Appointment_staffId_fkey`;

-- DropIndex
DROP INDEX `Appointment_customerId_fkey` ON `Appointment`;

-- DropIndex
DROP INDEX `Appointment_serviceId_fkey` ON `Appointment`;

-- DropIndex
DROP INDEX `Appointment_staffId_fkey` ON `Appointment`;

-- AddForeignKey
ALTER TABLE `Appointment` ADD CONSTRAINT `Appointment_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `Customer`(`customerId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Appointment` ADD CONSTRAINT `Appointment_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `Service`(`serviceId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Appointment` ADD CONSTRAINT `Appointment_staffId_fkey` FOREIGN KEY (`staffId`) REFERENCES `Staff`(`staffId`) ON DELETE CASCADE ON UPDATE CASCADE;
