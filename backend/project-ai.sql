-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               8.0.30 - MySQL Community Server - GPL
-- Server OS:                    Win64
-- HeidiSQL Version:             12.1.0.6537
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Dumping database structure for project
CREATE DATABASE IF NOT EXISTS `project` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `project`;

-- Dumping structure for table project.admin
CREATE TABLE IF NOT EXISTS `admin` (
  `email` varchar(50) NOT NULL,
  `password` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Data exporting was unselected.

-- Dumping structure for table project.detection
CREATE TABLE IF NOT EXISTS `detection` (
  `DetectID` int NOT NULL AUTO_INCREMENT,
  `UserID` int NOT NULL,
  `DateTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `TextID` int NOT NULL,
  `BgDetect` longtext COLLATE utf8mb4_general_ci NOT NULL,
  `FaceDetect` longtext COLLATE utf8mb4_general_ci NOT NULL,
  `Age` int DEFAULT NULL,
  `Gender` varchar(10) COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`DetectID`),
  KEY `text` (`TextID`),
  KEY `user` (`UserID`),
  CONSTRAINT `text` FOREIGN KEY (`TextID`) REFERENCES `emotionaltext` (`TextID`),
  CONSTRAINT `user` FOREIGN KEY (`UserID`) REFERENCES `user` (`UserID`)
) ENGINE=InnoDB AUTO_INCREMENT=1565 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Data exporting was unselected.

-- Dumping structure for table project.emotional
CREATE TABLE IF NOT EXISTS `emotional` (
  `EmoID` int NOT NULL AUTO_INCREMENT,
  `EmoName` varchar(250) COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`EmoID`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Data exporting was unselected.

-- Dumping structure for table project.emotionaltext
CREATE TABLE IF NOT EXISTS `emotionaltext` (
  `TextID` int NOT NULL AUTO_INCREMENT,
  `Text` text COLLATE utf8mb4_general_ci NOT NULL,
  `EmoID` int NOT NULL,
  PRIMARY KEY (`TextID`),
  KEY `emoid` (`EmoID`),
  CONSTRAINT `emoid` FOREIGN KEY (`EmoID`) REFERENCES `emotional` (`EmoID`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Data exporting was unselected.

-- Dumping structure for table project.user
CREATE TABLE IF NOT EXISTS `user` (
  `UserID` int NOT NULL,
  `Name` varchar(250) COLLATE utf8mb4_general_ci NOT NULL,
  `FaceIMG` text COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`UserID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Data exporting was unselected.

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
