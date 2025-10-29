-- CreateTable
CREATE TABLE `CallLog` (
    `callLogId` INTEGER NOT NULL AUTO_INCREMENT,
    `callId` VARCHAR(191) NOT NULL,
    `phoneNumber` VARCHAR(191) NULL,
    `transcript` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL,
    `appointmentId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `CallLog_callId_key`(`callId`),
    INDEX `CallLog_phoneNumber_idx`(`phoneNumber`),
    INDEX `CallLog_callId_idx`(`callId`),
    PRIMARY KEY (`callLogId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `CallLog` ADD CONSTRAINT `CallLog_appointmentId_fkey` FOREIGN KEY (`appointmentId`) REFERENCES `Appointment`(`appointmentId`) ON DELETE CASCADE ON UPDATE CASCADE;
