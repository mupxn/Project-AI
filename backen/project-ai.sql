-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jan 31, 2024 at 01:05 PM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `project-ai`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin`
--

CREATE TABLE `admin` (
  `email` varchar(250) NOT NULL,
  `password` varchar(250) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admin`
--

INSERT INTO `admin` (`email`, `password`) VALUES
('admin@gmail.com', '12345');

-- --------------------------------------------------------

--
-- Table structure for table `detection`
--

CREATE TABLE `detection` (
  `DetectID` int(11) NOT NULL,
  `Date` date NOT NULL,
  `Time` time NOT NULL,
  `Age` int(3) NOT NULL,
  `UserID` int(11) NOT NULL,
  `TextID` int(11) NOT NULL,
  `Gender` int(11) NOT NULL,
  `BgDetect` text NOT NULL,
  `FaceDetect` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `emotional`
--

CREATE TABLE `emotional` (
  `EmoID` int(11) NOT NULL,
  `EmoName` varchar(250) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `emotional`
--

INSERT INTO `emotional` (`EmoID`, `EmoName`) VALUES
(1, 'happy'),
(2, 'sad'),
(3, 'surprise'),
(4, 'neutral'),
(5, 'angry'),
(6, 'fear');

-- --------------------------------------------------------

--
-- Table structure for table `emotionaltext`
--

CREATE TABLE `emotionaltext` (
  `TextID` int(11) NOT NULL,
  `Text` text NOT NULL,
  `EmoID` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `emotionaltext`
--

INSERT INTO `emotionaltext` (`TextID`, `Text`, `EmoID`) VALUES
(1, 'อารมณ์ดีนะครับ', 1),
(2, 'ดูแจ่มใสนะครับวันนี้', 1),
(5, 'วันนี้ดูสดชื่นดีจังครับ', 1),
(6, 'ดูแลสุขภาพด้วยนะครับ', 2),
(11, 'อย่าลืมทานข้าวให้ตรงเวลานะครับ', 2),
(12, 'ดูแลจิตใจตัวเองด้วยนะครับ', 2);

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `UserID` int(10) NOT NULL,
  `Name` varchar(250) NOT NULL,
  `FaceIMG` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`UserID`, `Name`, `FaceIMG`) VALUES
(1, 'noey', 'D:\\Project-AI\\backen\\data_set\\user\\001'),
(2, 'praew', 'D:\\Project-AI\\backen\\data_set\\user\\002');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin`
--
ALTER TABLE `admin`
  ADD PRIMARY KEY (`email`);

--
-- Indexes for table `detection`
--
ALTER TABLE `detection`
  ADD PRIMARY KEY (`DetectID`),
  ADD KEY `user` (`UserID`),
  ADD KEY `text` (`TextID`);

--
-- Indexes for table `emotional`
--
ALTER TABLE `emotional`
  ADD PRIMARY KEY (`EmoID`);

--
-- Indexes for table `emotionaltext`
--
ALTER TABLE `emotionaltext`
  ADD PRIMARY KEY (`TextID`),
  ADD KEY `emoid` (`EmoID`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`UserID`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `detection`
--
ALTER TABLE `detection`
  MODIFY `DetectID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `emotional`
--
ALTER TABLE `emotional`
  MODIFY `EmoID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `emotionaltext`
--
ALTER TABLE `emotionaltext`
  MODIFY `TextID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `detection`
--
ALTER TABLE `detection`
  ADD CONSTRAINT `text` FOREIGN KEY (`TextID`) REFERENCES `emotionaltext` (`TextID`),
  ADD CONSTRAINT `user` FOREIGN KEY (`UserID`) REFERENCES `user` (`UserID`);

--
-- Constraints for table `emotionaltext`
--
ALTER TABLE `emotionaltext`
  ADD CONSTRAINT `emoid` FOREIGN KEY (`EmoID`) REFERENCES `emotional` (`EmoID`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
