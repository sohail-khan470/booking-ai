-- CreateTable
CREATE TABLE `StaffSchedule` (
    `scheduleId` INTEGER NOT NULL AUTO_INCREMENT,
    `staffId` INTEGER NOT NULL,
    `dayOfWeek` ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
    `startTime` TIME NOT NULL,
    `endTime` TIME NOT NULL,
    `isAvailable` BOOLEAN NOT NULL DEFAULT true,

    INDEX `StaffSchedule_staffId_dayOfWeek_idx`(`staffId`, `dayOfWeek`),
    PRIMARY KEY (`scheduleId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Customer` (
    `customerId` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `phoneNumber` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,

    UNIQUE INDEX `Customer_phoneNumber_key`(`phoneNumber`),
    UNIQUE INDEX `Customer_email_key`(`email`),
    PRIMARY KEY (`customerId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Staff` (
    `staffId` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `role` VARCHAR(191) NULL,

    UNIQUE INDEX `Staff_name_key`(`name`),
    PRIMARY KEY (`staffId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Appointment` (
    `appointmentId` INTEGER NOT NULL AUTO_INCREMENT,
    `customerId` INTEGER NOT NULL,
    `serviceId` INTEGER NOT NULL,
    `staffId` INTEGER NOT NULL,
    `appointmentDate` DATETIME(3) NOT NULL,
    `status` ENUM('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED') NOT NULL DEFAULT 'PENDING',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Appointment_appointmentDate_idx`(`appointmentDate`),
    PRIMARY KEY (`appointmentId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Service` (
    `serviceId` INTEGER NOT NULL AUTO_INCREMENT,
    `serviceName` VARCHAR(100) NOT NULL,
    `description` TEXT NULL,
    `duration` INTEGER NOT NULL,
    `price` DOUBLE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Service_serviceName_key`(`serviceName`),
    PRIMARY KEY (`serviceId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Slot` (
    `slotId` INTEGER NOT NULL AUTO_INCREMENT,
    `staffId` INTEGER NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `startTime` DATETIME(3) NOT NULL,
    `endTime` DATETIME(3) NOT NULL,
    `isBooked` BOOLEAN NOT NULL DEFAULT false,

    INDEX `Slot_staffId_date_idx`(`staffId`, `date`),
    UNIQUE INDEX `Slot_staffId_date_startTime_key`(`staffId`, `date`, `startTime`),
    PRIMARY KEY (`slotId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CallLog` (
    `callLogId` INTEGER NOT NULL AUTO_INCREMENT,
    `callId` VARCHAR(191) NOT NULL,
    `phoneNumber` VARCHAR(191) NULL,
    `transcript` VARCHAR(191) NULL,
    `recordingUrl` VARCHAR(191) NULL,
    `cost` DOUBLE NULL,
    `status` VARCHAR(191) NOT NULL,
    `appointmentId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `CallLog_callId_key`(`callId`),
    PRIMARY KEY (`callLogId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `StaffSchedule` ADD CONSTRAINT `StaffSchedule_staffId_fkey` FOREIGN KEY (`staffId`) REFERENCES `Staff`(`staffId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Appointment` ADD CONSTRAINT `Appointment_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `Customer`(`customerId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Appointment` ADD CONSTRAINT `Appointment_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `Service`(`serviceId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Appointment` ADD CONSTRAINT `Appointment_staffId_fkey` FOREIGN KEY (`staffId`) REFERENCES `Staff`(`staffId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Slot` ADD CONSTRAINT `Slot_staffId_fkey` FOREIGN KEY (`staffId`) REFERENCES `Staff`(`staffId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CallLog` ADD CONSTRAINT `CallLog_appointmentId_fkey` FOREIGN KEY (`appointmentId`) REFERENCES `Appointment`(`appointmentId`) ON DELETE CASCADE ON UPDATE CASCADE;
