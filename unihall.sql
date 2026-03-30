-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jan 22, 2026 at 06:30 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `unihall`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin_profiles`
--

CREATE TABLE `admin_profiles` (
  `userId` char(36) NOT NULL,
  `designation` varchar(100) NOT NULL,
  `department` varchar(100) NOT NULL,
  `hallId` char(36) DEFAULT NULL,
  `officeLocation` varchar(255) DEFAULT NULL,
  `phone` varchar(15) DEFAULT NULL,
  `photoUrl` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL ON UPDATE current_timestamp(),
  `created_by` char(36) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `admin_profiles`
--

INSERT INTO `admin_profiles` (`userId`, `designation`, `department`, `hallId`, `officeLocation`, `phone`, `photoUrl`, `created_at`, `updated_at`, `created_by`) VALUES
('admin-ash', 'Hall Provost', 'Student Affairs', 'hall-ash', 'Provost Office, Ground Floor, ASH', '+8801800000000', NULL, '2025-10-28 20:53:36', NULL, 'admin-ash'),
('admin-bkh', 'Hall Provost', 'Student Affairs', 'hall-bkh', 'Provost Office, Ground Floor, BKH', '01888998744', NULL, '2026-01-12 09:45:45', NULL, NULL),
('admin-jsh', 'Provost', 'Student Affairs', 'hall-jsh', 'Provost Office, Ground Floor, JSH', '01888998744', NULL, '2026-01-12 09:49:35', NULL, NULL),
('admin-muh', 'Assistant Provost', 'Student Welfare', 'hall-muh', 'Admin Block, Level 2, MUH', '+8801700000000', NULL, '2025-10-28 20:53:36', NULL, 'admin-muh'),
('admin-nfh', 'Provost', 'Student Affairs', 'hall-nfh', 'Provost Office, Ground Floor, NFH', '01888998744', NULL, '2026-01-12 09:52:49', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `applications`
--

CREATE TABLE `applications` (
  `applicationId` char(36) NOT NULL,
  `studentId` char(36) NOT NULL,
  `hallId` char(36) NOT NULL,
  `formId` char(36) NOT NULL,
  `formVersionId` char(36) NOT NULL,
  `status` enum('submitted','scheduled','rejected','alloted','not-alloted') NOT NULL DEFAULT 'submitted',
  `submissionDate` datetime DEFAULT NULL,
  `reviewedBy` char(36) DEFAULT NULL,
  `reviewedAt` datetime DEFAULT NULL,
  `totalScore` decimal(5,2) DEFAULT NULL,
  `rejectionReason` text DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `applications`
--

INSERT INTO `applications` (`applicationId`, `studentId`, `hallId`, `formId`, `formVersionId`, `status`, `submissionDate`, `reviewedBy`, `reviewedAt`, `totalScore`, `rejectionReason`, `created_at`, `updated_at`) VALUES
('02e003d5-a3a9-46dd-b90d-4ce505158174', 'MUH2225056M', 'hall-muh', 'ff7dc6b3-72f8-4e64-96c5-9ebfac9ce625', '99cca718-00b9-44cc-9f60-bd11ccd2b0db', 'rejected', '2026-01-12 02:08:59', NULL, NULL, 60.00, 'Absent in interview', '2026-01-12 02:08:59', '2026-01-15 16:46:06'),
('033440d6-a117-41fd-87a0-c96cee16159e', 'MUH2225007M', 'hall-muh', 'e6890c27-f3b5-41e0-958c-dc1c21649c29', 'f26879fa-6f67-4ff2-936e-a5bf8ab6f377', 'rejected', '2026-01-11 20:43:59', NULL, NULL, 25.00, NULL, '2026-01-11 20:43:59', '2026-01-11 20:57:25'),
('0439ff2b-6799-4829-bed9-450b8fdd5694', 'MUH2225052M', 'hall-muh', 'ec178699-3fd6-4edc-ad50-fec1ccbce61a', 'f0532ee7-5e54-40f7-976a-d9a1bb710319', 'submitted', '2026-01-15 15:34:35', NULL, NULL, 51.00, NULL, '2026-01-15 15:34:35', '2026-01-15 15:34:35'),
('0665945f-dcac-4e3a-a4dd-deeda4ea37ae', '1454f781-e5f6-49e1-8ed7-f32599263e71', 'hall-muh', '2248c16a-44ff-4da8-a1f5-d7e72468bd87', '574136f9-ff1f-4409-a07b-5440877a3c41', 'alloted', '2026-01-11 03:26:34', NULL, NULL, 0.00, NULL, '2026-01-11 03:26:34', '2026-01-11 03:26:34'),
('10bf51e1-c811-4bc6-be22-4f2cc1d0c588', 'MUH2225067M', 'hall-muh', 'ec178699-3fd6-4edc-ad50-fec1ccbce61a', 'f0532ee7-5e54-40f7-976a-d9a1bb710319', 'alloted', '2026-01-15 01:48:46', NULL, NULL, 0.00, NULL, '2026-01-15 01:48:46', '2026-01-15 01:48:46'),
('1a215917-5724-4224-bcc5-be130e5e92d9', 'MUH2225065M', 'hall-muh', 'ec178699-3fd6-4edc-ad50-fec1ccbce61a', 'f0532ee7-5e54-40f7-976a-d9a1bb710319', 'rejected', '2026-01-14 11:31:19', NULL, NULL, 95.00, NULL, '2026-01-14 11:31:19', '2026-01-14 17:09:06'),
('23cb058b-42e4-439e-9c4d-7d81358d189d', 'MUH2225062M', 'hall-muh', 'ec178699-3fd6-4edc-ad50-fec1ccbce61a', 'f0532ee7-5e54-40f7-976a-d9a1bb710319', 'scheduled', '2026-01-14 03:52:22', NULL, NULL, 113.00, NULL, '2026-01-14 03:52:22', '2026-01-14 17:09:06'),
('24feedd3-44ed-4540-ac17-dd6a7bb567fd', 'MUH2225056M', 'hall-muh', 'ec178699-3fd6-4edc-ad50-fec1ccbce61a', 'f0532ee7-5e54-40f7-976a-d9a1bb710319', 'submitted', '2026-01-15 16:21:32', NULL, NULL, 60.00, NULL, '2026-01-15 16:21:32', '2026-01-15 16:21:32'),
('2c66593b-f1b0-48ee-bb64-fb6feab232e1', 'MUH2225069M', 'hall-muh', 'ec178699-3fd6-4edc-ad50-fec1ccbce61a', 'f0532ee7-5e54-40f7-976a-d9a1bb710319', 'submitted', '2026-01-17 10:37:00', NULL, NULL, 49.00, NULL, '2026-01-17 10:37:00', '2026-01-17 10:37:00'),
('359d48b5-6f06-416e-8352-6dee6bd9f0bf', 'MUH2225026M', 'hall-muh', '2248c16a-44ff-4da8-a1f5-d7e72468bd87', '574136f9-ff1f-4409-a07b-5440877a3c41', 'alloted', '2026-01-11 01:22:00', NULL, NULL, 5.00, NULL, '2026-01-11 01:22:00', '2026-01-11 01:26:35'),
('3dfa808b-5a13-4ba1-ac5b-d8dfe2f85e57', 'MUH2225070M', 'hall-muh', 'ff7dc6b3-72f8-4e64-96c5-9ebfac9ce625', '99cca718-00b9-44cc-9f60-bd11ccd2b0db', 'submitted', '2026-01-12 02:14:10', NULL, NULL, 60.00, NULL, '2026-01-12 02:14:10', '2026-01-12 02:14:10'),
('3e720e16-d8e5-4ac0-81e3-f44208dad6af', 'MUH2125020M', 'hall-muh', 'c6dcb669-d39d-4ed1-ba35-5bcf86662b44', '00e6113a-1711-4097-a3d6-0f20cf3a3c15', 'alloted', '2025-12-26 01:37:50', NULL, NULL, 15.00, NULL, '2025-12-26 01:37:50', '2025-12-26 01:40:17'),
('44074d94-1ec8-4ff3-acd0-e765d904e895', 'MUH2225052M', 'hall-muh', 'ff7dc6b3-72f8-4e64-96c5-9ebfac9ce625', '99cca718-00b9-44cc-9f60-bd11ccd2b0db', 'submitted', '2026-01-12 02:06:48', NULL, NULL, 60.00, NULL, '2026-01-12 02:06:48', '2026-01-12 02:06:48'),
('4dcead30-8188-4203-864a-89dc2f052a0f', 'MUH2225064M', 'hall-muh', 'ec178699-3fd6-4edc-ad50-fec1ccbce61a', 'f0532ee7-5e54-40f7-976a-d9a1bb710319', 'alloted', '2026-01-15 01:53:18', NULL, NULL, 0.00, NULL, '2026-01-15 01:53:18', '2026-01-15 01:53:18'),
('4f8492ea-ece9-4cd5-8bfc-a5d34f4f4d0d', 'MUH2225054M', 'hall-muh', '1bd1b28d-f645-44af-8a29-59e19869b286', '70b5abb0-32ab-4843-83db-464ada2690cf', 'rejected', '2026-01-14 02:32:32', NULL, NULL, 43.00, NULL, '2026-01-14 02:32:32', '2026-01-14 02:43:59'),
('5022f377-13ca-4e2f-8f09-b7873e9a5677', 'MUH2225055M', 'hall-muh', 'ec178699-3fd6-4edc-ad50-fec1ccbce61a', 'f0532ee7-5e54-40f7-976a-d9a1bb710319', 'submitted', '2026-01-15 16:19:55', NULL, NULL, 54.00, NULL, '2026-01-15 16:19:55', '2026-01-15 16:19:55'),
('57424caa-1cfc-4740-9b2b-1002259545e5', 'MUH2225066M', 'hall-muh', 'ec178699-3fd6-4edc-ad50-fec1ccbce61a', 'f0532ee7-5e54-40f7-976a-d9a1bb710319', 'scheduled', '2026-01-14 12:22:10', NULL, NULL, 137.00, NULL, '2026-01-14 12:22:10', '2026-01-15 15:43:49'),
('65650e77-ed20-4f84-84df-25be2d585432', 'student-muh', 'hall-muh', 'cde55119-f3c1-4967-b561-18b5b41a6dfb', 'c9f22ad6-6068-41e3-8802-49df523c988f', 'submitted', '2025-12-14 19:00:58', NULL, NULL, 0.00, NULL, '2025-12-14 19:00:58', '2025-12-14 19:00:58'),
('65ac72c5-b0b4-45ee-95ff-5e24095f1b81', 'MUH2225051M', 'hall-muh', 'ff7dc6b3-72f8-4e64-96c5-9ebfac9ce625', '99cca718-00b9-44cc-9f60-bd11ccd2b0db', 'scheduled', '2026-01-12 02:05:52', NULL, NULL, 60.00, NULL, '2026-01-12 02:05:52', '2026-01-12 10:08:16'),
('7152857d-5ab7-4fba-b5b0-7c3714eae437', 'MUH2225057M', 'hall-muh', 'ec178699-3fd6-4edc-ad50-fec1ccbce61a', 'f0532ee7-5e54-40f7-976a-d9a1bb710319', 'submitted', '2026-01-15 16:23:07', NULL, NULL, 46.00, NULL, '2026-01-15 16:23:07', '2026-01-15 16:23:07'),
('73edeb25-2c74-4621-8e3b-4c838f011130', 'MUH2225054M', 'hall-muh', 'ec178699-3fd6-4edc-ad50-fec1ccbce61a', 'f0532ee7-5e54-40f7-976a-d9a1bb710319', 'submitted', '2026-01-15 16:18:32', NULL, NULL, 46.00, NULL, '2026-01-15 16:18:32', '2026-01-15 16:18:32'),
('7f9cae64-1380-49f6-8b96-39915d7bf872', 'MUH2225025M', 'hall-muh', 'e6890c27-f3b5-41e0-958c-dc1c21649c29', 'f26879fa-6f67-4ff2-936e-a5bf8ab6f377', 'submitted', '2026-01-11 21:00:48', NULL, NULL, 10.00, NULL, '2026-01-11 21:00:48', '2026-01-11 21:00:48'),
('86727f7c-404e-48e9-b75a-e72115e4345d', 'MUH2225059M', 'hall-muh', 'ec178699-3fd6-4edc-ad50-fec1ccbce61a', 'f0532ee7-5e54-40f7-976a-d9a1bb710319', 'submitted', '2026-01-15 15:31:18', NULL, NULL, 41.00, NULL, '2026-01-15 15:31:18', '2026-01-15 15:31:18'),
('879d2487-c910-401c-b7e9-ce7f11b89078', 'MUH2225068M', 'hall-muh', 'ec178699-3fd6-4edc-ad50-fec1ccbce61a', 'f0532ee7-5e54-40f7-976a-d9a1bb710319', 'submitted', '2026-01-15 16:25:14', NULL, NULL, 42.00, NULL, '2026-01-15 16:25:14', '2026-01-15 16:25:14'),
('88844505-03ef-4f9a-add8-c4584eb5eaf8', 'MUH2125013M', 'hall-muh', 'c6dcb669-d39d-4ed1-ba35-5bcf86662b44', '00e6113a-1711-4097-a3d6-0f20cf3a3c15', 'alloted', '2025-12-26 00:46:01', NULL, NULL, 15.00, NULL, '2025-12-26 00:46:01', '2025-12-26 00:54:05'),
('8b4a5628-caef-4d29-92a3-ac3234333974', 'MUH2125020M', 'hall-muh', '2248c16a-44ff-4da8-a1f5-d7e72468bd87', '574136f9-ff1f-4409-a07b-5440877a3c41', 'alloted', '2025-12-26 02:09:36', NULL, NULL, 5.00, NULL, '2025-12-26 02:09:36', '2025-12-26 02:11:08'),
('93ffecc6-1e19-4ad4-922d-ea4a81ccf28e', 'MUH2225062M', 'hall-muh', 'ff7dc6b3-72f8-4e64-96c5-9ebfac9ce625', '99cca718-00b9-44cc-9f60-bd11ccd2b0db', 'rejected', '2026-01-12 02:13:02', NULL, NULL, 60.00, 'Absent in interview', '2026-01-12 02:13:02', '2026-01-15 01:02:11'),
('953162ca-1b66-43e3-8c29-ca3f91c590db', 'MUH2225025M', 'hall-muh', 'cde55119-f3c1-4967-b561-18b5b41a6dfb', 'c9f22ad6-6068-41e3-8802-49df523c988f', 'submitted', '2026-01-11 21:24:56', NULL, NULL, 0.00, NULL, '2026-01-11 21:24:56', '2026-01-11 21:24:56'),
('991329f5-552e-4f8d-a0e9-6cd6913f12e8', 'MUH2225030M', 'hall-muh', 'cde55119-f3c1-4967-b561-18b5b41a6dfb', 'c9f22ad6-6068-41e3-8802-49df523c988f', 'alloted', '2025-12-25 22:05:39', NULL, NULL, 0.00, NULL, '2025-12-25 22:05:39', '2025-12-25 22:11:54'),
('aac3f54c-82a2-4ee6-8549-238ad5f5b981', 'MUH2225058M', 'hall-muh', 'ec178699-3fd6-4edc-ad50-fec1ccbce61a', 'f0532ee7-5e54-40f7-976a-d9a1bb710319', 'rejected', '2026-01-14 13:27:54', NULL, NULL, 47.00, 'miss match informaation', '2026-01-14 13:27:54', '2026-01-15 00:52:45'),
('bb76ce59-1b85-43e8-972e-b1c9aad0e617', 'MUH2225001M', 'hall-muh', 'e6890c27-f3b5-41e0-958c-dc1c21649c29', 'f26879fa-6f67-4ff2-936e-a5bf8ab6f377', 'alloted', '2025-12-15 12:33:47', NULL, NULL, 25.00, NULL, '2025-12-15 12:33:47', '2025-12-25 05:00:21'),
('d347acff-683a-486e-a136-60217dc01da2', 'MUH2225053M', 'hall-muh', 'ff7dc6b3-72f8-4e64-96c5-9ebfac9ce625', '99cca718-00b9-44cc-9f60-bd11ccd2b0db', 'submitted', '2026-01-12 02:07:54', NULL, NULL, 40.00, NULL, '2026-01-12 02:07:54', '2026-01-12 02:07:54'),
('d78656b0-7a07-46d1-878a-1efc7ceb5e6b', 'MUH2225061M', 'hall-muh', 'ff7dc6b3-72f8-4e64-96c5-9ebfac9ce625', '99cca718-00b9-44cc-9f60-bd11ccd2b0db', 'alloted', '2026-01-12 02:11:18', NULL, NULL, 60.00, NULL, '2026-01-12 02:11:18', '2026-01-12 10:12:29'),
('e59d076e-3e13-4b04-91de-1687a066b62a', 'MUH2233020M', 'hall-muh', '2248c16a-44ff-4da8-a1f5-d7e72468bd87', '574136f9-ff1f-4409-a07b-5440877a3c41', 'alloted', '2025-12-26 15:22:21', NULL, NULL, 5.00, NULL, '2025-12-26 15:22:21', '2025-12-26 15:24:49'),
('e9f5fe72-ca73-41d8-8f66-204f6ca675a4', 'MUH2225053M', 'hall-muh', 'ec178699-3fd6-4edc-ad50-fec1ccbce61a', 'f0532ee7-5e54-40f7-976a-d9a1bb710319', 'submitted', '2026-01-15 16:17:04', NULL, NULL, 42.00, NULL, '2026-01-15 16:17:04', '2026-01-15 16:17:04'),
('eaf0c36e-f69c-4824-b9a4-18d9c2d1ed66', 'MUH2225058M', 'hall-muh', 'ff7dc6b3-72f8-4e64-96c5-9ebfac9ce625', '99cca718-00b9-44cc-9f60-bd11ccd2b0db', 'submitted', '2026-01-12 02:09:54', NULL, NULL, 50.00, NULL, '2026-01-12 02:09:54', '2026-01-12 02:09:54'),
('ec2fe4c9-04ec-4140-8648-82a5863e26be', 'ASH2225033M', 'hall-ash', '93690181-2489-4559-8b87-456ce15599fa', 'dda27cf3-2af8-485a-9ffa-2a10d43befba', 'alloted', '2026-01-09 12:59:53', NULL, NULL, 0.00, NULL, '2026-01-09 12:59:53', '2026-01-09 13:08:36'),
('ec42fd37-691c-49ab-be90-fad5207d71c9', 'student-muh', 'hall-muh', 'e6890c27-f3b5-41e0-958c-dc1c21649c29', 'f26879fa-6f67-4ff2-936e-a5bf8ab6f377', 'scheduled', '2025-11-10 00:11:24', NULL, NULL, 10.00, NULL, '2025-11-10 00:11:24', '2025-12-25 04:58:42');

-- --------------------------------------------------------

--
-- Table structure for table `application_forms`
--

CREATE TABLE `application_forms` (
  `formId` char(36) NOT NULL,
  `hallId` char(36) NOT NULL,
  `formTitle` varchar(255) NOT NULL,
  `version` int(11) NOT NULL DEFAULT 1,
  `isActive` tinyint(1) NOT NULL DEFAULT 0,
  `applicationStartDate` datetime DEFAULT NULL,
  `applicationDeadline` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL ON UPDATE current_timestamp(),
  `created_by` char(36) DEFAULT NULL,
  `updated_by` char(36) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `application_forms`
--

INSERT INTO `application_forms` (`formId`, `hallId`, `formTitle`, `version`, `isActive`, `applicationStartDate`, `applicationDeadline`, `created_at`, `updated_at`, `created_by`, `updated_by`) VALUES
('1bd1b28d-f645-44af-8a29-59e19869b286', 'hall-muh', 'For 2021-22', 1, 0, NULL, NULL, '2026-01-14 02:30:03', '2026-01-22 23:20:23', 'admin-muh', 'admin-muh'),
('2248c16a-44ff-4da8-a1f5-d7e72468bd87', 'hall-muh', 'Test-21', 1, 0, NULL, NULL, '2025-12-26 02:08:42', '2026-01-22 23:20:23', 'admin-muh', 'admin-muh'),
('8f24f0eb-d449-4786-b284-0138ef8a2f8b', 'hall-muh', 'Test-20', 1, 0, NULL, NULL, '2025-12-26 00:44:08', '2026-01-22 23:20:23', 'admin-muh', NULL),
('93690181-2489-4559-8b87-456ce15599fa', 'hall-ash', 'Test1', 1, 1, NULL, NULL, '2025-12-14 18:53:29', '2025-12-14 18:53:40', 'admin-ash', 'admin-ash'),
('c6dcb669-d39d-4ed1-ba35-5bcf86662b44', 'hall-muh', 'Test-20', 1, 0, NULL, NULL, '2025-12-26 00:45:11', '2026-01-22 23:20:23', 'admin-muh', 'admin-muh'),
('cde55119-f3c1-4967-b561-18b5b41a6dfb', 'hall-muh', 'New', 1, 0, NULL, NULL, '2025-11-05 15:48:25', '2026-01-22 23:20:23', 'admin-muh', 'admin-muh'),
('e6890c27-f3b5-41e0-958c-dc1c21649c29', 'hall-muh', 'Admission-25', 1, 0, NULL, NULL, '2025-11-04 14:29:49', '2026-01-22 23:20:23', 'admin-muh', 'admin-muh'),
('ec178699-3fd6-4edc-ad50-fec1ccbce61a', 'hall-muh', 'Test-form', 1, 1, NULL, '2026-02-18 21:36:00', '2026-01-14 02:59:36', '2026-01-22 23:20:23', 'admin-muh', 'admin-muh'),
('ff7dc6b3-72f8-4e64-96c5-9ebfac9ce625', 'hall-muh', 'Application Form-2026', 1, 0, NULL, NULL, '2026-01-12 01:40:10', '2026-01-22 23:20:23', 'admin-muh', 'admin-muh'),
('fffb6708-20fe-44d4-b428-3d885c20d6cd', 'hall-ash', 'Salam Hall', 1, 0, NULL, NULL, '2025-11-09 22:57:49', '2025-12-14 18:53:40', 'admin-ash', 'admin-ash');

-- --------------------------------------------------------

--
-- Table structure for table `attachments`
--

CREATE TABLE `attachments` (
  `attachmentId` char(36) NOT NULL,
  `entityType` enum('APPLICATION','RENEWAL','COMPLAINT','PAYMENT','EXAM_RESULT','SEAT_PLAN','PROFILE_PHOTO','FORM_RESPONSE','OTHER') NOT NULL,
  `entityId` char(36) NOT NULL,
  `fileName` varchar(255) NOT NULL,
  `fileType` varchar(50) NOT NULL,
  `fileUrl` varchar(255) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `created_by` char(36) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `attachments`
--

INSERT INTO `attachments` (`attachmentId`, `entityType`, `entityId`, `fileName`, `fileType`, `fileUrl`, `created_at`, `created_by`) VALUES
('00ac7163-5f33-42ef-bd84-7260a75c980c', 'FORM_RESPONSE', 'a064cf8e-0ff4-47f9-9bea-cadaac5f66e9', 'Application Form-2026-2026-01-11.pdf', 'application/pdf', '/uploads/pending/6d6d1a28-5003-4d31-9027-4c636fee5e17.pdf?fieldId=2a928bfb-9cd5-4efa-be6b-e7066a2fa9b8', '2026-01-15 16:23:07', 'MUH2225057M'),
('11e9bbc2-c370-419d-817d-8b6eb0f1476a', 'FORM_RESPONSE', 'a064cf8e-0ff4-47f9-9bea-cadaac5f66e9', 'Application Form-2026-2026-01-11 (1).pdf', 'application/pdf', '/uploads/pending/21cfbc93-9cc9-4407-97b3-089ed45094e7.pdf?fieldId=2ebfe6d9-d9d5-4c88-abe7-6a0c5b2df7b4', '2026-01-15 16:23:07', 'MUH2225057M'),
('124ce7f4-b516-43af-a1f9-dcb2207e8fde', 'FORM_RESPONSE', '4a2da963-2394-4bdc-92b6-56a3389d4c84', 'cancelled-seat-history-2026-01-10 (1).pdf', 'application/pdf', '/uploads/pending/d6054617-6220-4e68-b6ce-70cc553aa435.pdf?fieldId=81957dca-2ecb-464d-92b5-d177b9e6cadd', '2026-01-14 02:32:32', 'MUH2225054M'),
('1ce6f8b7-10ef-4c7d-b7c0-6e3ade896882', 'FORM_RESPONSE', 'b3f3df81-452a-4beb-943d-fc1d83ce1cb4', 'cancelled-seat-history-2026-01-10 (1).pdf', 'application/pdf', '/uploads/pending/bc1da1ea-3737-490d-8c27-857ddabbca11.pdf?fieldId=19a2e5dd-6bf5-42e6-ac41-8cdeeed1bdfc', '2026-01-14 03:52:22', 'MUH2225062M'),
('1ef31331-4064-4cf7-8908-366d0c42482e', 'FORM_RESPONSE', '4ab23e68-19d9-4030-b2f6-eb289a365920', 'Application Form-2026-2026-01-11.pdf', 'application/pdf', '/uploads/pending/3b701113-ef8e-4a5a-976f-53749035a61e.pdf?fieldId=2a928bfb-9cd5-4efa-be6b-e7066a2fa9b8', '2026-01-15 16:21:32', 'MUH2225056M'),
('21d6d99e-6aa8-4b82-af72-814d7a41b0a3', 'FORM_RESPONSE', '9973f521-7001-4bcf-ac4a-712da8d13c11', 'IMG20251202105222.jpg', 'image/jpeg', '/uploads/pending/IMG20251202105222.jpg', '2025-12-15 12:33:47', 'MUH2225001M'),
('2241f2dc-bc57-4222-8d30-31f4d8751845', 'FORM_RESPONSE', 'c8f10828-8111-4ef4-bdfb-78dbc7525eda', 'Application Form-2026-2026-01-11.pdf', 'application/pdf', '/uploads/pending/ec4441a7-2dac-48d0-bb9e-f8e84a6b8d66.pdf?fieldId=19a2e5dd-6bf5-42e6-ac41-8cdeeed1bdfc', '2026-01-15 16:17:04', 'MUH2225053M'),
('2b1ef914-a9a1-4d66-bc24-c647c25b860f', 'FORM_RESPONSE', '4ab23e68-19d9-4030-b2f6-eb289a365920', 'Application Form-2026-2026-01-11.pdf', 'application/pdf', '/uploads/pending/80d0ae0b-fa5c-4280-a50d-f75256c17739.pdf?fieldId=7cf9cef9-2e59-4e5e-983f-a403122f949e', '2026-01-15 16:21:32', 'MUH2225056M'),
('327b03e1-f69a-4ca1-977a-6fa3d6a79861', 'FORM_RESPONSE', '6f2435dd-a692-4e2b-bccf-7a94f24ef3ac', 'sem.pdf', 'application/pdf', '/uploads/pending/53669de1-0245-4e9d-a53a-d24450376cdd.pdf', '2026-01-11 21:00:48', 'MUH2225025M'),
('34467f9a-b7e8-4493-aab6-ce46073be95c', 'OTHER', 'bd9545fb-551c-42fd-b7a2-85b7a7a839bd', 'Admission-25_filtered_2026-01-11.pdf', 'application/pdf', '/uploads/notices/426e64c7-38f6-4535-8487-66ce0db18409.pdf', '2026-01-11 21:41:43', 'admin-muh'),
('35bce8a3-096b-4037-8578-1b43cf528ff2', 'FORM_RESPONSE', '52dee59d-4a61-4bf8-b0ba-064db83a26d4', 'Application Form-2026-2026-01-11 (1).pdf', 'application/pdf', '/uploads/pending/5a5975d6-79f4-473e-91ce-3a6aa55e7755.pdf?fieldId=19a2e5dd-6bf5-42e6-ac41-8cdeeed1bdfc', '2026-01-15 16:25:14', 'MUH2225068M'),
('36ca2640-113c-4c11-b2e4-830f1b2cbbb7', 'FORM_RESPONSE', 'a064cf8e-0ff4-47f9-9bea-cadaac5f66e9', 'Application Form-2026-2026-01-11.pdf', 'application/pdf', '/uploads/pending/d1b9554f-dd6e-4dd4-b16a-77b79329e9bc.pdf?fieldId=7cf9cef9-2e59-4e5e-983f-a403122f949e', '2026-01-15 16:23:07', 'MUH2225057M'),
('3c890086-ca4d-49d3-a90f-999acaf59fb4', 'FORM_RESPONSE', 'bc302067-06bb-4658-970a-7294fc1efde3', 'Application Form-2026-2026-01-11 (1).pdf', 'application/pdf', '/uploads/pending/4ca43ff5-dce4-4386-ab73-5a4091c85cf9.pdf?fieldId=2a928bfb-9cd5-4efa-be6b-e7066a2fa9b8', '2026-01-15 16:18:32', 'MUH2225054M'),
('3e0556d0-5c21-4d67-802d-e6451e4c967a', 'FORM_RESPONSE', '4ab23e68-19d9-4030-b2f6-eb289a365920', 'Application Form-2026-2026-01-11 (1).pdf', 'application/pdf', '/uploads/pending/56603278-602f-4dff-92a7-bf4aebece8b7.pdf?fieldId=2ebfe6d9-d9d5-4c88-abe7-6a0c5b2df7b4', '2026-01-15 16:21:32', 'MUH2225056M'),
('40897bae-e6de-4c05-a702-4bfa64b1af6e', 'SEAT_PLAN', 'pending', 'full_solutions.pdf', 'application/pdf', '/uploads/seat-plans/29be1c46-e9df-444b-9c89-33e6b268a32f.pdf', '2026-01-10 01:42:04', 'exam-controller-main'),
('46087cd1-f616-435e-9c95-562aa7520bb7', 'FORM_RESPONSE', '9973f521-7001-4bcf-ac4a-712da8d13c11', 'command.txt', 'text/plain', '/uploads/pending/command.txt', '2025-12-15 12:33:47', 'MUH2225001M'),
('487ca749-7c3d-46c1-a2fe-4a7b6da5c3f9', 'FORM_RESPONSE', 'db33574e-e3c9-4c7a-b3a8-5b4a72c7cc42', 'Application Form-2026-2026-01-11 (1).pdf', 'application/pdf', '/uploads/pending/d627d2c8-64ca-4b96-be11-2aa54ae4a236.pdf?fieldId=2ebfe6d9-d9d5-4c88-abe7-6a0c5b2df7b4', '2026-01-15 16:19:55', 'MUH2225055M'),
('4bcbeae2-35fc-428e-b826-78f64601305b', 'FORM_RESPONSE', 'db33574e-e3c9-4c7a-b3a8-5b4a72c7cc42', 'Application Form-2026-2026-01-11.pdf', 'application/pdf', '/uploads/pending/96995b78-d190-475c-be28-f9c1170e3224.pdf?fieldId=7cf9cef9-2e59-4e5e-983f-a403122f949e', '2026-01-15 16:19:55', 'MUH2225055M'),
('579fadce-02f5-455a-b186-78e41a4bfc3c', 'EXAM_RESULT', 'pending', 'solutions.pdf', 'application/pdf', '/uploads/exam-results/b8aecc3f-849f-461c-b2ba-37958329a913.pdf', '2026-01-10 01:40:59', 'exam-controller-main'),
('6457b026-ba6e-464b-8c99-dc62418b8a78', 'FORM_RESPONSE', 'c25a80d0-35ae-4be6-92de-5b6588fb5e2b', 'Application Form-2026-2026-01-11.pdf', 'application/pdf', '/uploads/pending/5be45a4a-a31a-40b1-b40f-080ec5c660d8.pdf?fieldId=7cf9cef9-2e59-4e5e-983f-a403122f949e', '2026-01-15 15:34:35', 'MUH2225052M'),
('64b9c1ea-61b3-4958-992a-eef261777d06', 'FORM_RESPONSE', 'bc302067-06bb-4658-970a-7294fc1efde3', 'Application Form-2026-2026-01-11.pdf', 'application/pdf', '/uploads/pending/9c501daa-a219-4ac5-985c-7345343956a8.pdf?fieldId=7cf9cef9-2e59-4e5e-983f-a403122f949e', '2026-01-15 16:18:32', 'MUH2225054M'),
('66be241a-0064-4e09-a9ce-ddff17f517cf', 'FORM_RESPONSE', 'db33574e-e3c9-4c7a-b3a8-5b4a72c7cc42', 'Application Form-2026-2026-01-11.pdf', 'application/pdf', '/uploads/pending/dbbd83f0-d619-44cc-b971-311e950ba19b.pdf?fieldId=19d61a75-a7ee-43a5-9d0c-87c48e1b9a90', '2026-01-15 16:19:55', 'MUH2225055M'),
('692e2911-ac90-4f2a-9bc0-10f67634591b', 'FORM_RESPONSE', '4ab23e68-19d9-4030-b2f6-eb289a365920', 'Application Form-2026-2026-01-11 (1).pdf', 'application/pdf', '/uploads/pending/e3ecbff6-53f7-4460-813e-f12429c47b33.pdf?fieldId=19a2e5dd-6bf5-42e6-ac41-8cdeeed1bdfc', '2026-01-15 16:21:32', 'MUH2225056M'),
('6d5e1603-b196-4f6b-9f71-7d220b5ff61d', 'FORM_RESPONSE', 'f61da284-38bb-42fa-8713-5f11f5e03d77', 'Application Form-2026-2026-01-11.pdf', 'application/pdf', '/uploads/pending/0762258f-c8a2-407c-aded-8f8523e330e0.pdf?fieldId=19d61a75-a7ee-43a5-9d0c-87c48e1b9a90', '2026-01-15 15:31:18', 'MUH2225059M'),
('7576a600-bd6f-493f-856e-250aba2ac189', 'SEAT_PLAN', 'pending', 'solutions.pdf', 'application/pdf', '/uploads/seat-plans/cd1d30c9-03c4-4122-b820-b01fe0f0909d.pdf', '2026-01-10 01:40:28', 'exam-controller-main'),
('7de8cd2a-7a67-49e2-84e0-a4b7d845627e', 'FORM_RESPONSE', 'bc302067-06bb-4658-970a-7294fc1efde3', 'Application Form-2026-2026-01-11 (1).pdf', 'application/pdf', '/uploads/pending/43a952b5-0884-4dc6-8238-dbe88e00205c.pdf?fieldId=19a2e5dd-6bf5-42e6-ac41-8cdeeed1bdfc', '2026-01-15 16:18:32', 'MUH2225054M'),
('81b34ea0-7791-4fdb-8a41-8bbe3885d6e4', 'FORM_RESPONSE', '4ab23e68-19d9-4030-b2f6-eb289a365920', 'Application Form-2026-2026-01-11 (1).pdf', 'application/pdf', '/uploads/pending/806ac53f-d5bc-469a-a22f-18788014ca95.pdf?fieldId=19d61a75-a7ee-43a5-9d0c-87c48e1b9a90', '2026-01-15 16:21:32', 'MUH2225056M'),
('8bc66170-8d67-4a2e-a405-9be5cb79b187', 'FORM_RESPONSE', '127a2ae7-bbed-4b45-bd68-2d44877bc73c', 'cancelled-seat-history-2026-01-10 (1).pdf', 'application/pdf', '/uploads/pending/ddf60cbc-de9e-4c0a-bbef-0e5454b50b2e.pdf?fieldId=19a2e5dd-6bf5-42e6-ac41-8cdeeed1bdfc', '2026-01-14 13:27:54', 'MUH2225058M'),
('92666d1a-a0e1-40af-abe1-4b85a7ebe045', 'FORM_RESPONSE', 'db33574e-e3c9-4c7a-b3a8-5b4a72c7cc42', 'Application Form-2026-2026-01-11.pdf', 'application/pdf', '/uploads/pending/fc4ddfa3-b5d0-4e5e-9072-061be6fbc595.pdf?fieldId=2a928bfb-9cd5-4efa-be6b-e7066a2fa9b8', '2026-01-15 16:19:55', 'MUH2225055M'),
('94418e7f-f480-42f5-9f30-70e933e7cd88', 'FORM_RESPONSE', 'f3883650-f5e9-41ad-89af-c3d20505c17e', 'COA-LAb(1).pdf', 'application/pdf', '/uploads/pending/COA-LAb(1).pdf', '2026-01-11 20:43:59', 'MUH2225007M'),
('9720b0fe-176c-432a-98d4-98600fe69bda', 'FORM_RESPONSE', '919917dc-fdbf-4753-ba81-14fdf53fb3bd', 'graphviz (2).png', 'image/png', '/uploads/pending/graphviz%20(2).png', '2025-11-10 00:11:24', 'student-muh'),
('9df8ae53-908d-4d8e-bba9-2c979fb2f764', 'FORM_RESPONSE', '52dee59d-4a61-4bf8-b0ba-064db83a26d4', 'Application Form-2026-2026-01-11.pdf', 'application/pdf', '/uploads/pending/9b4c8517-e72d-44be-adc0-8be95b8b047b.pdf?fieldId=7cf9cef9-2e59-4e5e-983f-a403122f949e', '2026-01-15 16:25:14', 'MUH2225068M'),
('9e612487-bb94-433d-b074-288271545005', 'FORM_RESPONSE', 'a064cf8e-0ff4-47f9-9bea-cadaac5f66e9', 'Application Form-2026-2026-01-11 (1).pdf', 'application/pdf', '/uploads/pending/deb38ab2-fa51-49cc-a1e8-404af12098d8.pdf?fieldId=19a2e5dd-6bf5-42e6-ac41-8cdeeed1bdfc', '2026-01-15 16:23:07', 'MUH2225057M'),
('a098191b-1b20-4d57-bf43-3b46a70e734e', 'FORM_RESPONSE', 'f61da284-38bb-42fa-8713-5f11f5e03d77', 'Application Form-2026-2026-01-11.pdf', 'application/pdf', '/uploads/pending/4ef136f4-28f9-40e3-bd47-702674c5674f.pdf?fieldId=7cf9cef9-2e59-4e5e-983f-a403122f949e', '2026-01-15 15:31:18', 'MUH2225059M'),
('a218545e-5169-46ca-a1cd-cce998a0c026', 'FORM_RESPONSE', 'f61da284-38bb-42fa-8713-5f11f5e03d77', 'Application Form-2026-2026-01-11 (1).pdf', 'application/pdf', '/uploads/pending/4708bcd6-4d80-49d0-9f83-6ac5fb8cc629.pdf?fieldId=2a928bfb-9cd5-4efa-be6b-e7066a2fa9b8', '2026-01-15 15:31:18', 'MUH2225059M'),
('a4a8b28d-5516-4cb5-814d-bb387b46bcae', 'FORM_RESPONSE', 'c25a80d0-35ae-4be6-92de-5b6588fb5e2b', 'Application Form-2026-2026-01-11.pdf', 'application/pdf', '/uploads/pending/931483b1-bed2-43a3-882d-add36f29d122.pdf?fieldId=19a2e5dd-6bf5-42e6-ac41-8cdeeed1bdfc', '2026-01-15 15:34:35', 'MUH2225052M'),
('a89f1c29-03b8-4902-84eb-ebd4d3847e25', 'FORM_RESPONSE', 'c8f10828-8111-4ef4-bdfb-78dbc7525eda', 'Application Form-2026-2026-01-11 (1).pdf', 'application/pdf', '/uploads/pending/42fc1ca1-1166-409f-a157-9bea799d2f86.pdf?fieldId=2ebfe6d9-d9d5-4c88-abe7-6a0c5b2df7b4', '2026-01-15 16:17:04', 'MUH2225053M'),
('ac2ea021-8b5b-4248-85b1-9decb90ed2a6', 'FORM_RESPONSE', 'c25a80d0-35ae-4be6-92de-5b6588fb5e2b', 'Application Form-2026-2026-01-11.pdf', 'application/pdf', '/uploads/pending/928e0a7b-6f9f-4cb4-b8cc-3df5a8bf60cd.pdf?fieldId=19d61a75-a7ee-43a5-9d0c-87c48e1b9a90', '2026-01-15 15:34:35', 'MUH2225052M'),
('ae474c97-2bfc-4c33-a7a8-db2b4ffe1f08', 'FORM_RESPONSE', 'bc302067-06bb-4658-970a-7294fc1efde3', 'Application Form-2026-2026-01-11 (1).pdf', 'application/pdf', '/uploads/pending/24a3c5b1-e9f9-49b7-9652-97b29801dc57.pdf?fieldId=2ebfe6d9-d9d5-4c88-abe7-6a0c5b2df7b4', '2026-01-15 16:18:32', 'MUH2225054M'),
('afcd5f8a-ab1e-445a-bd96-57f8672980ea', 'FORM_RESPONSE', 'db33574e-e3c9-4c7a-b3a8-5b4a72c7cc42', 'Application Form-2026-2026-01-11.pdf', 'application/pdf', '/uploads/pending/3e2cbe07-185d-4312-9fe2-e08613837bda.pdf?fieldId=19a2e5dd-6bf5-42e6-ac41-8cdeeed1bdfc', '2026-01-15 16:19:55', 'MUH2225055M'),
('b010b523-6ea9-4264-a3af-e437c93e1250', 'FORM_RESPONSE', 'f3883650-f5e9-41ad-89af-c3d20505c17e', 'Assignment-2.pdf', 'application/pdf', '/uploads/pending/Assignment-2.pdf', '2026-01-11 20:43:59', 'MUH2225007M'),
('bd6ba801-ddd2-477e-8e0b-5271d66fa566', 'RENEWAL', '2d594fd7-fd9e-437e-8ee3-22957094a781', 'BDRAILWAY_TICKET61513611100-015137-4176-100515-50174717613416106.pdf', 'application/pdf', '/uploads/renewals/66d6cdd3-8bd0-449d-9087-3e9d8583d6ad.pdf', '2026-01-12 10:17:59', 'MUH2225061M'),
('c71e2d2a-acbe-47b3-9064-100e52132554', 'FORM_RESPONSE', 'c8f10828-8111-4ef4-bdfb-78dbc7525eda', 'Application Form-2026-2026-01-11.pdf', 'application/pdf', '/uploads/pending/1050fc6f-d404-40ba-849d-86da633984ae.pdf?fieldId=7cf9cef9-2e59-4e5e-983f-a403122f949e', '2026-01-15 16:17:04', 'MUH2225053M'),
('ca1167e3-1d71-4b7b-8919-7918a1cda116', 'FORM_RESPONSE', '52dee59d-4a61-4bf8-b0ba-064db83a26d4', 'Application Form-2026-2026-01-11 (1).pdf', 'application/pdf', '/uploads/pending/25a409cd-f403-4713-bb5f-2bfcdaaff198.pdf?fieldId=2ebfe6d9-d9d5-4c88-abe7-6a0c5b2df7b4', '2026-01-15 16:25:14', 'MUH2225068M'),
('da0e2ea8-4e23-4017-9869-d6b079a23aec', 'FORM_RESPONSE', 'c25a80d0-35ae-4be6-92de-5b6588fb5e2b', 'Application Form-2026-2026-01-11 (1).pdf', 'application/pdf', '/uploads/pending/f5e44f20-15df-49cd-a28e-70f71defedb8.pdf?fieldId=2ebfe6d9-d9d5-4c88-abe7-6a0c5b2df7b4', '2026-01-15 15:34:35', 'MUH2225052M'),
('dc914c70-ab1c-4e69-a49e-27bbf0c82285', 'COMPLAINT', '146b456e-ecf1-424e-88b5-227ff327ec61', '346797714_546221630921420_2385853661271246554_n.jpg', 'image/jpeg', '/uploads/pending/346797714_546221630921420_2385853661271246554_n.jpg', '2026-01-09 13:12:58', 'ASH2225033M'),
('e11b516c-06fb-4355-86b1-741c2b605685', 'FORM_RESPONSE', '7dd9ec98-6573-4e9a-bd98-60e157fda757', 'cancelled-seat-history-2026-01-10.pdf', 'application/pdf', '/uploads/pending/8c2d4ebf-6f1e-46ea-b3e4-c306ad00a972.pdf?fieldId=19a2e5dd-6bf5-42e6-ac41-8cdeeed1bdfc', '2026-01-14 12:22:10', 'MUH2225066M'),
('e4f7a0bb-323e-412e-b208-7f1d7bbd25da', 'FORM_RESPONSE', 'f61da284-38bb-42fa-8713-5f11f5e03d77', 'Application Form-2026-2026-01-11.pdf', 'application/pdf', '/uploads/pending/d2047ae4-c416-4fc5-ba34-4b6a830922b0.pdf?fieldId=2ebfe6d9-d9d5-4c88-abe7-6a0c5b2df7b4', '2026-01-15 15:31:18', 'MUH2225059M'),
('e618eb6d-eb81-45b1-9e46-f8eee7ea32a3', 'FORM_RESPONSE', 'c8f10828-8111-4ef4-bdfb-78dbc7525eda', 'Application Form-2026-2026-01-11 (1).pdf', 'application/pdf', '/uploads/pending/b9b6a3f5-2fef-4fbf-b20f-133797f659c1.pdf?fieldId=2a928bfb-9cd5-4efa-be6b-e7066a2fa9b8', '2026-01-15 16:17:04', 'MUH2225053M'),
('e68acab3-860e-4e7c-8422-0a63b61975c9', 'FORM_RESPONSE', '6f2435dd-a692-4e2b-bccf-7a94f24ef3ac', 'Admission-25_filtered_2026-01-11.pdf', 'application/pdf', '/uploads/pending/fa3efce7-aa54-464f-bae3-1dd6210782e7.pdf', '2026-01-11 21:00:48', 'MUH2225025M'),
('e739307e-9fcc-4c81-a0d6-7f9ac63096b3', 'FORM_RESPONSE', '1806e8d2-7ca1-4a6a-b3b9-3cd626a4332c', 'Admission-25_filtered_2026-01-11.pdf', 'application/pdf', '/uploads/pending/7a9aa609-4379-4917-9242-a4da815a020d.pdf?fieldId=a1eaf748-455a-4eb1-9370-007cc7dc2219', '2026-01-11 21:24:56', 'MUH2225025M'),
('e9b2e0d9-d806-4c96-99df-3cca45f686ed', 'FORM_RESPONSE', '52dee59d-4a61-4bf8-b0ba-064db83a26d4', 'Application Form-2026-2026-01-11.pdf', 'application/pdf', '/uploads/pending/0e0deac9-e83d-42d7-ad2a-5743b7f74462.pdf?fieldId=2a928bfb-9cd5-4efa-be6b-e7066a2fa9b8', '2026-01-15 16:25:14', 'MUH2225068M'),
('ebf499ca-d195-46e0-ae17-ee0cc5bbd58a', 'FORM_RESPONSE', 'c25a80d0-35ae-4be6-92de-5b6588fb5e2b', 'Application Form-2026-2026-01-11.pdf', 'application/pdf', '/uploads/pending/fc64076d-9e73-412f-b9ee-a5b683aac087.pdf?fieldId=2a928bfb-9cd5-4efa-be6b-e7066a2fa9b8', '2026-01-15 15:34:35', 'MUH2225052M'),
('ee600601-a5c0-4049-bb60-702a42bf4267', 'FORM_RESPONSE', '46d824ce-5498-4f2d-a571-9e458154c76e', 'cancelled-seat-history-2026-01-10.pdf', 'application/pdf', '/uploads/pending/34352a18-8334-49c1-903c-3d6dc119cd5d.pdf?fieldId=19a2e5dd-6bf5-42e6-ac41-8cdeeed1bdfc', '2026-01-14 11:31:19', 'MUH2225065M'),
('fa9bf4e9-c9e3-4ba6-8519-b989e161a048', 'FORM_RESPONSE', 'f61da284-38bb-42fa-8713-5f11f5e03d77', 'Application Form-2026-2026-01-11 (1).pdf', 'application/pdf', '/uploads/pending/db88721c-7c3f-48e6-beb9-9289724224df.pdf?fieldId=19a2e5dd-6bf5-42e6-ac41-8cdeeed1bdfc', '2026-01-15 15:31:18', 'MUH2225059M');

-- --------------------------------------------------------

--
-- Table structure for table `complaints`
--

CREATE TABLE `complaints` (
  `complaintId` char(36) NOT NULL,
  `userId` char(36) NOT NULL,
  `hallId` char(36) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `category` enum('MAINTENANCE','ELECTRICAL','PLUMBING','CLEANING','SECURITY','DISCIPLINARY','FOOD','OTHER') NOT NULL,
  `priority` varchar(20) NOT NULL DEFAULT 'MEDIUM',
  `status` enum('SUBMITTED','ACKNOWLEDGED','IN_PROGRESS','RESOLVED','CLOSED','REJECTED') NOT NULL DEFAULT 'SUBMITTED',
  `resolutionDetails` text DEFAULT NULL,
  `attachmentId` char(36) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL ON UPDATE current_timestamp(),
  `resolved_at` datetime DEFAULT NULL,
  `created_by` char(36) DEFAULT NULL,
  `updated_by` char(36) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `complaints`
--

INSERT INTO `complaints` (`complaintId`, `userId`, `hallId`, `title`, `description`, `category`, `priority`, `status`, `resolutionDetails`, `attachmentId`, `created_at`, `updated_at`, `resolved_at`, `created_by`, `updated_by`) VALUES
('146b456e-ecf1-424e-88b5-227ff327ec61', 'ASH2225033M', 'hall-ash', 'light issue', 'room er light noshto', 'OTHER', 'MEDIUM', 'RESOLVED', NULL, 'dc914c70-ab1c-4e69-a49e-27bbf0c82285', '2026-01-09 13:12:58', '2026-01-09 20:13:29', '2026-01-09 20:13:29', 'ASH2225033M', 'admin-ash'),
('969f429b-36c4-4742-87e4-3c91b86b4dd2', 'MUH2233020M', 'hall-muh', 'water issue', 'abc', 'OTHER', 'MEDIUM', 'IN_PROGRESS', NULL, NULL, '2025-12-26 15:33:25', '2026-01-10 20:23:29', NULL, 'MUH2233020M', 'admin-muh'),
('a2d20f29-7139-4c49-ad47-6490555a5345', 'ASH2225033M', NULL, 'Noisy Neighbours', 'They staring singing bawali song in big tone', 'OTHER', 'MEDIUM', 'SUBMITTED', NULL, NULL, '2026-01-07 13:46:57', '2026-01-07 13:46:57', NULL, 'ASH2225033M', NULL),
('bf2b1799-15b0-420d-b45d-ef7466a75a74', 'MUH2225030M', 'hall-muh', 'Electicity issue', 'abc', 'OTHER', 'MEDIUM', 'SUBMITTED', NULL, NULL, '2025-12-26 03:50:09', '2025-12-26 03:50:09', NULL, 'MUH2225030M', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `disciplinary_records`
--

CREATE TABLE `disciplinary_records` (
  `recordId` char(36) NOT NULL,
  `studentId` char(36) NOT NULL,
  `hallId` char(36) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `details` text NOT NULL,
  `severity` varchar(20) NOT NULL,
  `actionTaken` text DEFAULT NULL,
  `incidentDate` date NOT NULL,
  `status` enum('ACTIVE','INACTIVE','DELETED') NOT NULL DEFAULT 'ACTIVE',
  `attachmentId` char(36) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL ON UPDATE current_timestamp(),
  `created_by` char(36) DEFAULT NULL,
  `updated_by` char(36) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `disciplinary_records`
--

INSERT INTO `disciplinary_records` (`recordId`, `studentId`, `hallId`, `title`, `details`, `severity`, `actionTaken`, `incidentDate`, `status`, `attachmentId`, `created_at`, `updated_at`, `created_by`, `updated_by`) VALUES
('30885531-004a-403a-9a79-4001758fe14e', 'ASH2225026M', 'hall-ash', 'Attacking roommate', 'Attacked his roommate shakib', 'Severe', 'No', '2026-01-05', 'ACTIVE', NULL, '2026-01-06 16:50:10', '2026-01-06 16:53:36', 'admin-ash', 'admin-ash'),
('44b2c6bf-8863-4c57-8c60-e9403cbd8f8f', 'student-muh', 'hall-muh', 'Violation', 'Attacked his roommate', 'Severe', 'NO', '2026-01-07', 'ACTIVE', NULL, '2026-01-07 14:44:03', NULL, 'admin-muh', NULL),
('a2aab013-0436-424a-bac5-e74ee435f57f', 'MUH2225001M', 'hall-muh', 'Noise violation', 'Gaan bajna', 'Minor', 'NO', '2026-01-09', 'ACTIVE', NULL, '2026-01-09 13:20:08', NULL, 'admin-muh', NULL),
('d4da84ca-5e47-4d1a-aaac-d3712ec6f216', 'MUH2225061M', 'hall-muh', 'Noice Violation', 'asdfgh', 'Major', 'Written Warning', '2026-01-14', 'ACTIVE', NULL, '2026-01-14 23:45:35', NULL, 'admin-muh', NULL),
('f1cf6086-fed7-4dc9-b51e-08e2b1e0b8aa', 'MUH2125013M', 'hall-muh', 'Violation', 'xys', 'Minor', 'NO', '2026-01-07', 'ACTIVE', NULL, '2026-01-07 14:38:30', NULL, 'admin-muh', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `exam_controller_profiles`
--

CREATE TABLE `exam_controller_profiles` (
  `userId` char(36) NOT NULL,
  `designation` varchar(100) DEFAULT NULL,
  `department` varchar(100) DEFAULT NULL,
  `officeLocation` varchar(255) DEFAULT NULL,
  `contactExt` varchar(20) DEFAULT NULL,
  `phone` varchar(15) DEFAULT NULL,
  `photoUrl` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `exam_controller_profiles`
--

INSERT INTO `exam_controller_profiles` (`userId`, `designation`, `department`, `officeLocation`, `contactExt`, `phone`, `photoUrl`, `created_at`, `updated_at`) VALUES
('exam-controller-main', 'Exam Controller', 'Academics', 'Examination Office', NULL, '+8801700000010', NULL, '2026-01-10 01:27:15', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `exam_results`
--

CREATE TABLE `exam_results` (
  `resultId` char(36) NOT NULL,
  `semester` varchar(20) NOT NULL,
  `academicYear` varchar(10) NOT NULL,
  `department` varchar(100) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `isVisible` tinyint(1) NOT NULL DEFAULT 0,
  `attachmentId` char(36) NOT NULL,
  `publishedAt` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL ON UPDATE current_timestamp(),
  `created_by` char(36) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `exam_results`
--

INSERT INTO `exam_results` (`resultId`, `semester`, `academicYear`, `department`, `title`, `description`, `isVisible`, `attachmentId`, `publishedAt`, `created_at`, `updated_at`, `created_by`) VALUES
('e2cb8e85-63da-4ad3-aa8e-58b333133f83', '3-1', '2021-2022', 'IIT', 'iit result out', '', 1, '579fadce-02f5-455a-b186-78e41a4bfc3c', '2026-01-10 01:40:59', '2026-01-10 01:40:59', NULL, 'exam-controller-main');

-- --------------------------------------------------------

--
-- Table structure for table `exam_seat_plans`
--

CREATE TABLE `exam_seat_plans` (
  `planId` char(36) NOT NULL,
  `examName` varchar(255) NOT NULL,
  `examDate` date NOT NULL,
  `semester` varchar(20) DEFAULT NULL,
  `academicYear` varchar(10) DEFAULT NULL,
  `department` varchar(100) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `isVisible` tinyint(1) NOT NULL DEFAULT 0,
  `attachmentId` char(36) NOT NULL,
  `publishedAt` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `created_by` char(36) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `exam_seat_plans`
--

INSERT INTO `exam_seat_plans` (`planId`, `examName`, `examDate`, `semester`, `academicYear`, `department`, `description`, `isVisible`, `attachmentId`, `publishedAt`, `created_at`, `created_by`) VALUES
('6a8df712-dd68-4d61-886c-563daaacb4f5', 'swes seat', '2026-01-20', '2-1', '2021-2022', 'SWES', '', 1, '40897bae-e6de-4c05-a702-4bfa64b1af6e', '2026-01-10 01:42:04', '2026-01-10 01:42:04', 'exam-controller-main'),
('caa67559-f682-44f3-af9b-953c5c5576af', 'dddd', '2026-01-13', '2-2', '2022-2023', 'SWES', '', 1, '7576a600-bd6f-493f-856e-250aba2ac189', '2026-01-10 01:40:28', '2026-01-10 01:40:28', 'exam-controller-main');

-- --------------------------------------------------------

--
-- Table structure for table `field_options`
--

CREATE TABLE `field_options` (
  `optionId` char(36) NOT NULL,
  `fieldId` char(36) NOT NULL,
  `versionId` char(36) NOT NULL,
  `optionValue` varchar(255) NOT NULL,
  `optionLabel` varchar(255) NOT NULL,
  `optionScore` decimal(5,2) NOT NULL DEFAULT 0.00,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `field_options`
--

INSERT INTO `field_options` (`optionId`, `fieldId`, `versionId`, `optionValue`, `optionLabel`, `optionScore`, `created_at`, `updated_at`) VALUES
('0ce7f643-c41b-4a1c-91ad-3034d89d409d', '91d0c3af-b1ad-4d95-a7ff-ea057ac4052a', 'f26879fa-6f67-4ff2-936e-a5bf8ab6f377', 'Upojati', 'Upojati', 0.00, '2025-12-15 12:19:19', NULL),
('1f47561f-df36-4cd9-8154-80a4d0fb13dc', '19d61a75-a7ee-43a5-9d0c-87c48e1b9a90', 'f0532ee7-5e54-40f7-976a-d9a1bb710319', 'None', 'None', 0.00, '2026-01-22 23:20:19', NULL),
('26a4e05b-7de2-4707-9770-0f4db957899f', '19d61a75-a7ee-43a5-9d0c-87c48e1b9a90', 'f0532ee7-5e54-40f7-976a-d9a1bb710319', 'BNCC', 'BNCC', 8.00, '2026-01-22 23:20:19', NULL),
('2ad503a5-11f7-4693-9286-dccc6046ca9d', '19d61a75-a7ee-43a5-9d0c-87c48e1b9a90', 'f0532ee7-5e54-40f7-976a-d9a1bb710319', 'FF', 'FF', 10.00, '2026-01-22 23:20:19', NULL),
('470ea3fb-fc70-46a4-80e3-f40ae56ff742', '19d61a75-a7ee-43a5-9d0c-87c48e1b9a90', 'f0532ee7-5e54-40f7-976a-d9a1bb710319', 'Backward District', 'Backward District', 10.00, '2026-01-22 23:20:19', NULL),
('5244d28e-bda0-4d2d-9869-c2fce5280537', '19d61a75-a7ee-43a5-9d0c-87c48e1b9a90', 'f0532ee7-5e54-40f7-976a-d9a1bb710319', 'Disability', 'Disability', 15.00, '2026-01-22 23:20:19', NULL),
('adde9e12-9122-4169-8994-f0dc071a4ad3', '2395543d-dd48-4d80-9d7c-c0bf55426399', '70b5abb0-32ab-4843-83db-464ada2690cf', 'Backward Districts', 'Backward Districts', 5.00, '2026-01-14 02:30:03', NULL),
('afb4871f-dcdf-4a34-b2b2-8f288740c2f8', '2395543d-dd48-4d80-9d7c-c0bf55426399', '70b5abb0-32ab-4843-83db-464ada2690cf', 'FF', 'FF', 10.00, '2026-01-14 02:30:03', NULL),
('d199b34b-ad08-40a8-a484-7e54d5a05d97', '91d0c3af-b1ad-4d95-a7ff-ea057ac4052a', 'f26879fa-6f67-4ff2-936e-a5bf8ab6f377', 'FF', 'FF', 0.00, '2025-12-15 12:19:19', NULL),
('eaa0db9c-bfed-45ae-8823-def13d059d43', '2395543d-dd48-4d80-9d7c-c0bf55426399', '70b5abb0-32ab-4843-83db-464ada2690cf', 'None', 'None', 0.00, '2026-01-14 02:30:03', NULL),
('fd00dded-b724-47ad-a2a9-9af097f5debe', '2395543d-dd48-4d80-9d7c-c0bf55426399', '70b5abb0-32ab-4843-83db-464ada2690cf', 'Disabilities', 'Disabilities', 20.00, '2026-01-14 02:30:03', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `form_fields`
--

CREATE TABLE `form_fields` (
  `fieldId` char(36) NOT NULL,
  `formId` char(36) NOT NULL,
  `versionId` char(36) NOT NULL,
  `fieldName` varchar(50) NOT NULL,
  `fieldType` enum('TEXT','NUMBER','DATE','FILE','DROPDOWN','RADIO','CHECKBOX','TEXTAREA','EMAIL','PHONE') NOT NULL,
  `isRequired` tinyint(1) NOT NULL DEFAULT 0,
  `status` enum('ACTIVE','INACTIVE','DELETED') NOT NULL DEFAULT 'ACTIVE',
  `displayOrder` int(11) NOT NULL DEFAULT 0,
  `score` decimal(5,2) NOT NULL DEFAULT 0.00,
  `scoringRules` text DEFAULT NULL,
  `fieldConfig` text DEFAULT NULL,
  `requiresDocument` tinyint(1) NOT NULL DEFAULT 0,
  `documentLabel` varchar(255) DEFAULT NULL,
  `documentRequirement` enum('RECOMMENDED','MANDATORY') NOT NULL DEFAULT 'MANDATORY',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `form_fields`
--

INSERT INTO `form_fields` (`fieldId`, `formId`, `versionId`, `fieldName`, `fieldType`, `isRequired`, `status`, `displayOrder`, `score`, `scoringRules`, `fieldConfig`, `requiresDocument`, `documentLabel`, `documentRequirement`, `created_at`, `updated_at`) VALUES
('19a2e5dd-6bf5-42e6-ac41-8cdeeed1bdfc', 'ec178699-3fd6-4edc-ad50-fec1ccbce61a', 'f0532ee7-5e54-40f7-976a-d9a1bb710319', 'CGPA', 'NUMBER', 1, 'ACTIVE', 0, 10.00, '{\"mode\":\"RANGE_PERCENT\",\"defaultPercent\":0,\"ranges\":[{\"min\":3.75,\"max\":4,\"percent\":100},{\"min\":3.5,\"max\":3.74,\"percent\":80},{\"min\":3,\"max\":1,\"percent\":70},{\"min\":2,\"max\":2.99,\"percent\":60}]}', NULL, 0, NULL, 'RECOMMENDED', '2026-01-14 02:59:36', '2026-01-22 23:20:19'),
('19d61a75-a7ee-43a5-9d0c-87c48e1b9a90', 'ec178699-3fd6-4edc-ad50-fec1ccbce61a', 'f0532ee7-5e54-40f7-976a-d9a1bb710319', 'Quota', 'DROPDOWN', 0, 'ACTIVE', 2, 0.00, NULL, NULL, 1, NULL, 'MANDATORY', '2026-01-14 02:59:36', '2026-01-22 23:20:19'),
('1b9ad71b-b6af-4112-a64e-8edf416ccac0', 'e6890c27-f3b5-41e0-958c-dc1c21649c29', 'f26879fa-6f67-4ff2-936e-a5bf8ab6f377', 'CGPA', 'TEXT', 1, 'ACTIVE', 1, 10.00, NULL, NULL, 1, 'Upload ResultSheet', 'MANDATORY', '2025-11-05 11:49:27', '2025-12-15 12:19:19'),
('2395543d-dd48-4d80-9d7c-c0bf55426399', '1bd1b28d-f645-44af-8a29-59e19869b286', '70b5abb0-32ab-4843-83db-464ada2690cf', 'Quota', 'DROPDOWN', 1, 'ACTIVE', 2, 0.00, NULL, NULL, 0, NULL, 'RECOMMENDED', '2026-01-14 02:30:03', NULL),
('2a928bfb-9cd5-4efa-be6b-e7066a2fa9b8', 'ec178699-3fd6-4edc-ad50-fec1ccbce61a', 'f0532ee7-5e54-40f7-976a-d9a1bb710319', 'SSC Result', 'NUMBER', 1, 'ACTIVE', 6, 5.00, '{\"mode\":\"RANGE_PERCENT\",\"defaultPercent\":0,\"ranges\":[{\"min\":4,\"max\":5,\"percent\":100},{\"min\":3,\"max\":3.99,\"percent\":80},{\"min\":2,\"max\":2.99,\"percent\":59}]}', NULL, 0, NULL, 'RECOMMENDED', '2026-01-15 15:27:13', '2026-01-22 23:20:19'),
('2ebfe6d9-d9d5-4c88-abe7-6a0c5b2df7b4', 'ec178699-3fd6-4edc-ad50-fec1ccbce61a', 'f0532ee7-5e54-40f7-976a-d9a1bb710319', 'HSC Result', 'NUMBER', 1, 'ACTIVE', 5, 5.00, '{\"mode\":\"RANGE_PERCENT\",\"defaultPercent\":0,\"ranges\":[{\"min\":4.75,\"max\":5,\"percent\":100},{\"min\":4,\"max\":4.74,\"percent\":80},{\"min\":2,\"max\":3.99,\"percent\":60}]}', NULL, 0, NULL, 'RECOMMENDED', '2026-01-15 15:27:13', '2026-01-22 23:20:19'),
('47b1ef17-6e32-475f-97ed-9260eb662658', 'c6dcb669-d39d-4ed1-ba35-5bcf86662b44', '00e6113a-1711-4097-a3d6-0f20cf3a3c15', 'New Field', 'TEXT', 0, 'ACTIVE', 1, 10.00, NULL, NULL, 0, NULL, 'RECOMMENDED', '2025-12-26 00:45:11', '2025-12-26 01:32:35'),
('480e27ce-f010-4264-83f7-b73ab23c1348', 'e6890c27-f3b5-41e0-958c-dc1c21649c29', 'f26879fa-6f67-4ff2-936e-a5bf8ab6f377', 'Name', 'TEXT', 1, 'ACTIVE', 0, 0.00, NULL, NULL, 0, NULL, 'RECOMMENDED', '2025-11-04 14:29:49', '2025-12-15 12:19:19'),
('48a2f6d6-291a-4760-9b11-2c1898c0d346', 'ff7dc6b3-72f8-4e64-96c5-9ebfac9ce625', '99cca718-00b9-44cc-9f60-bd11ccd2b0db', 'CGPA', 'NUMBER', 0, 'ACTIVE', 0, 10.00, NULL, NULL, 0, NULL, 'RECOMMENDED', '2026-01-12 01:40:10', '2026-01-12 01:53:45'),
('679a185a-ced7-40c1-ba37-0574ec85f560', 'fffb6708-20fe-44d4-b428-3d885c20d6cd', 'e139d159-d8b5-4fb4-8d6a-c8904c0922bd', 'Result', 'TEXT', 0, 'ACTIVE', 1, 0.00, NULL, NULL, 1, NULL, 'MANDATORY', '2025-11-09 22:57:49', NULL),
('6908ed34-ef82-4c41-a11a-3fc60bef0a72', 'c6dcb669-d39d-4ed1-ba35-5bcf86662b44', '00e6113a-1711-4097-a3d6-0f20cf3a3c15', 'New Field', 'TEXT', 0, 'ACTIVE', 0, 5.00, NULL, NULL, 0, NULL, 'RECOMMENDED', '2025-12-26 00:45:11', '2025-12-26 01:32:35'),
('7cf9cef9-2e59-4e5e-983f-a403122f949e', 'ec178699-3fd6-4edc-ad50-fec1ccbce61a', 'f0532ee7-5e54-40f7-976a-d9a1bb710319', 'Address', 'TEXT', 1, 'ACTIVE', 1, 0.00, NULL, '{\"kind\":\"BD_ADDRESS\",\"districtScores\":{\"Bagerhat\":10,\"Bandarban\":10,\"Barguna\":10,\"Barishal\":10,\"Bhola\":10,\"Bogura\":10,\"Brahmanbaria\":10,\"Chandpur\":10,\"Chattogram\":10,\"Chuadanga\":10,\"Cox\'s Bazar\":10,\"Cumilla\":7,\"Dhaka\":10,\"Dinajpur\":10,\"Faridpur\":10,\"Feni\":6,\"Gaibandha\":10,\"Gazipur\":10,\"Gopalganj\":10,\"Habiganj\":10,\"Jamalpur\":10,\"Jashore\":10,\"Jhalokathi\":10,\"Jhenaidah\":10,\"Joypurhat\":10,\"Khagrachhari\":10,\"Khulna\":10,\"Kishoreganj\":10,\"Kurigram\":10,\"Kushtia\":10,\"Lakshmipur\":10,\"Lalmonirhat\":10,\"Madaripur\":10,\"Magura\":10,\"Manikganj\":10,\"Meherpur\":10,\"Moulvibazar\":10,\"Munshiganj\":10,\"Mymensingh\":10,\"Naogaon\":10,\"Narail\":10,\"Narayanganj\":10,\"Natore\":10,\"Nawabganj\":10,\"Netrakona\":10,\"Nilphamari\":10,\"Norsingdi\":5,\"Pabna\":10,\"Panchagarh\":10,\"Patuakhali\":10,\"Pirojpur\":10,\"Rajbari\":10,\"Rajshahi\":10,\"Rangamati\":10,\"Rangpur\":10,\"Satkhira\":10,\"Shariatpur\":10,\"Sherpur\":10,\"Sirajganj\":10,\"Sunamganj\":10,\"Sylhet\":10,\"Tangail\":10,\"Thakurgaon\":10,\"Abroad\":10,\"Narsingdi\":10},\"noakhaliUpazilaScores\":{\"Begumganj\":5,\"Hatiya\":10,\"Chatkhil\":5,\"Companiganj\":5,\"Sonaimuri\":5,\"Kabirhat\":5,\"Noakhali Sadar\":2,\"Senbagh\":5,\"Subarnachar\":10}}', 0, NULL, 'RECOMMENDED', '2026-01-14 02:59:36', '2026-01-22 23:20:19'),
('81957dca-2ecb-464d-92b5-d177b9e6cadd', '1bd1b28d-f645-44af-8a29-59e19869b286', '70b5abb0-32ab-4843-83db-464ada2690cf', 'CGPA', 'NUMBER', 1, 'ACTIVE', 0, 10.00, '{\"mode\":\"RANGE_PERCENT\",\"defaultPercent\":0,\"ranges\":[{\"min\":3.9,\"max\":4,\"percent\":100},{\"min\":3.75,\"max\":2,\"percent\":80},{\"min\":3.5,\"max\":3.74,\"percent\":70},{\"min\":2,\"max\":3.49,\"percent\":60},{\"min\":0,\"max\":1.99,\"percent\":0}]}', NULL, 1, 'Upload your latest marksheet', 'MANDATORY', '2026-01-14 02:30:03', NULL),
('81f41d4d-10b6-4637-aad8-3364f621c2da', 'fffb6708-20fe-44d4-b428-3d885c20d6cd', 'e139d159-d8b5-4fb4-8d6a-c8904c0922bd', 'Name', 'TEXT', 1, 'ACTIVE', 0, 1.00, NULL, NULL, 0, NULL, 'RECOMMENDED', '2025-11-09 22:57:49', NULL),
('8aabcc86-9b75-4108-b7f8-2f6c33eaebfb', '1bd1b28d-f645-44af-8a29-59e19869b286', '70b5abb0-32ab-4843-83db-464ada2690cf', 'Family Income (BDT/month)', 'NUMBER', 1, 'ACTIVE', 3, 20.00, '{\"mode\":\"RANGE_PERCENT\",\"defaultPercent\":0,\"ranges\":[{\"min\":0,\"max\":20000,\"percent\":100},{\"min\":20001,\"max\":100000,\"percent\":80}]}', NULL, 0, NULL, 'RECOMMENDED', '2026-01-14 02:30:03', NULL),
('91d0c3af-b1ad-4d95-a7ff-ea057ac4052a', 'e6890c27-f3b5-41e0-958c-dc1c21649c29', 'f26879fa-6f67-4ff2-936e-a5bf8ab6f377', 'Quota', 'DROPDOWN', 0, 'ACTIVE', 2, 15.00, NULL, NULL, 1, NULL, 'MANDATORY', '2025-12-15 12:19:19', NULL),
('94bb0681-7cd9-4a93-b242-8432d367c2d1', '8f24f0eb-d449-4786-b284-0138ef8a2f8b', '7dcc18be-ef43-4e16-8d59-5c254a2c9e79', 'New Field', 'TEXT', 0, 'ACTIVE', 0, 0.00, NULL, NULL, 0, NULL, 'RECOMMENDED', '2025-12-26 00:44:08', NULL),
('a1eaf748-455a-4eb1-9370-007cc7dc2219', 'cde55119-f3c1-4967-b561-18b5b41a6dfb', 'c9f22ad6-6068-41e3-8802-49df523c988f', 'Name', 'TEXT', 0, 'ACTIVE', 0, 0.00, NULL, NULL, 1, NULL, 'RECOMMENDED', '2025-11-05 15:48:25', '2026-01-11 21:24:24'),
('a1f984da-6b39-4e46-93c0-ced8f55da41c', '1bd1b28d-f645-44af-8a29-59e19869b286', '70b5abb0-32ab-4843-83db-464ada2690cf', 'Address', 'TEXT', 1, 'ACTIVE', 1, 5.00, NULL, '{\"kind\":\"BD_ADDRESS\",\"districtScores\":{\"Bagerhat\":20,\"Bandarban\":20,\"Barguna\":20,\"Barishal\":20,\"Bhola\":20,\"Bogura\":20,\"Brahmanbaria\":20,\"Chandpur\":20,\"Chattogram\":20,\"Chuadanga\":20,\"Cox\'s Bazar\":20,\"Cumilla\":20,\"Dhaka\":20,\"Dinajpur\":20,\"Faridpur\":20,\"Feni\":20,\"Gaibandha\":20,\"Gazipur\":20,\"Gopalganj\":20,\"Habiganj\":20,\"Jamalpur\":20,\"Jashore\":20,\"Jhalokathi\":20,\"Jhenaidah\":20,\"Joypurhat\":20,\"Khagrachhari\":20,\"Khulna\":20,\"Kishoreganj\":20,\"Kurigram\":20,\"Kushtia\":20,\"Lakshmipur\":20,\"Lalmonirhat\":20,\"Madaripur\":20,\"Magura\":20,\"Manikganj\":20,\"Meherpur\":20,\"Moulvibazar\":20,\"Munshiganj\":20,\"Mymensingh\":20,\"Naogaon\":20,\"Narail\":20,\"Narayanganj\":20,\"Natore\":20,\"Nawabganj\":20,\"Netrakona\":20,\"Nilphamari\":20,\"Norsingdi\":20,\"Pabna\":20,\"Panchagarh\":20,\"Patuakhali\":20,\"Pirojpur\":20,\"Rajbari\":20,\"Rajshahi\":20,\"Rangamati\":20,\"Rangpur\":20,\"Satkhira\":20,\"Shariatpur\":20,\"Sherpur\":20,\"Sirajganj\":20,\"Sunamganj\":20,\"Sylhet\":20,\"Tangail\":20,\"Thakurgaon\":20},\"noakhaliUpazilaScores\":{\"Begumganj\":25,\"Chatkhil\":25,\"Companiganj\":25,\"Hatiya\":25,\"Kabirhat\":25,\"Noakhali Sadar\":25,\"Senbagh\":25,\"Sonaimuri\":25,\"Subarnachar\":25}}', 0, NULL, 'RECOMMENDED', '2026-01-14 02:30:03', NULL),
('a2cf633c-118a-42f3-9837-098814a99605', 'ec178699-3fd6-4edc-ad50-fec1ccbce61a', 'f0532ee7-5e54-40f7-976a-d9a1bb710319', 'Father\'s Profession', 'TEXT', 1, 'ACTIVE', 4, 0.00, NULL, NULL, 0, NULL, 'RECOMMENDED', '2026-01-15 15:27:13', '2026-01-22 23:20:19'),
('a5de8f3a-d1ac-43cc-98c4-5ba86499a3fc', 'ff7dc6b3-72f8-4e64-96c5-9ebfac9ce625', '99cca718-00b9-44cc-9f60-bd11ccd2b0db', 'Family Income (BDT/month)', 'NUMBER', 0, 'ACTIVE', 3, 20.00, NULL, NULL, 0, NULL, 'RECOMMENDED', '2026-01-12 01:40:10', '2026-01-12 01:53:45'),
('af1134b6-063a-4bf1-9315-0ed82b2020de', 'c6dcb669-d39d-4ed1-ba35-5bcf86662b44', '00e6113a-1711-4097-a3d6-0f20cf3a3c15', 'New Field', 'TEXT', 0, 'ACTIVE', 2, 0.00, NULL, NULL, 0, NULL, 'RECOMMENDED', '2025-12-26 01:32:35', NULL),
('b38ce6c4-436c-49b4-a11b-c595aac6209f', '2248c16a-44ff-4da8-a1f5-d7e72468bd87', '574136f9-ff1f-4409-a07b-5440877a3c41', 'New Field', 'TEXT', 0, 'ACTIVE', 0, 5.00, NULL, NULL, 0, NULL, 'RECOMMENDED', '2025-12-26 02:08:42', NULL),
('ba690691-f150-4ed1-aeed-03d3bac0ec28', 'ff7dc6b3-72f8-4e64-96c5-9ebfac9ce625', '99cca718-00b9-44cc-9f60-bd11ccd2b0db', 'Quota', 'TEXT', 0, 'ACTIVE', 2, 10.00, NULL, NULL, 0, NULL, 'RECOMMENDED', '2026-01-12 01:40:10', '2026-01-12 01:53:45'),
('c5454c49-9715-4f0a-ad7d-490d205a7950', 'ec178699-3fd6-4edc-ad50-fec1ccbce61a', 'f0532ee7-5e54-40f7-976a-d9a1bb710319', 'Family Income (BDT/month)', 'NUMBER', 1, 'ACTIVE', 3, 20.00, '{\"mode\":\"RANGE_PERCENT\",\"defaultPercent\":0,\"ranges\":[{\"min\":0,\"max\":20000,\"percent\":100},{\"min\":20001,\"max\":49999,\"percent\":80},{\"min\":50000,\"max\":200000,\"percent\":50}]}', NULL, 0, NULL, 'RECOMMENDED', '2026-01-14 02:59:36', '2026-01-22 23:20:19'),
('ccae946a-c47b-407a-98be-ad27e00a9f2b', 'ff7dc6b3-72f8-4e64-96c5-9ebfac9ce625', '99cca718-00b9-44cc-9f60-bd11ccd2b0db', 'Address', 'TEXT', 0, 'ACTIVE', 1, 10.00, NULL, NULL, 0, NULL, 'RECOMMENDED', '2026-01-12 01:40:10', '2026-01-12 01:53:45'),
('d7b5b808-e7f4-4381-9bae-3cd1ec8f26d1', 'ff7dc6b3-72f8-4e64-96c5-9ebfac9ce625', '99cca718-00b9-44cc-9f60-bd11ccd2b0db', 'Medical Emergency', 'TEXT', 0, 'ACTIVE', 4, 10.00, NULL, NULL, 0, NULL, 'RECOMMENDED', '2026-01-12 01:40:10', '2026-01-12 01:53:45'),
('e5064dac-51ea-426c-a9ae-6d3150b86472', '93690181-2489-4559-8b87-456ce15599fa', 'dda27cf3-2af8-485a-9ffa-2a10d43befba', 'Hello', 'TEXT', 0, 'ACTIVE', 0, 0.00, NULL, NULL, 0, NULL, 'RECOMMENDED', '2025-12-14 18:53:29', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `form_responses`
--

CREATE TABLE `form_responses` (
  `responseId` char(36) NOT NULL,
  `applicationId` char(36) NOT NULL,
  `submissionDate` datetime NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `form_responses`
--

INSERT INTO `form_responses` (`responseId`, `applicationId`, `submissionDate`, `created_at`) VALUES
('0466838c-937c-4a6d-ab3f-78e76b6f6df8', 'ec2fe4c9-04ec-4140-8648-82a5863e26be', '2026-01-09 12:59:53', '2026-01-09 12:59:53'),
('0c7cb9e0-65a5-4294-9250-e31ff9632c52', '359d48b5-6f06-416e-8352-6dee6bd9f0bf', '2026-01-11 01:22:00', '2026-01-11 01:22:00'),
('127a2ae7-bbed-4b45-bd68-2d44877bc73c', 'aac3f54c-82a2-4ee6-8549-238ad5f5b981', '2026-01-14 13:27:54', '2026-01-14 13:27:54'),
('1806e8d2-7ca1-4a6a-b3b9-3cd626a4332c', '953162ca-1b66-43e3-8c29-ca3f91c590db', '2026-01-11 21:24:56', '2026-01-11 21:24:56'),
('297d0bf3-8575-404a-bfdd-93bf338799dd', '3dfa808b-5a13-4ba1-ac5b-d8dfe2f85e57', '2026-01-12 02:14:10', '2026-01-12 02:14:10'),
('3bb931c4-6941-44fa-a330-07a539d88f11', '8b4a5628-caef-4d29-92a3-ac3234333974', '2025-12-26 02:09:36', '2025-12-26 02:09:36'),
('4546dd8b-b510-472d-a6d0-5bdd947ae87b', '65650e77-ed20-4f84-84df-25be2d585432', '2025-12-14 19:00:58', '2025-12-14 19:00:58'),
('46d824ce-5498-4f2d-a571-9e458154c76e', '1a215917-5724-4224-bcc5-be130e5e92d9', '2026-01-14 11:31:19', '2026-01-14 11:31:19'),
('4a2da963-2394-4bdc-92b6-56a3389d4c84', '4f8492ea-ece9-4cd5-8bfc-a5d34f4f4d0d', '2026-01-14 02:32:32', '2026-01-14 02:32:32'),
('4a325f63-b2b9-4893-a7cd-fffbf6b6c8d8', '991329f5-552e-4f8d-a0e9-6cd6913f12e8', '2025-12-25 22:05:39', '2025-12-25 22:05:39'),
('4ab23e68-19d9-4030-b2f6-eb289a365920', '24feedd3-44ed-4540-ac17-dd6a7bb567fd', '2026-01-15 16:21:32', '2026-01-15 16:21:32'),
('50161294-64d9-452b-8473-cd02769a0d93', '65ac72c5-b0b4-45ee-95ff-5e24095f1b81', '2026-01-12 02:05:52', '2026-01-12 02:05:52'),
('52dee59d-4a61-4bf8-b0ba-064db83a26d4', '879d2487-c910-401c-b7e9-ce7f11b89078', '2026-01-15 16:25:14', '2026-01-15 16:25:14'),
('5340590f-c99f-4a26-a1a0-34f1bf40c33e', 'e59d076e-3e13-4b04-91de-1687a066b62a', '2025-12-26 15:22:21', '2025-12-26 15:22:21'),
('698cde70-a0ab-46fe-b943-7cf08d0a1f59', '2c66593b-f1b0-48ee-bb64-fb6feab232e1', '2026-01-17 10:37:00', '2026-01-17 10:37:00'),
('6d5b1637-26c7-4117-abe4-95f900085a06', '88844505-03ef-4f9a-add8-c4584eb5eaf8', '2025-12-26 00:46:01', '2025-12-26 00:46:01'),
('6f2435dd-a692-4e2b-bccf-7a94f24ef3ac', '7f9cae64-1380-49f6-8b96-39915d7bf872', '2026-01-11 21:00:48', '2026-01-11 21:00:48'),
('72225814-df7e-4934-906c-b6da779914bf', 'd347acff-683a-486e-a136-60217dc01da2', '2026-01-12 02:07:54', '2026-01-12 02:07:54'),
('74c048a0-7073-4c09-bcb4-fe234eec32ca', '02e003d5-a3a9-46dd-b90d-4ce505158174', '2026-01-12 02:08:59', '2026-01-12 02:08:59'),
('7dd9ec98-6573-4e9a-bd98-60e157fda757', '57424caa-1cfc-4740-9b2b-1002259545e5', '2026-01-14 12:22:10', '2026-01-14 12:22:10'),
('919917dc-fdbf-4753-ba81-14fdf53fb3bd', 'ec42fd37-691c-49ab-be90-fad5207d71c9', '2025-11-10 00:11:24', '2025-11-10 00:11:24'),
('9973f521-7001-4bcf-ac4a-712da8d13c11', 'bb76ce59-1b85-43e8-972e-b1c9aad0e617', '2025-12-15 12:33:47', '2025-12-15 12:33:47'),
('a064cf8e-0ff4-47f9-9bea-cadaac5f66e9', '7152857d-5ab7-4fba-b5b0-7c3714eae437', '2026-01-15 16:23:07', '2026-01-15 16:23:07'),
('a094df22-5d62-4046-bdd8-19f65f62b5a3', 'd78656b0-7a07-46d1-878a-1efc7ceb5e6b', '2026-01-12 02:11:18', '2026-01-12 02:11:18'),
('a6d80a03-91a4-4a1f-ae9d-1d8211414d32', '93ffecc6-1e19-4ad4-922d-ea4a81ccf28e', '2026-01-12 02:13:02', '2026-01-12 02:13:02'),
('b08e06ce-4b35-45cc-8906-081209058d9e', '44074d94-1ec8-4ff3-acd0-e765d904e895', '2026-01-12 02:06:48', '2026-01-12 02:06:48'),
('b3f3df81-452a-4beb-943d-fc1d83ce1cb4', '23cb058b-42e4-439e-9c4d-7d81358d189d', '2026-01-14 03:52:22', '2026-01-14 03:52:22'),
('bc302067-06bb-4658-970a-7294fc1efde3', '73edeb25-2c74-4621-8e3b-4c838f011130', '2026-01-15 16:18:32', '2026-01-15 16:18:32'),
('c25a80d0-35ae-4be6-92de-5b6588fb5e2b', '0439ff2b-6799-4829-bed9-450b8fdd5694', '2026-01-15 15:34:35', '2026-01-15 15:34:35'),
('c8f10828-8111-4ef4-bdfb-78dbc7525eda', 'e9f5fe72-ca73-41d8-8f66-204f6ca675a4', '2026-01-15 16:17:04', '2026-01-15 16:17:04'),
('d2bbfb8a-cfd7-4575-a51a-3f46f1daaf06', 'eaf0c36e-f69c-4824-b9a4-18d9c2d1ed66', '2026-01-12 02:09:54', '2026-01-12 02:09:54'),
('db33574e-e3c9-4c7a-b3a8-5b4a72c7cc42', '5022f377-13ca-4e2f-8f09-b7873e9a5677', '2026-01-15 16:19:55', '2026-01-15 16:19:55'),
('f3883650-f5e9-41ad-89af-c3d20505c17e', '033440d6-a117-41fd-87a0-c96cee16159e', '2026-01-11 20:43:59', '2026-01-11 20:43:59'),
('f51884f7-aafa-4bb3-b538-43a36107d3b9', '3e720e16-d8e5-4ac0-81e3-f44208dad6af', '2025-12-26 01:37:50', '2025-12-26 01:37:50'),
('f61da284-38bb-42fa-8713-5f11f5e03d77', '86727f7c-404e-48e9-b75a-e72115e4345d', '2026-01-15 15:31:18', '2026-01-15 15:31:18');

-- --------------------------------------------------------

--
-- Table structure for table `form_response_values`
--

CREATE TABLE `form_response_values` (
  `responseId` char(36) NOT NULL,
  `fieldId` char(36) NOT NULL,
  `value` text DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `form_response_values`
--

INSERT INTO `form_response_values` (`responseId`, `fieldId`, `value`, `created_at`) VALUES
('0466838c-937c-4a6d-ab3f-78e76b6f6df8', 'e5064dac-51ea-426c-a9ae-6d3150b86472', 'hello', '2026-01-09 12:59:53'),
('0c7cb9e0-65a5-4294-9250-e31ff9632c52', 'b38ce6c4-436c-49b4-a11b-c595aac6209f', 'Masum26', '2026-01-11 01:22:00'),
('127a2ae7-bbed-4b45-bd68-2d44877bc73c', '19a2e5dd-6bf5-42e6-ac41-8cdeeed1bdfc', '3.8', '2026-01-14 13:27:54'),
('127a2ae7-bbed-4b45-bd68-2d44877bc73c', '19d61a75-a7ee-43a5-9d0c-87c48e1b9a90', '[\"None\"]', '2026-01-14 13:27:54'),
('127a2ae7-bbed-4b45-bd68-2d44877bc73c', '7cf9cef9-2e59-4e5e-983f-a403122f949e', '{\"district\":\"Feni\",\"upazila\":\"Feni Sadar\"}', '2026-01-14 13:27:54'),
('127a2ae7-bbed-4b45-bd68-2d44877bc73c', 'c5454c49-9715-4f0a-ad7d-490d205a7950', '34000', '2026-01-14 13:27:54'),
('1806e8d2-7ca1-4a6a-b3b9-3cd626a4332c', 'a1eaf748-455a-4eb1-9370-007cc7dc2219', 'Hasan', '2026-01-11 21:24:56'),
('297d0bf3-8575-404a-bfdd-93bf338799dd', '48a2f6d6-291a-4760-9b11-2c1898c0d346', '3.5', '2026-01-12 02:14:10'),
('297d0bf3-8575-404a-bfdd-93bf338799dd', 'a5de8f3a-d1ac-43cc-98c4-5ba86499a3fc', '50000', '2026-01-12 02:14:10'),
('297d0bf3-8575-404a-bfdd-93bf338799dd', 'ba690691-f150-4ed1-aeed-03d3bac0ec28', 'no', '2026-01-12 02:14:10'),
('297d0bf3-8575-404a-bfdd-93bf338799dd', 'ccae946a-c47b-407a-98be-ad27e00a9f2b', 'Chittagong', '2026-01-12 02:14:10'),
('297d0bf3-8575-404a-bfdd-93bf338799dd', 'd7b5b808-e7f4-4381-9bae-3cd1ec8f26d1', 'yes', '2026-01-12 02:14:10'),
('3bb931c4-6941-44fa-a330-07a539d88f11', 'b38ce6c4-436c-49b4-a11b-c595aac6209f', 'hello world', '2025-12-26 02:09:36'),
('4546dd8b-b510-472d-a6d0-5bdd947ae87b', 'a1eaf748-455a-4eb1-9370-007cc7dc2219', 'Hasan ', '2025-12-14 19:00:58'),
('46d824ce-5498-4f2d-a571-9e458154c76e', '19a2e5dd-6bf5-42e6-ac41-8cdeeed1bdfc', '3.6', '2026-01-14 11:31:19'),
('46d824ce-5498-4f2d-a571-9e458154c76e', '19d61a75-a7ee-43a5-9d0c-87c48e1b9a90', '[\"Disabilities\"]', '2026-01-14 11:31:19'),
('46d824ce-5498-4f2d-a571-9e458154c76e', '7cf9cef9-2e59-4e5e-983f-a403122f949e', '{\"district\":\"Narsingdi\",\"upazila\":\"Shibpur\"}', '2026-01-14 11:31:19'),
('46d824ce-5498-4f2d-a571-9e458154c76e', 'c5454c49-9715-4f0a-ad7d-490d205a7950', '19992', '2026-01-14 11:31:19'),
('4a2da963-2394-4bdc-92b6-56a3389d4c84', '2395543d-dd48-4d80-9d7c-c0bf55426399', 'None', '2026-01-14 02:32:32'),
('4a2da963-2394-4bdc-92b6-56a3389d4c84', '81957dca-2ecb-464d-92b5-d177b9e6cadd', '3.66', '2026-01-14 02:32:32'),
('4a2da963-2394-4bdc-92b6-56a3389d4c84', '8aabcc86-9b75-4108-b7f8-2f6c33eaebfb', '24997', '2026-01-14 02:32:32'),
('4a2da963-2394-4bdc-92b6-56a3389d4c84', 'a1f984da-6b39-4e46-93c0-ced8f55da41c', '{\"district\":\"Norsingdi\",\"upazila\":\"Shibpur\"}', '2026-01-14 02:32:32'),
('4a325f63-b2b9-4893-a7cd-fffbf6b6c8d8', 'a1eaf748-455a-4eb1-9370-007cc7dc2219', 'MAsum', '2025-12-25 22:05:39'),
('4ab23e68-19d9-4030-b2f6-eb289a365920', '19a2e5dd-6bf5-42e6-ac41-8cdeeed1bdfc', '3.92', '2026-01-15 16:21:32'),
('4ab23e68-19d9-4030-b2f6-eb289a365920', '19d61a75-a7ee-43a5-9d0c-87c48e1b9a90', 'Backward District', '2026-01-15 16:21:32'),
('4ab23e68-19d9-4030-b2f6-eb289a365920', '2a928bfb-9cd5-4efa-be6b-e7066a2fa9b8', '5', '2026-01-15 16:21:32'),
('4ab23e68-19d9-4030-b2f6-eb289a365920', '2ebfe6d9-d9d5-4c88-abe7-6a0c5b2df7b4', '5', '2026-01-15 16:21:32'),
('4ab23e68-19d9-4030-b2f6-eb289a365920', '7cf9cef9-2e59-4e5e-983f-a403122f949e', '{\"district\":\"Noakhali\",\"upazila\":\"Subarnachar\"}', '2026-01-15 16:21:32'),
('4ab23e68-19d9-4030-b2f6-eb289a365920', 'a2cf633c-118a-42f3-9837-098814a99605', 'Businessmen', '2026-01-15 16:21:32'),
('4ab23e68-19d9-4030-b2f6-eb289a365920', 'c5454c49-9715-4f0a-ad7d-490d205a7950', '20000', '2026-01-15 16:21:32'),
('50161294-64d9-452b-8473-cd02769a0d93', '48a2f6d6-291a-4760-9b11-2c1898c0d346', '3.5', '2026-01-12 02:05:52'),
('50161294-64d9-452b-8473-cd02769a0d93', 'a5de8f3a-d1ac-43cc-98c4-5ba86499a3fc', '15000', '2026-01-12 02:05:52'),
('50161294-64d9-452b-8473-cd02769a0d93', 'ba690691-f150-4ed1-aeed-03d3bac0ec28', 'NO', '2026-01-12 02:05:52'),
('50161294-64d9-452b-8473-cd02769a0d93', 'ccae946a-c47b-407a-98be-ad27e00a9f2b', 'Narsingdi', '2026-01-12 02:05:52'),
('50161294-64d9-452b-8473-cd02769a0d93', 'd7b5b808-e7f4-4381-9bae-3cd1ec8f26d1', 'NO', '2026-01-12 02:05:52'),
('52dee59d-4a61-4bf8-b0ba-064db83a26d4', '19a2e5dd-6bf5-42e6-ac41-8cdeeed1bdfc', '2.56', '2026-01-15 16:25:14'),
('52dee59d-4a61-4bf8-b0ba-064db83a26d4', '2a928bfb-9cd5-4efa-be6b-e7066a2fa9b8', '5', '2026-01-15 16:25:14'),
('52dee59d-4a61-4bf8-b0ba-064db83a26d4', '2ebfe6d9-d9d5-4c88-abe7-6a0c5b2df7b4', '5', '2026-01-15 16:25:14'),
('52dee59d-4a61-4bf8-b0ba-064db83a26d4', '7cf9cef9-2e59-4e5e-983f-a403122f949e', '{\"district\":\"Bhola\",\"upazila\":\"Lalmohan\"}', '2026-01-15 16:25:14'),
('52dee59d-4a61-4bf8-b0ba-064db83a26d4', 'a2cf633c-118a-42f3-9837-098814a99605', 'Writer', '2026-01-15 16:25:14'),
('52dee59d-4a61-4bf8-b0ba-064db83a26d4', 'c5454c49-9715-4f0a-ad7d-490d205a7950', '30000', '2026-01-15 16:25:14'),
('5340590f-c99f-4a26-a1a0-34f1bf40c33e', 'b38ce6c4-436c-49b4-a11b-c595aac6209f', 'Shipon,swes', '2025-12-26 15:22:21'),
('698cde70-a0ab-46fe-b943-7cf08d0a1f59', '19a2e5dd-6bf5-42e6-ac41-8cdeeed1bdfc', '4', '2026-01-17 10:37:00'),
('698cde70-a0ab-46fe-b943-7cf08d0a1f59', '19d61a75-a7ee-43a5-9d0c-87c48e1b9a90', '', '2026-01-17 10:37:00'),
('698cde70-a0ab-46fe-b943-7cf08d0a1f59', '2a928bfb-9cd5-4efa-be6b-e7066a2fa9b8', '5', '2026-01-17 10:37:00'),
('698cde70-a0ab-46fe-b943-7cf08d0a1f59', '2ebfe6d9-d9d5-4c88-abe7-6a0c5b2df7b4', '4.3', '2026-01-17 10:37:00'),
('698cde70-a0ab-46fe-b943-7cf08d0a1f59', '7cf9cef9-2e59-4e5e-983f-a403122f949e', '{\"district\":\"Bagerhat\",\"upazila\":\"Bagerhat Sadar\"}', '2026-01-17 10:37:00'),
('698cde70-a0ab-46fe-b943-7cf08d0a1f59', 'a2cf633c-118a-42f3-9837-098814a99605', 'dc', '2026-01-17 10:37:00'),
('698cde70-a0ab-46fe-b943-7cf08d0a1f59', 'c5454c49-9715-4f0a-ad7d-490d205a7950', '12298', '2026-01-17 10:37:00'),
('6d5b1637-26c7-4117-abe4-95f900085a06', '47b1ef17-6e32-475f-97ed-9260eb662658', 'World', '2025-12-26 00:46:01'),
('6d5b1637-26c7-4117-abe4-95f900085a06', '6908ed34-ef82-4c41-a11a-3fc60bef0a72', 'hello', '2025-12-26 00:46:01'),
('6f2435dd-a692-4e2b-bccf-7a94f24ef3ac', '1b9ad71b-b6af-4112-a64e-8edf416ccac0', '3.5', '2026-01-11 21:00:48'),
('6f2435dd-a692-4e2b-bccf-7a94f24ef3ac', '480e27ce-f010-4264-83f7-b73ab23c1348', 'Masum', '2026-01-11 21:00:48'),
('72225814-df7e-4934-906c-b6da779914bf', '48a2f6d6-291a-4760-9b11-2c1898c0d346', '3.33', '2026-01-12 02:07:54'),
('72225814-df7e-4934-906c-b6da779914bf', 'a5de8f3a-d1ac-43cc-98c4-5ba86499a3fc', '40000', '2026-01-12 02:07:54'),
('72225814-df7e-4934-906c-b6da779914bf', 'ccae946a-c47b-407a-98be-ad27e00a9f2b', 'Cumilla', '2026-01-12 02:07:54'),
('74c048a0-7073-4c09-bcb4-fe234eec32ca', '48a2f6d6-291a-4760-9b11-2c1898c0d346', '4', '2026-01-12 02:08:59'),
('74c048a0-7073-4c09-bcb4-fe234eec32ca', 'a5de8f3a-d1ac-43cc-98c4-5ba86499a3fc', '19998', '2026-01-12 02:08:59'),
('74c048a0-7073-4c09-bcb4-fe234eec32ca', 'ba690691-f150-4ed1-aeed-03d3bac0ec28', 'YES', '2026-01-12 02:08:59'),
('74c048a0-7073-4c09-bcb4-fe234eec32ca', 'ccae946a-c47b-407a-98be-ad27e00a9f2b', 'Noakhali', '2026-01-12 02:08:59'),
('74c048a0-7073-4c09-bcb4-fe234eec32ca', 'd7b5b808-e7f4-4381-9bae-3cd1ec8f26d1', 'no', '2026-01-12 02:08:59'),
('7dd9ec98-6573-4e9a-bd98-60e157fda757', '19a2e5dd-6bf5-42e6-ac41-8cdeeed1bdfc', '3.57', '2026-01-14 12:22:10'),
('7dd9ec98-6573-4e9a-bd98-60e157fda757', '19d61a75-a7ee-43a5-9d0c-87c48e1b9a90', '[\"Disabilities\"]', '2026-01-14 12:22:10'),
('7dd9ec98-6573-4e9a-bd98-60e157fda757', '7cf9cef9-2e59-4e5e-983f-a403122f949e', '{\"district\":\"Noakhali\",\"upazila\":\"Begumganj\"}', '2026-01-14 12:22:10'),
('7dd9ec98-6573-4e9a-bd98-60e157fda757', 'c5454c49-9715-4f0a-ad7d-490d205a7950', '25000', '2026-01-14 12:22:10'),
('919917dc-fdbf-4753-ba81-14fdf53fb3bd', '1b9ad71b-b6af-4112-a64e-8edf416ccac0', '3.54', '2025-11-10 00:11:24'),
('919917dc-fdbf-4753-ba81-14fdf53fb3bd', '480e27ce-f010-4264-83f7-b73ab23c1348', 'Hasan Mahmud', '2025-11-10 00:11:24'),
('9973f521-7001-4bcf-ac4a-712da8d13c11', '1b9ad71b-b6af-4112-a64e-8edf416ccac0', '3.5', '2025-12-15 12:33:47'),
('9973f521-7001-4bcf-ac4a-712da8d13c11', '480e27ce-f010-4264-83f7-b73ab23c1348', 'Sazzad Mahmud', '2025-12-15 12:33:47'),
('9973f521-7001-4bcf-ac4a-712da8d13c11', '91d0c3af-b1ad-4d95-a7ff-ea057ac4052a', 'FF', '2025-12-15 12:33:47'),
('a064cf8e-0ff4-47f9-9bea-cadaac5f66e9', '19a2e5dd-6bf5-42e6-ac41-8cdeeed1bdfc', '3.96', '2026-01-15 16:23:07'),
('a064cf8e-0ff4-47f9-9bea-cadaac5f66e9', '2a928bfb-9cd5-4efa-be6b-e7066a2fa9b8', '4.5', '2026-01-15 16:23:07'),
('a064cf8e-0ff4-47f9-9bea-cadaac5f66e9', '2ebfe6d9-d9d5-4c88-abe7-6a0c5b2df7b4', '5', '2026-01-15 16:23:07'),
('a064cf8e-0ff4-47f9-9bea-cadaac5f66e9', '7cf9cef9-2e59-4e5e-983f-a403122f949e', '{\"district\":\"Bogura\",\"upazila\":\"Gabtali\"}', '2026-01-15 16:23:07'),
('a064cf8e-0ff4-47f9-9bea-cadaac5f66e9', 'a2cf633c-118a-42f3-9837-098814a99605', 'Businessmen', '2026-01-15 16:23:07'),
('a064cf8e-0ff4-47f9-9bea-cadaac5f66e9', 'c5454c49-9715-4f0a-ad7d-490d205a7950', '45000', '2026-01-15 16:23:07'),
('a094df22-5d62-4046-bdd8-19f65f62b5a3', '48a2f6d6-291a-4760-9b11-2c1898c0d346', '3.7', '2026-01-12 02:11:18'),
('a094df22-5d62-4046-bdd8-19f65f62b5a3', 'a5de8f3a-d1ac-43cc-98c4-5ba86499a3fc', '25000', '2026-01-12 02:11:18'),
('a094df22-5d62-4046-bdd8-19f65f62b5a3', 'ba690691-f150-4ed1-aeed-03d3bac0ec28', 'no', '2026-01-12 02:11:18'),
('a094df22-5d62-4046-bdd8-19f65f62b5a3', 'ccae946a-c47b-407a-98be-ad27e00a9f2b', 'Noakhali', '2026-01-12 02:11:18'),
('a094df22-5d62-4046-bdd8-19f65f62b5a3', 'd7b5b808-e7f4-4381-9bae-3cd1ec8f26d1', 'yes', '2026-01-12 02:11:18'),
('a6d80a03-91a4-4a1f-ae9d-1d8211414d32', '48a2f6d6-291a-4760-9b11-2c1898c0d346', '3.22', '2026-01-12 02:13:02'),
('a6d80a03-91a4-4a1f-ae9d-1d8211414d32', 'a5de8f3a-d1ac-43cc-98c4-5ba86499a3fc', '30000', '2026-01-12 02:13:02'),
('a6d80a03-91a4-4a1f-ae9d-1d8211414d32', 'ba690691-f150-4ed1-aeed-03d3bac0ec28', 'no', '2026-01-12 02:13:02'),
('a6d80a03-91a4-4a1f-ae9d-1d8211414d32', 'ccae946a-c47b-407a-98be-ad27e00a9f2b', 'Chittagong', '2026-01-12 02:13:02'),
('a6d80a03-91a4-4a1f-ae9d-1d8211414d32', 'd7b5b808-e7f4-4381-9bae-3cd1ec8f26d1', 'no', '2026-01-12 02:13:02'),
('b08e06ce-4b35-45cc-8906-081209058d9e', '48a2f6d6-291a-4760-9b11-2c1898c0d346', '4', '2026-01-12 02:06:48'),
('b08e06ce-4b35-45cc-8906-081209058d9e', 'a5de8f3a-d1ac-43cc-98c4-5ba86499a3fc', '20000', '2026-01-12 02:06:48'),
('b08e06ce-4b35-45cc-8906-081209058d9e', 'ba690691-f150-4ed1-aeed-03d3bac0ec28', 'YES', '2026-01-12 02:06:48'),
('b08e06ce-4b35-45cc-8906-081209058d9e', 'ccae946a-c47b-407a-98be-ad27e00a9f2b', 'Dhaka', '2026-01-12 02:06:48'),
('b08e06ce-4b35-45cc-8906-081209058d9e', 'd7b5b808-e7f4-4381-9bae-3cd1ec8f26d1', 'YES', '2026-01-12 02:06:48'),
('b3f3df81-452a-4beb-943d-fc1d83ce1cb4', '19a2e5dd-6bf5-42e6-ac41-8cdeeed1bdfc', '3.56', '2026-01-14 03:52:22'),
('b3f3df81-452a-4beb-943d-fc1d83ce1cb4', '19d61a75-a7ee-43a5-9d0c-87c48e1b9a90', '[\"Backward Districts\"]', '2026-01-14 03:52:22'),
('b3f3df81-452a-4beb-943d-fc1d83ce1cb4', '7cf9cef9-2e59-4e5e-983f-a403122f949e', '{\"district\":\"Noakhali\",\"upazila\":\"Begumganj\"}', '2026-01-14 03:52:22'),
('b3f3df81-452a-4beb-943d-fc1d83ce1cb4', 'c5454c49-9715-4f0a-ad7d-490d205a7950', '19000', '2026-01-14 03:52:22'),
('bc302067-06bb-4658-970a-7294fc1efde3', '19a2e5dd-6bf5-42e6-ac41-8cdeeed1bdfc', '2.75', '2026-01-15 16:18:32'),
('bc302067-06bb-4658-970a-7294fc1efde3', '2a928bfb-9cd5-4efa-be6b-e7066a2fa9b8', '5', '2026-01-15 16:18:32'),
('bc302067-06bb-4658-970a-7294fc1efde3', '2ebfe6d9-d9d5-4c88-abe7-6a0c5b2df7b4', '4.9', '2026-01-15 16:18:32'),
('bc302067-06bb-4658-970a-7294fc1efde3', '7cf9cef9-2e59-4e5e-983f-a403122f949e', '{\"district\":\"Bhola\",\"upazila\":\"Lalmohan\"}', '2026-01-15 16:18:32'),
('bc302067-06bb-4658-970a-7294fc1efde3', 'a2cf633c-118a-42f3-9837-098814a99605', 'Cobler', '2026-01-15 16:18:32'),
('bc302067-06bb-4658-970a-7294fc1efde3', 'c5454c49-9715-4f0a-ad7d-490d205a7950', '15000', '2026-01-15 16:18:32'),
('c25a80d0-35ae-4be6-92de-5b6588fb5e2b', '19a2e5dd-6bf5-42e6-ac41-8cdeeed1bdfc', '2.75', '2026-01-15 15:34:35'),
('c25a80d0-35ae-4be6-92de-5b6588fb5e2b', '19d61a75-a7ee-43a5-9d0c-87c48e1b9a90', 'Backward Districts', '2026-01-15 15:34:35'),
('c25a80d0-35ae-4be6-92de-5b6588fb5e2b', '2a928bfb-9cd5-4efa-be6b-e7066a2fa9b8', '3', '2026-01-15 15:34:35'),
('c25a80d0-35ae-4be6-92de-5b6588fb5e2b', '2ebfe6d9-d9d5-4c88-abe7-6a0c5b2df7b4', '5', '2026-01-15 15:34:35'),
('c25a80d0-35ae-4be6-92de-5b6588fb5e2b', '7cf9cef9-2e59-4e5e-983f-a403122f949e', '{\"district\":\"Noakhali\",\"upazila\":\"Hatiya\"}', '2026-01-15 15:34:35'),
('c25a80d0-35ae-4be6-92de-5b6588fb5e2b', 'a2cf633c-118a-42f3-9837-098814a99605', 'Businessmen', '2026-01-15 15:34:35'),
('c25a80d0-35ae-4be6-92de-5b6588fb5e2b', 'c5454c49-9715-4f0a-ad7d-490d205a7950', '29999', '2026-01-15 15:34:35'),
('c8f10828-8111-4ef4-bdfb-78dbc7525eda', '19a2e5dd-6bf5-42e6-ac41-8cdeeed1bdfc', '2', '2026-01-15 16:17:04'),
('c8f10828-8111-4ef4-bdfb-78dbc7525eda', '2a928bfb-9cd5-4efa-be6b-e7066a2fa9b8', '5', '2026-01-15 16:17:04'),
('c8f10828-8111-4ef4-bdfb-78dbc7525eda', '2ebfe6d9-d9d5-4c88-abe7-6a0c5b2df7b4', '5', '2026-01-15 16:17:04'),
('c8f10828-8111-4ef4-bdfb-78dbc7525eda', '7cf9cef9-2e59-4e5e-983f-a403122f949e', '{\"district\":\"Chandpur\",\"upazila\":\"Matlab Uttar\"}', '2026-01-15 16:17:04'),
('c8f10828-8111-4ef4-bdfb-78dbc7525eda', 'a2cf633c-118a-42f3-9837-098814a99605', 'Teacher', '2026-01-15 16:17:04'),
('c8f10828-8111-4ef4-bdfb-78dbc7525eda', 'c5454c49-9715-4f0a-ad7d-490d205a7950', '30000', '2026-01-15 16:17:04'),
('d2bbfb8a-cfd7-4575-a51a-3f46f1daaf06', '48a2f6d6-291a-4760-9b11-2c1898c0d346', '3.23', '2026-01-12 02:09:54'),
('d2bbfb8a-cfd7-4575-a51a-3f46f1daaf06', 'a5de8f3a-d1ac-43cc-98c4-5ba86499a3fc', '17000', '2026-01-12 02:09:54'),
('d2bbfb8a-cfd7-4575-a51a-3f46f1daaf06', 'ba690691-f150-4ed1-aeed-03d3bac0ec28', 'NO', '2026-01-12 02:09:54'),
('d2bbfb8a-cfd7-4575-a51a-3f46f1daaf06', 'ccae946a-c47b-407a-98be-ad27e00a9f2b', 'Feni', '2026-01-12 02:09:54'),
('db33574e-e3c9-4c7a-b3a8-5b4a72c7cc42', '19a2e5dd-6bf5-42e6-ac41-8cdeeed1bdfc', '3.78', '2026-01-15 16:19:55'),
('db33574e-e3c9-4c7a-b3a8-5b4a72c7cc42', '19d61a75-a7ee-43a5-9d0c-87c48e1b9a90', 'BNCC', '2026-01-15 16:19:55'),
('db33574e-e3c9-4c7a-b3a8-5b4a72c7cc42', '2a928bfb-9cd5-4efa-be6b-e7066a2fa9b8', '4', '2026-01-15 16:19:55'),
('db33574e-e3c9-4c7a-b3a8-5b4a72c7cc42', '2ebfe6d9-d9d5-4c88-abe7-6a0c5b2df7b4', '5', '2026-01-15 16:19:55'),
('db33574e-e3c9-4c7a-b3a8-5b4a72c7cc42', '7cf9cef9-2e59-4e5e-983f-a403122f949e', '{\"district\":\"Chandpur\",\"upazila\":\"Matlab Uttar\"}', '2026-01-15 16:19:55'),
('db33574e-e3c9-4c7a-b3a8-5b4a72c7cc42', 'a2cf633c-118a-42f3-9837-098814a99605', 'Farmer', '2026-01-15 16:19:55'),
('db33574e-e3c9-4c7a-b3a8-5b4a72c7cc42', 'c5454c49-9715-4f0a-ad7d-490d205a7950', '25000', '2026-01-15 16:19:55'),
('f3883650-f5e9-41ad-89af-c3d20505c17e', '1b9ad71b-b6af-4112-a64e-8edf416ccac0', '3.5', '2026-01-11 20:43:59'),
('f3883650-f5e9-41ad-89af-c3d20505c17e', '480e27ce-f010-4264-83f7-b73ab23c1348', 'Hasan', '2026-01-11 20:43:59'),
('f3883650-f5e9-41ad-89af-c3d20505c17e', '91d0c3af-b1ad-4d95-a7ff-ea057ac4052a', 'FF', '2026-01-11 20:43:59'),
('f51884f7-aafa-4bb3-b538-43a36107d3b9', '47b1ef17-6e32-475f-97ed-9260eb662658', 'test', '2025-12-26 01:37:50'),
('f51884f7-aafa-4bb3-b538-43a36107d3b9', '6908ed34-ef82-4c41-a11a-3fc60bef0a72', 'hello', '2025-12-26 01:37:50'),
('f51884f7-aafa-4bb3-b538-43a36107d3b9', 'af1134b6-063a-4bf1-9315-0ed82b2020de', '20', '2025-12-26 01:37:50'),
('f61da284-38bb-42fa-8713-5f11f5e03d77', '19a2e5dd-6bf5-42e6-ac41-8cdeeed1bdfc', '3.2', '2026-01-15 15:31:18'),
('f61da284-38bb-42fa-8713-5f11f5e03d77', '19d61a75-a7ee-43a5-9d0c-87c48e1b9a90', 'BNCC', '2026-01-15 15:31:18'),
('f61da284-38bb-42fa-8713-5f11f5e03d77', '2a928bfb-9cd5-4efa-be6b-e7066a2fa9b8', '5', '2026-01-15 15:31:18'),
('f61da284-38bb-42fa-8713-5f11f5e03d77', '2ebfe6d9-d9d5-4c88-abe7-6a0c5b2df7b4', '4', '2026-01-15 15:31:18'),
('f61da284-38bb-42fa-8713-5f11f5e03d77', '7cf9cef9-2e59-4e5e-983f-a403122f949e', '{\"district\":\"Feni\",\"upazila\":\"Feni Sadar\"}', '2026-01-15 15:31:18'),
('f61da284-38bb-42fa-8713-5f11f5e03d77', 'a2cf633c-118a-42f3-9837-098814a99605', 'Farmer', '2026-01-15 15:31:18'),
('f61da284-38bb-42fa-8713-5f11f5e03d77', 'c5454c49-9715-4f0a-ad7d-490d205a7950', '15000', '2026-01-15 15:31:18');

-- --------------------------------------------------------

--
-- Table structure for table `form_sessions`
--

CREATE TABLE `form_sessions` (
  `formSessionId` char(36) NOT NULL,
  `formId` char(36) NOT NULL,
  `sessionYear` varchar(50) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `form_sessions`
--

INSERT INTO `form_sessions` (`formSessionId`, `formId`, `sessionYear`, `created_at`) VALUES
('142c3e77-b9d2-4126-8099-5b1dfe379c9f', '8f24f0eb-d449-4786-b284-0138ef8a2f8b', '2020-2021', '2025-12-26 00:44:08'),
('19d4a3a8-8bf1-430e-a6a6-b1ca3b8b2a79', 'e6890c27-f3b5-41e0-958c-dc1c21649c29', '2021-2022', '2025-12-15 12:19:19'),
('22f90aa9-3a06-490e-942f-0d9ec87067ac', 'e6890c27-f3b5-41e0-958c-dc1c21649c29', '2024-2025', '2025-12-15 12:19:19'),
('2a3f695b-29b3-4e4f-a244-c9af8846db37', 'ec178699-3fd6-4edc-ad50-fec1ccbce61a', '2021-2022', '2026-01-22 23:20:19'),
('46c63e2e-9f6b-4e04-be57-25d3b59703af', '93690181-2489-4559-8b87-456ce15599fa', '2021-2022', '2025-12-14 18:53:29'),
('4707b6ae-4c6a-44c9-ad01-0bed04bfdd55', 'fffb6708-20fe-44d4-b428-3d885c20d6cd', '2021-2022', '2025-11-09 22:57:49'),
('4f511598-e205-4f7c-8ecc-c08917879a2e', 'cde55119-f3c1-4967-b561-18b5b41a6dfb', '2021-2022', '2026-01-11 21:24:24'),
('673e15e9-7759-452a-846a-58d2495504c0', 'c6dcb669-d39d-4ed1-ba35-5bcf86662b44', '2021-2022', '2025-12-26 01:32:35'),
('6845669a-eac7-4b6f-9042-e84d230bfec2', '8f24f0eb-d449-4786-b284-0138ef8a2f8b', '2021-2022', '2025-12-26 00:44:08'),
('7c6302ab-887e-48b9-9c09-920e94b5b40d', 'c6dcb669-d39d-4ed1-ba35-5bcf86662b44', '2020-2021', '2025-12-26 01:32:35'),
('8159ea08-28ad-435c-8cbf-75de0c913f60', 'ff7dc6b3-72f8-4e64-96c5-9ebfac9ce625', '2020-2021', '2026-01-12 01:53:45'),
('a5d61a89-6396-42ec-8ac2-c86836600103', '2248c16a-44ff-4da8-a1f5-d7e72468bd87', '2020-2021', '2025-12-26 02:08:42'),
('a61602d9-e122-441e-9e46-ae3eb4f1f0bb', 'ff7dc6b3-72f8-4e64-96c5-9ebfac9ce625', '2021-2022', '2026-01-12 01:53:45'),
('bf6c3ba8-617e-41d6-8e43-1bb04df627ab', 'ff7dc6b3-72f8-4e64-96c5-9ebfac9ce625', '2022-2023', '2026-01-12 01:53:45'),
('cd2b2f37-28f8-4933-abbc-c551accb5911', '2248c16a-44ff-4da8-a1f5-d7e72468bd87', '2021-2022', '2025-12-26 02:08:42'),
('d01ce00d-c677-4420-a12a-5313f76e8dd8', 'ff7dc6b3-72f8-4e64-96c5-9ebfac9ce625', '2023-2024', '2026-01-12 01:53:45'),
('e9ff6b85-bbbd-42e9-a05a-d7b10e37a74c', '1bd1b28d-f645-44af-8a29-59e19869b286', '2021-2022', '2026-01-14 02:30:03');

-- --------------------------------------------------------

--
-- Table structure for table `form_versions`
--

CREATE TABLE `form_versions` (
  `versionId` char(36) NOT NULL,
  `formId` char(36) NOT NULL,
  `versionNumber` int(11) NOT NULL,
  `status` enum('ACTIVE','INACTIVE','DELETED') NOT NULL DEFAULT 'ACTIVE',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `created_by` char(36) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `form_versions`
--

INSERT INTO `form_versions` (`versionId`, `formId`, `versionNumber`, `status`, `created_at`, `created_by`) VALUES
('00e6113a-1711-4097-a3d6-0f20cf3a3c15', 'c6dcb669-d39d-4ed1-ba35-5bcf86662b44', 1, 'ACTIVE', '2025-12-26 00:45:11', 'admin-muh'),
('574136f9-ff1f-4409-a07b-5440877a3c41', '2248c16a-44ff-4da8-a1f5-d7e72468bd87', 1, 'ACTIVE', '2025-12-26 02:08:42', 'admin-muh'),
('70b5abb0-32ab-4843-83db-464ada2690cf', '1bd1b28d-f645-44af-8a29-59e19869b286', 1, 'ACTIVE', '2026-01-14 02:30:03', 'admin-muh'),
('7dcc18be-ef43-4e16-8d59-5c254a2c9e79', '8f24f0eb-d449-4786-b284-0138ef8a2f8b', 1, 'ACTIVE', '2025-12-26 00:44:08', 'admin-muh'),
('99cca718-00b9-44cc-9f60-bd11ccd2b0db', 'ff7dc6b3-72f8-4e64-96c5-9ebfac9ce625', 1, 'ACTIVE', '2026-01-12 01:40:10', 'admin-muh'),
('c9f22ad6-6068-41e3-8802-49df523c988f', 'cde55119-f3c1-4967-b561-18b5b41a6dfb', 1, 'ACTIVE', '2025-11-05 15:48:25', 'admin-muh'),
('dda27cf3-2af8-485a-9ffa-2a10d43befba', '93690181-2489-4559-8b87-456ce15599fa', 1, 'ACTIVE', '2025-12-14 18:53:29', 'admin-ash'),
('e139d159-d8b5-4fb4-8d6a-c8904c0922bd', 'fffb6708-20fe-44d4-b428-3d885c20d6cd', 1, 'ACTIVE', '2025-11-09 22:57:49', 'admin-ash'),
('f0532ee7-5e54-40f7-976a-d9a1bb710319', 'ec178699-3fd6-4edc-ad50-fec1ccbce61a', 1, 'ACTIVE', '2026-01-14 02:59:36', 'admin-muh'),
('f26879fa-6f67-4ff2-936e-a5bf8ab6f377', 'e6890c27-f3b5-41e0-958c-dc1c21649c29', 1, 'ACTIVE', '2025-11-04 14:29:49', 'admin-muh');

-- --------------------------------------------------------

--
-- Table structure for table `halls`
--

CREATE TABLE `halls` (
  `hallId` char(36) NOT NULL,
  `hallCode` char(3) NOT NULL,
  `hallName` varchar(100) NOT NULL,
  `capacity` int(11) NOT NULL,
  `gender` enum('MALE','FEMALE') NOT NULL,
  `location` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `totalRooms` int(11) NOT NULL,
  `provostName` varchar(100) DEFAULT NULL,
  `provostContact` varchar(15) DEFAULT NULL,
  `provostEmail` varchar(100) DEFAULT NULL,
  `imageUrl` varchar(255) DEFAULT NULL,
  `status` enum('ACTIVE','INACTIVE','DELETED') NOT NULL DEFAULT 'ACTIVE',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `halls`
--

INSERT INTO `halls` (`hallId`, `hallCode`, `hallName`, `capacity`, `gender`, `location`, `description`, `totalRooms`, `provostName`, `provostContact`, `provostEmail`, `imageUrl`, `status`, `created_at`, `updated_at`) VALUES
('hall-ash', 'ASH', 'Basha Shaheed Abdus Salam Hall', 400, 'MALE', 'NSTU Campus, Sonapur, Noakhali-3814', 'Hall for male students with modern facilities.', 120, 'Md. Farid Dewan', '+8801717386048', 'provost.ash@nstu.edu.bd', '/halls/ASH.jpg', 'ACTIVE', '2025-10-28 20:53:35', NULL),
('hall-bkh', 'BKH', 'Hazrat Bibi Khadiza Hall', 300, 'FEMALE', 'NSTU Campus, Sonapur, Noakhali-3814', 'Female hall with secure accommodations.', 100, 'Hall Provost', '+880-XXXX-XXXXX', 'provost.bkh@nstu.edu.bd', '/halls/BKH.jpg', 'ACTIVE', '2025-10-28 20:53:35', NULL),
('hall-jsh', 'JSH', 'Shahid Smriti Chatri Hall', 400, 'FEMALE', 'NSTU Campus, Sonapur, Noakhali-3814', 'Female hall dedicated to Shahid Smriti Chatri.', 120, 'Hall Provost', '+880-XXXX-XXXXX', 'provost.jsh@nstu.edu.bd', '/halls/JSH.jpg', 'ACTIVE', '2026-01-09 20:06:54', '2026-01-12 02:54:57'),
('hall-muh', 'MUH', 'Bir Muktijuddha Abdul Malek Ukil Hall', 350, 'MALE', 'NSTU Campus, Sonapur, Noakhali-3814', 'Residential hall dedicated to Bir Muktijuddha Abdul Malek Ukil.', 110, 'Hall Provost', '+880-XXXX-XXXXX', 'provost.muh@nstu.edu.bd', '/halls/MUH.jpg', 'ACTIVE', '2025-10-28 20:53:35', NULL),
('hall-nfh', 'NFH', 'Nawab Faizunnesa Choudhurani Hall', 350, 'FEMALE', 'NSTU Campus, Sonapur, Noakhali-3814', 'Female hall dedicated to Nawab Faizunnesa Choudhurani.', 110, 'Hall Provost', '+880-XXXX-XXXXX', 'provost.nfh@nstu.edu.bd', '/halls/NFH.jpg', 'ACTIVE', '2026-01-09 20:06:54', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `interviews`
--

CREATE TABLE `interviews` (
  `interviewId` char(36) NOT NULL,
  `applicationId` char(36) NOT NULL,
  `date` date NOT NULL,
  `time` varchar(16) NOT NULL,
  `venue` varchar(255) NOT NULL,
  `interviewScore` decimal(5,2) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `interviews`
--

INSERT INTO `interviews` (`interviewId`, `applicationId`, `date`, `time`, `venue`, `interviewScore`, `created_at`, `updated_at`, `status`) VALUES
('0216f187-bcf2-4910-ba50-3151aec7e012', '02e003d5-a3a9-46dd-b90d-4ce505158174', '2026-01-12', '22:08', 'Hall Office', NULL, '2026-01-12 10:08:16', '2026-01-15 16:46:06', 2),
('283e632c-2cec-4e1c-95f3-85b994dc4abe', 'bb76ce59-1b85-43e8-972e-b1c9aad0e617', '2025-12-24', '16:58', 'Hall office', 0.00, '2025-12-25 02:45:58', '2025-12-25 04:58:42', 1),
('359247f9-7b47-46e2-aead-80d9ff92aade', '88844505-03ef-4f9a-add8-c4584eb5eaf8', '2025-01-10', '00:47', 'ADI', 20.00, '2025-12-26 00:47:44', '2025-12-26 00:47:57', 1),
('51e94620-b814-4892-8f46-ac1f43a4ed88', '991329f5-552e-4f8d-a0e9-6cd6913f12e8', '2026-01-02', '10:11', 'hall office', 50.00, '2025-12-25 22:11:24', '2025-12-25 22:11:38', 1),
('5633ca26-ff37-4d8c-9c41-1ffc466e02fa', '3e720e16-d8e5-4ac0-81e3-f44208dad6af', '2025-12-26', '01:38', 'adi', 30.00, '2025-12-26 01:39:09', '2025-12-26 01:39:22', 1),
('6bb9d7eb-b3d3-4854-9756-3bd17509d536', '359d48b5-6f06-416e-8352-6dee6bd9f0bf', '2026-01-12', '01:24', 'hall office', 50.00, '2026-01-11 01:24:13', '2026-01-11 01:24:43', 1),
('7124e81c-3bed-4db0-8fff-5ecba7fc5bc2', '65ac72c5-b0b4-45ee-95ff-5e24095f1b81', '2026-01-12', '22:08', 'Hall Office', 20.00, '2026-01-12 10:08:16', '2026-01-12 10:09:53', 1),
('754262ca-569b-46e0-8063-bb61593a1202', '8b4a5628-caef-4d29-92a3-ac3234333974', '2025-12-26', '02:10', 'adi', 5.00, '2025-12-26 02:10:17', '2025-12-26 02:10:41', 1),
('9762fc35-145b-4132-a80e-16986e0e65c7', 'ec42fd37-691c-49ab-be90-fad5207d71c9', '2025-12-24', '16:58', 'Hall office', 10.00, '2025-12-25 02:45:58', '2025-12-25 04:58:42', 1),
('a28ac93d-d5b7-4f37-a4a2-86b0bb13d918', 'd78656b0-7a07-46d1-878a-1efc7ceb5e6b', '2026-01-12', '10:11', 'Hall Office', 15.00, '2026-01-12 10:11:36', '2026-01-12 10:11:49', 1),
('c24cbf05-a0da-4415-87ba-bf9a565fee4f', 'ec2fe4c9-04ec-4140-8648-82a5863e26be', '2025-01-25', '01:08', 'Library', 30.00, '2026-01-09 13:08:07', '2026-01-09 13:08:25', 1),
('c74d3d86-286f-41f3-bbef-ac39dcd15b51', '23cb058b-42e4-439e-9c4d-7d81358d189d', '2026-01-14', '15:54', 'hall office', NULL, '2026-01-14 03:55:06', NULL, 0),
('df18b891-5bd6-4b14-9958-29163c1dfb58', 'e59d076e-3e13-4b04-91de-1687a066b62a', '2025-12-26', '15:22', 'adi', 20.00, '2025-12-26 15:23:03', '2025-12-26 15:23:40', 1),
('dfbf4a60-1001-4230-bb20-f42e431d1479', '93ffecc6-1e19-4ad4-922d-ea4a81ccf28e', '2026-01-12', '22:08', 'Hall Office', NULL, '2026-01-12 10:08:16', '2026-01-15 01:02:11', 2),
('dfbf4dfb-1307-45b6-922d-13e719e454e8', '57424caa-1cfc-4740-9b2b-1002259545e5', '2026-01-16', '15:46', 'ADDD', NULL, '2026-01-15 15:43:49', NULL, 0);

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `notificationId` char(36) NOT NULL,
  `hallId` char(36) DEFAULT NULL,
  `userId` char(36) DEFAULT NULL,
  `title` varchar(120) NOT NULL,
  `body` text NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`notificationId`, `hallId`, `userId`, `title`, `body`, `created_at`) VALUES
('053a472f-376f-4141-b077-9c9c0f2f27af', 'hall-muh', 'MUH2233020M', 'Renewal Approved', 'Your renewal request for 2021 was approved. New seat expiry: 2026-12-31.', '2025-12-26 15:34:12'),
('072640c1-9ff3-491f-b15d-8779052172fc', 'hall-muh', 'MUH2225013M', 'Seat Allocated', 'Your seat has been allocated. Room 102. Seat expiry: 2027-01-11.', '2026-01-12 03:40:02'),
('09e97953-d5df-49c5-81e1-f1f212f59b75', 'hall-muh', 'MUH2125020M', 'Interview Scheduled', 'Your interview for \"Test-20\" is scheduled on 2025-12-26 at 01:38 in adi.', '2025-12-26 01:39:09'),
('0efb1fa0-411e-4ad6-acb4-0f6dace7fb86', 'hall-muh', NULL, 'Hello', '123', '2026-01-11 21:50:19'),
('0fef5488-d4f0-4996-873d-08bcf84a9c8f', 'hall-ash', NULL, 'test notification', 'Apply for seat', '2025-12-24 14:01:02'),
('220bb195-d4af-4135-ae7d-7aad9855865a', 'hall-muh', 'MUH2225058M', 'Application Rejected', 'Your application for \"Test-form\" was rejected. Reason: miss match informaation', '2026-01-15 00:52:45'),
('2269a944-1a5a-44cf-8e77-cf15f670c440', 'hall-muh', 'MUH2225062M', 'Interview Scheduled', 'Your interview for \"Application Form-2026\" is scheduled on 2026-01-12 at 22:08 in Hall Office.', '2026-01-12 10:08:17'),
('246ea28a-03a2-4bd1-9c6a-1dcb1e0dd3ab', 'hall-muh', 'MUH2225061M', 'Renewal Submitted', 'Your renewal request for 2021-2022 has been submitted and is pending admin review.', '2026-01-12 10:17:59'),
('2500207d-fb80-4333-84db-0f2acc9d0eab', 'hall-muh', 'MUH2225061M', 'Renewal Rejected', 'Your renewal request for 2021-2022 was rejected.', '2026-01-15 12:54:28'),
('2a2120fa-411e-461c-95e2-cb904107e1cb', 'hall-muh', 'MUH2225001M', 'Interview Scheduled', 'Your interview for form e6890c27-f3b5-41e0-958c-dc1c21649c29 is scheduled on 2334-12-31 at 14:34 in abc.', '2025-12-25 02:34:19'),
('2b96fe55-2fe4-4636-9fc2-5e0665bc5a45', 'hall-muh', 'MUH2225001M', 'Interview Scheduled', 'Your interview for form e6890c27-f3b5-41e0-958c-dc1c21649c29 is scheduled on 4566-12-31 at 15:33 in abc.', '2025-12-25 02:32:39'),
('2cb40634-0e8d-449e-ba0d-fd42a399d9eb', 'hall-muh', 'MUH2225026M', 'Interview Scheduled', 'Your interview for \"Test-21\" is scheduled on 2026-01-12 at 01:24 in hall office.', '2026-01-11 01:24:13'),
('334db500-b10e-4ca5-8726-6c878ee52a42', NULL, NULL, 'huttt', '', '2026-01-10 01:41:22'),
('339aa1a9-6bea-4bc5-900b-31453e1172dc', 'hall-muh', 'MUH2125020M', 'Interview Scheduled', 'Your interview for \"Test-21\" is scheduled on 2025-12-26 at 02:10 in adi.', '2025-12-26 02:10:17'),
('33f32a7f-5b64-4b7a-8d19-b4512e1e2899', 'hall-muh', 'MUH2233020M', 'Renewal Submitted', 'Your renewal request for 2021 has been submitted and is pending admin review.', '2025-12-26 15:32:44'),
('38d9bbdc-aa27-46f6-96d9-0d7c7702205a', 'hall-muh', 'student-muh', 'Interview Scheduled', 'Your interview for form e6890c27-f3b5-41e0-958c-dc1c21649c29 is scheduled on 0025-02-01 at 10:38 in adi.', '2025-12-24 22:39:03'),
('419f45e0-59da-49f1-9d16-f8af4916443f', 'hall-muh', 'MUH2225001M', 'Interview Scheduled', 'Your interview for form e6890c27-f3b5-41e0-958c-dc1c21649c29 is scheduled on 2025-12-17 at 12:24 in Audi.', '2025-12-16 12:22:28'),
('444a33a7-02f1-456a-a960-5ac9f3a9e290', 'hall-muh', 'MUH2225056M', 'Interview Scheduled', 'Your interview for \"Application Form-2026\" is scheduled on 2026-01-12 at 22:08 in Hall Office.', '2026-01-12 10:08:16'),
('579d24f7-6124-47f0-b878-d40f9663b878', 'hall-muh', 'MUH2225064M', 'Seat Allocated', 'Your seat has been allocated. Room 104. Seat expiry: 2027-01-14.', '2026-01-15 01:53:18'),
('586eddc5-1877-4e8b-8d30-57dc690897a6', 'hall-muh', 'student-muh', 'Interview Scheduled', 'Your interview for form e6890c27-f3b5-41e0-958c-dc1c21649c29 is scheduled on 2025-12-24 at 16:58 in Hall office.', '2025-12-25 04:58:42'),
('5cd952a4-2e71-436b-bb3f-1a07691cf568', 'hall-muh', 'MUH2225001M', 'Interview Scheduled', 'Your interview for form e6890c27-f3b5-41e0-958c-dc1c21649c29 is scheduled on 2026-12-02 at 14:45 in Hall Office.', '2025-12-25 02:45:58'),
('71c041fa-69bc-4f13-977c-89db35ec6dbe', 'hall-muh', 'MUH2225061M', 'Seat Allocated', 'Your seat has been allocated. Room 102. Seat expiry: 2027-01-12.', '2026-01-12 10:12:29'),
('73a084b8-b291-44ca-a24d-7fcb0d608325', NULL, NULL, 'New Exam Seat Plan Available', '', '2026-01-10 01:40:28'),
('78cc5ff6-e584-4ea3-90bb-9c24f20ee95e', 'hall-ash', 'ASH2225033M', 'Seat Allocated', 'Your seat has been allocated. Room 101. Seat expiry: 2027-01-09.', '2026-01-09 13:08:36'),
('798e49f4-c621-418a-9cd6-14ab9295fed4', 'hall-muh', 'MUH2233020M', 'Seat Allocated', 'Your seat has been allocated. Room 203. Seat expiry: 2025-12-31.', '2025-12-26 15:24:49'),
('7a7eb203-e511-4139-86f6-a8ae3bce405d', 'hall-muh', 'MUH2233020M', 'Interview Scheduled', 'Your interview for \"Test-21\" is scheduled on 2025-12-26 at 15:22 in adi.', '2025-12-26 15:23:03'),
('7ba0f01c-e8a5-4aef-a280-42266c332d42', 'hall-muh', 'MUH2225061M', 'Interview Scheduled', 'Your interview for \"Application Form-2026\" is scheduled on 2026-01-12 at 10:11 in Hall Office.', '2026-01-12 10:11:36'),
('7eb412db-a362-4ce2-9a10-23d8899ec171', 'hall-muh', 'MUH2225030M', 'Interview Scheduled', 'Your interview for form cde55119-f3c1-4967-b561-18b5b41a6dfb is scheduled on 2026-01-02 at 10:11 in hall office.', '2025-12-25 22:11:24'),
('86e46084-73bc-4a1c-821b-b14cfdb945ab', 'hall-muh', 'MUH2225001M', 'Interview Scheduled', 'Your interview for form e6890c27-f3b5-41e0-958c-dc1c21649c29 is scheduled on 0025-02-01 at 10:38 in adi.', '2025-12-24 22:39:03'),
('8e94eaa2-032b-499f-8a85-49bff37cf749', 'hall-muh', 'MUH2225026M', 'Seat Allocated', 'Your seat has been allocated. Room 101. Seat expiry: 2027-01-10.', '2026-01-11 01:26:35'),
('98940cc8-d74c-44d3-a484-73496841aa99', 'hall-muh', 'student-muh', 'Interview Scheduled', 'Your interview for form e6890c27-f3b5-41e0-958c-dc1c21649c29 is scheduled on 2334-12-31 at 14:34 in abc.', '2025-12-25 02:34:19'),
('9a936b5c-3f34-4f0a-ae93-c672c171e5b7', 'hall-muh', 'MUH2225001M', 'Interview Scheduled', 'Your interview for form e6890c27-f3b5-41e0-958c-dc1c21649c29 is scheduled on 2025-12-24 at 16:58 in Hall office.', '2025-12-25 04:58:42'),
('a36862bb-e7c4-4b88-9aa2-a5be7617235d', 'hall-muh', 'MUH2225067M', 'Seat Allocated', 'Your seat has been allocated. Room 102. Seat expiry: 2027-01-14.', '2026-01-15 01:48:46'),
('ac98d4eb-b6b8-4c5a-9e91-cd81602e76af', 'hall-muh', '1454f781-e5f6-49e1-8ed7-f32599263e71', 'Seat Allocated', 'Your seat has been allocated. Room 101. Seat expiry: 2027-01-10.', '2026-01-11 03:26:34'),
('acb398fc-20b9-4e4a-ada3-a8b70e075af2', 'hall-muh', 'MUH2225062M', 'Interview Scheduled', 'Your interview for \"Test-form\" is scheduled on 2026-01-14 at 15:54 in hall office.', '2026-01-14 03:55:06'),
('b0a7b4f7-bd04-4196-8229-ddc1cbc95797', 'hall-ash', 'ASH2225033M', 'Interview Scheduled', 'Your interview for \"Test1\" is scheduled on 2025-01-25 at 01:08 in Library.', '2026-01-09 13:08:07'),
('b1b1de14-45d3-42ba-a5df-b6e55d63009a', 'hall-muh', 'MUH2225051M', 'Interview Scheduled', 'Your interview for \"Application Form-2026\" is scheduled on 2026-01-12 at 22:08 in Hall Office.', '2026-01-12 10:08:16'),
('b3c3af0c-ef7a-4590-abeb-b1707fec1c28', 'hall-muh', 'MUH2125020M', 'Seat Cancelled', 'Your seat was cancelled because the 4-year allotment period ended and no active renewal was found for 2025.', '2025-12-26 02:05:06'),
('b5239f0a-dbec-4546-8ff7-7af4d82ce031', 'hall-muh', 'MUH2225001M', 'Interview Scheduled', 'Your interview for form e6890c27-f3b5-41e0-958c-dc1c21649c29 is scheduled on 2344-12-23 at 02:03 in office.', '2025-12-25 02:03:23'),
('bd9545fb-551c-42fd-b7a2-85b7a7a839bd', 'hall-muh', NULL, 'Allotment Result', 'The allotment for 2025 has been published', '2026-01-11 21:41:43'),
('ca727492-6a27-470a-a7a7-5fa86cdd0cbd', NULL, NULL, 'New Exam Result Available', '', '2026-01-10 01:40:59'),
('d324845a-0a10-411c-9036-7c1c0188257e', 'hall-muh', 'MUH2125013M', 'Seat Cancelled', 'Your seat was cancelled because the 4-year allotment period ended and no active renewal was found for 2025.', '2025-12-26 01:03:20'),
('d7c0cf36-2a3b-498d-945a-3b0e4c9aa2f7', 'hall-muh', 'student-muh', 'Interview Scheduled', 'Your interview for form e6890c27-f3b5-41e0-958c-dc1c21649c29 is scheduled on 2026-12-02 at 14:45 in Hall Office.', '2025-12-25 02:45:58'),
('d8e5c495-abd2-4614-88c7-3cbeac76967e', 'hall-muh', 'MUH2225066M', 'Interview Scheduled', 'Your interview for \"Test-form\" is scheduled on 2026-01-16 at 15:46 in ADDD.', '2026-01-15 15:43:49'),
('dcb9d01e-97cb-4b10-aa05-25b62c4846f9', 'hall-muh', NULL, 'Allotment-2025', 'Application start from March', '2025-12-16 21:13:55'),
('dec04e55-91f0-4ed3-941f-39789a110b26', 'hall-muh', 'MUH2225056M', 'Application Rejected', 'Your application for \"Application Form-2026\" was rejected. Reason: Absent in interview', '2026-01-15 16:46:06'),
('dee6d572-69ef-4bca-9d27-7cfa37b7bfe7', 'hall-muh', 'student-muh', 'Interview Scheduled', 'Your interview for form e6890c27-f3b5-41e0-958c-dc1c21649c29 is scheduled on 2344-12-23 at 02:03 in office.', '2025-12-25 02:03:23'),
('e47adf25-a81b-4298-8f9c-c41ae0c327dc', 'hall-muh', 'MUH2225061M', 'Renewal Reminder', 'Your seat will be cancelled when 2026 starts. 30 day(s) left to apply for renewal.', '2026-01-13 23:32:33'),
('f261f12f-ba55-4d83-9b99-9c2d569c38e2', NULL, NULL, 'New Exam Seat Plan Available', '', '2026-01-10 01:42:04'),
('f4ccb57e-56c1-49a5-88f3-04992107c356', 'hall-muh', 'MUH2225062M', 'Application Rejected', 'Your application for \"Application Form-2026\" was rejected. Reason: Absent in interview', '2026-01-15 01:02:11'),
('f61fa375-c892-43bf-bb7a-556d4383cb22', 'hall-muh', 'MUH2125013M', 'Interview Scheduled', 'Your interview for \"Test-20\" is scheduled on 2025-01-10 at 00:47 in ADI.', '2025-12-26 00:47:44'),
('fc144094-4c22-4116-8ecb-8d520bcf9dc9', 'hall-muh', 'MUH2225013M', 'Interview Scheduled', 'Your interview for form e6890c27-f3b5-41e0-958c-dc1c21649c29 is scheduled on 2025-12-24 at 16:58 in Hall office.', '2025-12-25 04:58:42'),
('ff6b2fc9-a36e-4d76-803b-141aba43e55f', 'hall-muh', 'student-muh', 'Interview Scheduled', 'Your interview for form e6890c27-f3b5-41e0-958c-dc1c21649c29 is scheduled on 4566-12-31 at 15:33 in abc.', '2025-12-25 02:32:39');

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `paymentId` char(36) NOT NULL,
  `studentId` char(36) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `status` enum('PENDING','PAID','FAILED','REFUNDED','CANCELLED') NOT NULL DEFAULT 'PENDING',
  `paymentType` enum('ADMISSION_FEE','MONTHLY_RENT','SECURITY_DEPOSIT','FINE','UTILITY_BILL','CAUTION_MONEY','OTHER') NOT NULL DEFAULT 'OTHER',
  `invoiceId` varchar(100) DEFAULT NULL,
  `transactionId` varchar(100) DEFAULT NULL,
  `paymentMethod` varchar(50) DEFAULT NULL,
  `paidAt` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `renewals`
--

CREATE TABLE `renewals` (
  `renewalId` char(36) NOT NULL,
  `studentId` char(36) NOT NULL,
  `allocationId` char(36) NOT NULL,
  `academicYear` varchar(10) NOT NULL,
  `status` enum('PENDING','UNDER_REVIEW','APPROVED','REJECTED') NOT NULL DEFAULT 'PENDING',
  `applicationDate` datetime NOT NULL DEFAULT current_timestamp(),
  `reviewedBy` char(36) DEFAULT NULL,
  `reviewedAt` datetime DEFAULT NULL,
  `approvedAt` datetime DEFAULT NULL,
  `rejectionReason` text DEFAULT NULL,
  `attachmentId` char(36) DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `renewals`
--

INSERT INTO `renewals` (`renewalId`, `studentId`, `allocationId`, `academicYear`, `status`, `applicationDate`, `reviewedBy`, `reviewedAt`, `approvedAt`, `rejectionReason`, `attachmentId`, `remarks`, `created_at`, `updated_at`) VALUES
('2d594fd7-fd9e-437e-8ee3-22957094a781', 'MUH2225061M', 'cdaaf561-3961-42fd-8a6f-c24f01e79e35', '2021-2022', 'REJECTED', '2026-01-12 10:17:59', 'admin-muh', '2026-01-15 12:54:28', NULL, 'Rejected', 'bd6ba801-ddd2-477e-8e0b-5271d66fa566', 'Not completed', '2026-01-12 10:17:59', '2026-01-15 12:54:28'),
('53dbaedf-062b-4087-b0bf-ed4e17ea22be', 'MUH2225030M', '57c72a7a-f391-4d51-a095-f231c5f9c557', '2021', 'REJECTED', '2025-12-26 01:09:48', 'admin-muh', '2025-12-26 01:11:00', NULL, 'Rejected', NULL, 'not complete', '2025-12-26 01:09:48', '2025-12-26 01:11:00'),
('6a8e2d70-d2d6-4ea6-8b34-703edee7c9d1', 'MUH2225030M', '57c72a7a-f391-4d51-a095-f231c5f9c557', '2021-22', 'APPROVED', '2025-12-26 01:05:26', 'admin-muh', '2025-12-26 01:08:07', '2025-12-26 01:08:07', NULL, NULL, 'not complete yet', '2025-12-26 01:05:26', '2025-12-26 01:08:07'),
('755a40fe-249d-49b8-b8ba-b06ad71411b2', 'MUH2233020M', 'b0d47146-1ddf-4f42-a175-7070ba818c51', '2021', 'APPROVED', '2025-12-26 15:32:44', 'admin-muh', '2025-12-26 15:34:12', '2025-12-26 15:34:12', NULL, NULL, 'not complete', '2025-12-26 15:32:44', '2025-12-26 15:34:12'),
('98ef6ded-740d-4bdd-9f15-c2a5ce21d2b2', 'MUH2225030M', '57c72a7a-f391-4d51-a095-f231c5f9c557', '2020', 'APPROVED', '2025-12-26 01:26:58', 'admin-muh', '2025-12-26 01:28:09', '2025-12-26 01:28:09', NULL, NULL, 'not complete', '2025-12-26 01:26:58', '2025-12-26 01:28:09');

-- --------------------------------------------------------

--
-- Table structure for table `rooms`
--

CREATE TABLE `rooms` (
  `roomId` char(36) NOT NULL,
  `hallId` char(36) NOT NULL,
  `roomNumber` varchar(10) NOT NULL,
  `floorNumber` int(11) NOT NULL,
  `capacity` int(11) NOT NULL,
  `currentOccupancy` int(11) NOT NULL DEFAULT 0,
  `roomType` enum('SINGLE','DOUBLE','TRIPLE','QUAD') NOT NULL,
  `status` enum('AVAILABLE','OCCUPIED','MAINTENANCE','UNDER_REPAIR','RESERVED') NOT NULL DEFAULT 'AVAILABLE',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `rooms`
--

INSERT INTO `rooms` (`roomId`, `hallId`, `roomNumber`, `floorNumber`, `capacity`, `currentOccupancy`, `roomType`, `status`, `created_at`, `updated_at`) VALUES
('0cff39b9-6137-4516-92ec-d663a219f0c0', 'hall-muh', '101', 1, 5, 3, 'SINGLE', 'AVAILABLE', '2025-12-24 22:15:22', '2026-01-12 01:18:14'),
('18a960bf-c55d-4f96-b72d-088b16a17e2f', 'hall-muh', '302', 3, 5, 0, 'SINGLE', 'AVAILABLE', '2026-01-12 01:21:47', NULL),
('337bd74d-f2ce-46f5-9fe0-81c5c535e543', 'hall-muh', '303', 3, 5, 0, 'SINGLE', 'AVAILABLE', '2026-01-12 01:21:59', NULL),
('3a5255e3-9df7-437b-9a3e-4522b3cb5ca2', 'hall-muh', '211', 2, 20, 0, 'DOUBLE', 'AVAILABLE', '2026-01-12 01:21:21', NULL),
('455a0fec-495b-4b20-b6e5-d445cb6c8cbf', 'hall-muh', '501', 5, 5, 0, 'SINGLE', 'AVAILABLE', '2025-12-25 00:49:26', '2026-01-12 01:24:41'),
('45a69bdd-0b24-4d47-ae75-7b73aec4287a', 'hall-muh', '403', 4, 5, 0, 'SINGLE', 'AVAILABLE', '2026-01-12 01:24:05', NULL),
('4e53b156-17e8-46c7-b6c4-8ff34f79eb21', 'hall-muh', '103', 1, 5, 0, 'SINGLE', 'AVAILABLE', '2026-01-12 01:17:33', NULL),
('4f3a6e13-3d7c-494d-9130-b0d87c1939fb', 'hall-muh', '504', 5, 5, 0, 'SINGLE', 'AVAILABLE', '2026-01-12 01:25:48', NULL),
('512a429d-7500-4e10-b3e8-3aad776fdc01', 'hall-ash', '101', 1, 6, 1, 'SINGLE', 'AVAILABLE', '2025-12-24 22:11:35', '2026-01-09 13:08:36'),
('5236787b-8464-4167-bda8-c2cc36fce071', 'hall-ash', '102', 1, 10, 0, 'DOUBLE', 'AVAILABLE', '2025-12-24 22:12:25', NULL),
('5ef343a6-4161-43bf-a283-e0c18f107199', 'hall-muh', '502', 5, 5, 0, 'SINGLE', 'AVAILABLE', '2026-01-12 01:25:22', NULL),
('5f93ed1e-5d6b-4170-a865-48dac90bcfd9', 'hall-ash', '201', 2, 5, 0, 'SINGLE', 'AVAILABLE', '2026-01-12 02:29:19', NULL),
('60e6e4d4-6b43-4b88-a4d0-bda1337b1459', 'hall-muh', '505', 5, 5, 0, 'SINGLE', 'AVAILABLE', '2026-01-12 01:25:58', NULL),
('64cc130c-4c7e-404b-a9a5-5e4222afae6e', 'hall-muh', '205', 2, 5, 0, 'SINGLE', 'AVAILABLE', '2026-01-12 01:20:15', NULL),
('6931ddb2-1724-4757-8967-4ebb78bda49b', 'hall-muh', '401', 4, 5, 0, 'SINGLE', 'AVAILABLE', '2026-01-12 01:16:58', NULL),
('729a5428-3653-48d2-a9b4-1a94d6b1fd14', 'hall-muh', '304', 3, 5, 0, 'SINGLE', 'AVAILABLE', '2026-01-12 01:22:09', NULL),
('7fdc6e17-5ab6-4572-aa15-643ae8800883', 'hall-muh', '405', 4, 5, 0, 'SINGLE', 'AVAILABLE', '2026-01-12 01:23:23', NULL),
('826004c9-95a9-4579-a293-8178d59014f8', 'hall-muh', '212', 2, 20, 0, 'DOUBLE', 'AVAILABLE', '2026-01-12 01:20:56', NULL),
('8473b91d-3353-47d7-8559-7df532edd64c', 'hall-muh', '404', 4, 5, 0, 'SINGLE', 'AVAILABLE', '2026-01-12 01:23:47', NULL),
('9884d11b-548c-4687-8d92-e4db776864dc', 'hall-muh', '104', 1, 5, 1, 'SINGLE', 'AVAILABLE', '2026-01-12 01:17:45', '2026-01-15 01:53:18'),
('98d6c611-1bd1-42a3-bc7a-41aabae855f6', 'hall-ash', '401', 4, 5, 0, 'SINGLE', 'AVAILABLE', '2026-01-12 02:29:42', NULL),
('c680f89c-0964-49fc-865f-3cda011df5b8', 'hall-muh', '503', 5, 5, 0, 'SINGLE', 'AVAILABLE', '2026-01-12 01:25:38', NULL),
('c7cdcf75-5f82-4e2a-a29e-56eac9d7f81d', 'hall-muh', '301', 3, 5, 0, 'SINGLE', 'AVAILABLE', '2026-01-12 01:16:45', NULL),
('d9c77c08-082b-4bcd-a7fe-d8b9bccfb310', 'hall-muh', '102', 1, 5, 1, 'SINGLE', 'AVAILABLE', '2026-01-12 01:17:19', '2026-01-15 01:52:12'),
('db39fcde-8794-41d6-9683-44e9d3a71341', 'hall-ash', '503', 5, 5, 0, 'SINGLE', 'AVAILABLE', '2025-12-26 06:40:26', NULL),
('de856ed2-6896-49a1-a4cd-e568551f57da', 'hall-muh', '203', 2, 5, 2, 'SINGLE', 'AVAILABLE', '2025-12-25 01:50:17', '2026-01-12 01:19:24'),
('e065f985-771f-4a84-9fde-c29b98ec2a64', 'hall-muh', '201', 2, 5, 0, 'SINGLE', 'AVAILABLE', '2026-01-12 01:20:38', NULL),
('e5ea8ff5-7534-452e-b00f-1bf1483de420', 'hall-ash', '301', 3, 5, 0, 'SINGLE', 'AVAILABLE', '2026-01-12 02:29:30', NULL),
('ea06731c-e263-46a1-905f-daec101c6197', 'hall-muh', '105', 1, 5, 0, 'SINGLE', 'AVAILABLE', '2026-01-12 01:18:28', NULL),
('ebb521a3-6732-4df1-b089-cdcf687b46a6', 'hall-muh', '402', 4, 5, 0, 'SINGLE', 'AVAILABLE', '2026-01-12 01:22:37', NULL),
('eedf1e3d-9293-4d57-acdc-98fb1e4d55aa', 'hall-muh', '202', 2, 5, 0, 'SINGLE', 'AVAILABLE', '2026-01-12 01:20:00', NULL),
('f13983fe-4f66-44a2-8877-49560f456551', 'hall-muh', '305', 3, 5, 0, 'SINGLE', 'AVAILABLE', '2026-01-12 01:22:19', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `staff_profiles`
--

CREATE TABLE `staff_profiles` (
  `userId` char(36) NOT NULL,
  `designation` varchar(100) NOT NULL,
  `department` varchar(100) NOT NULL,
  `hallId` char(36) DEFAULT NULL,
  `phone` varchar(15) DEFAULT NULL,
  `photoUrl` varchar(255) DEFAULT NULL,
  `responsibilities` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`responsibilities`)),
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL ON UPDATE current_timestamp(),
  `created_by` char(36) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `staff_profiles`
--

INSERT INTO `staff_profiles` (`userId`, `designation`, `department`, `hallId`, `phone`, `photoUrl`, `responsibilities`, `created_at`, `updated_at`, `created_by`) VALUES
('staff-ash', 'Hall Manager', 'Student Welfare', 'hall-ash', '+8801800000001', NULL, '[\"Handle student complaints\",\"Coordinate with provost\",\"Monitor hall discipline\",\"Manage student grievances\"]', '2026-01-09 19:53:14', NULL, NULL),
('staff-bkh', 'Hall Manager', 'Student Welfare', 'hall-bkh', '+8801900000001', NULL, '[\"Handle student complaints\",\"Coordinate with provost\",\"Monitor hall discipline\",\"Manage student grievances\"]', '2026-01-09 19:53:14', NULL, NULL),
('staff-jsh', 'Hall Manager', 'Student Welfare', 'hall-jsh', '+8801800000003', NULL, '[\"Handle student complaints\",\"Coordinate with provost\",\"Monitor hall discipline\",\"Manage student grievances\"]', '2026-01-09 20:06:54', NULL, NULL),
('staff-muh', 'Hall Manager', 'Student Welfare', 'hall-muh', '+8801700000001', NULL, '[\"Handle student complaints\",\"Coordinate with provost\",\"Monitor hall discipline\",\"Manage student grievances\"]', '2026-01-09 19:53:14', NULL, NULL),
('staff-nfh', 'Hall Manager', 'Student Welfare', 'hall-nfh', '+8801700000003', NULL, '[\"Handle student complaints\",\"Coordinate with provost\",\"Monitor hall discipline\",\"Manage student grievances\"]', '2026-01-09 20:06:54', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `student_allocations`
--

CREATE TABLE `student_allocations` (
  `allocationId` char(36) NOT NULL,
  `studentId` char(36) NOT NULL,
  `roomId` char(36) NOT NULL,
  `applicationId` char(36) NOT NULL,
  `paymentId` char(36) DEFAULT NULL,
  `startDate` datetime NOT NULL,
  `endDate` datetime DEFAULT NULL,
  `status` enum('PENDING','ALLOCATED','ACTIVE','REJECTED','CANCELLED','VACATED','EXPIRED') NOT NULL DEFAULT 'PENDING',
  `allocationDate` datetime DEFAULT NULL,
  `vacatedDate` datetime DEFAULT NULL,
  `vacationReason` text DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL ON UPDATE current_timestamp(),
  `created_by` char(36) DEFAULT NULL,
  `updated_by` char(36) DEFAULT NULL,
  `reason` text DEFAULT NULL,
  `manualDocumentUrl` text DEFAULT NULL,
  `manualDocumentName` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `student_allocations`
--

INSERT INTO `student_allocations` (`allocationId`, `studentId`, `roomId`, `applicationId`, `paymentId`, `startDate`, `endDate`, `status`, `allocationDate`, `vacatedDate`, `vacationReason`, `remarks`, `created_at`, `updated_at`, `created_by`, `updated_by`, `reason`, `manualDocumentUrl`, `manualDocumentName`) VALUES
('03bac2dd-3383-425b-878c-d8d06d8234dc', 'MUH2225067M', 'd9c77c08-082b-4bcd-a7fe-d8b9bccfb310', '10bf51e1-c811-4bc6-be22-4f2cc1d0c588', NULL, '2026-01-15 01:48:46', '2027-01-15 01:48:46', 'VACATED', '2026-01-15 01:48:46', '2026-01-15 01:52:12', NULL, NULL, '2026-01-15 01:48:46', '2026-01-15 01:52:12', 'admin-muh', 'admin-muh', 'For medical issue', '/uploads/pending/manual-allocation-docs/bb31ecca-8e6f-4762-b7e7-510b12ab4ac9.pdf', 'cancelled-seat-history-2026-01-10 (1).pdf'),
('14763226-55bf-4905-a19f-852ac12f9df4', 'MUH2225026M', '0cff39b9-6137-4516-92ec-d663a219f0c0', '359d48b5-6f06-416e-8352-6dee6bd9f0bf', NULL, '2026-01-11 01:26:35', '2026-02-11 01:26:35', 'ALLOCATED', '2026-01-11 01:26:35', NULL, NULL, NULL, '2026-01-11 01:26:35', '2026-01-12 10:23:54', 'admin-muh', NULL, NULL, NULL, NULL),
('15d6805e-1c88-437f-b04b-0f54c5b4fa6b', 'ASH2225033M', '512a429d-7500-4e10-b3e8-3aad776fdc01', 'ec2fe4c9-04ec-4140-8648-82a5863e26be', NULL, '2026-01-09 13:08:36', '2027-01-09 13:08:36', 'ALLOCATED', '2026-01-09 13:08:36', NULL, NULL, NULL, '2026-01-09 13:08:36', NULL, 'admin-ash', NULL, NULL, NULL, NULL),
('1e30773d-dc0a-4a2d-beab-4dcf08587ab1', 'MUH2125020M', 'de856ed2-6896-49a1-a4cd-e568551f57da', '8b4a5628-caef-4d29-92a3-ac3234333974', NULL, '2025-12-26 02:11:08', NULL, 'ALLOCATED', '2025-12-26 02:11:08', NULL, NULL, NULL, '2025-12-26 02:11:08', NULL, 'admin-muh', NULL, NULL, NULL, NULL),
('5142b022-de6e-4415-af1f-172bb21c81a7', '1454f781-e5f6-49e1-8ed7-f32599263e71', '0cff39b9-6137-4516-92ec-d663a219f0c0', '0665945f-dcac-4e3a-a4dd-deeda4ea37ae', NULL, '2026-01-11 03:26:34', '2026-03-11 03:26:34', 'ALLOCATED', '2026-01-11 03:26:34', NULL, NULL, NULL, '2026-01-11 03:26:34', '2026-01-11 03:45:11', 'admin-muh', NULL, 'FOR PHD STUDENT', NULL, NULL),
('52bf1ba4-2cc9-449e-84e0-4fbb731b96a6', 'student-muh', '0cff39b9-6137-4516-92ec-d663a219f0c0', 'ec42fd37-691c-49ab-be90-fad5207d71c9', NULL, '2025-12-25 04:13:35', NULL, 'VACATED', '2025-12-25 04:13:35', '2025-12-25 04:40:54', 'hoday', NULL, '2025-12-25 04:13:35', '2025-12-25 04:40:54', 'admin-muh', 'admin-muh', 'needs', NULL, NULL),
('57c72a7a-f391-4d51-a095-f231c5f9c557', 'MUH2225030M', '0cff39b9-6137-4516-92ec-d663a219f0c0', '991329f5-552e-4f8d-a0e9-6cd6913f12e8', NULL, '2025-12-25 22:11:54', '2026-07-01 00:00:00', 'ALLOCATED', '2025-12-25 22:11:54', NULL, NULL, NULL, '2025-12-25 22:11:54', '2025-12-26 01:28:09', 'admin-muh', NULL, NULL, NULL, NULL),
('60831432-19a4-48e5-b055-7a414fd1b7df', 'MUH2125020M', 'de856ed2-6896-49a1-a4cd-e568551f57da', '3e720e16-d8e5-4ac0-81e3-f44208dad6af', NULL, '2025-12-26 01:40:17', '2025-12-26 02:05:06', 'EXPIRED', '2025-12-26 01:40:17', NULL, NULL, '', '2025-12-26 01:40:17', '2025-12-26 02:05:06', 'admin-muh', NULL, 'Auto-cancel: renewal not submitted/approved before expiry', NULL, NULL),
('8d327f61-89cb-4611-a9a4-0f3f83848f2b', 'MUH2225001M', 'de856ed2-6896-49a1-a4cd-e568551f57da', 'bb76ce59-1b85-43e8-972e-b1c9aad0e617', NULL, '2025-12-25 04:14:49', NULL, 'VACATED', '2025-12-25 04:14:49', '2025-12-25 04:40:54', 'hoday', NULL, '2025-12-25 04:14:49', '2025-12-25 04:40:54', 'admin-muh', 'admin-muh', NULL, NULL, NULL),
('9db0b242-b66c-427b-8adf-017d34aee9a6', 'MUH2225001M', '0cff39b9-6137-4516-92ec-d663a219f0c0', 'bb76ce59-1b85-43e8-972e-b1c9aad0e617', NULL, '2025-12-25 05:00:21', NULL, 'VACATED', '2025-12-25 05:00:21', '2025-12-26 04:21:58', 'hoday', NULL, '2025-12-25 05:00:21', '2025-12-26 04:21:58', 'admin-muh', 'admin-muh', NULL, NULL, NULL),
('b0d47146-1ddf-4f42-a175-7070ba818c51', 'MUH2233020M', 'de856ed2-6896-49a1-a4cd-e568551f57da', 'e59d076e-3e13-4b04-91de-1687a066b62a', NULL, '2025-12-26 15:24:49', '2027-01-01 00:00:00', 'ALLOCATED', '2025-12-26 15:24:49', NULL, NULL, NULL, '2025-12-26 15:24:49', '2025-12-26 15:34:12', 'admin-muh', NULL, NULL, NULL, NULL),
('cdaaf561-3961-42fd-8a6f-c24f01e79e35', 'MUH2225061M', 'd9c77c08-082b-4bcd-a7fe-d8b9bccfb310', 'd78656b0-7a07-46d1-878a-1efc7ceb5e6b', NULL, '2026-01-12 10:12:29', '2026-02-12 10:12:29', 'ALLOCATED', '2026-01-12 10:12:29', NULL, NULL, NULL, '2026-01-12 10:12:29', '2026-01-12 10:16:20', 'admin-muh', NULL, NULL, NULL, NULL),
('ea37f7de-8d60-4138-ad6a-0978b9b0056e', 'MUH2225064M', '9884d11b-548c-4687-8d92-e4db776864dc', '4dcead30-8188-4203-864a-89dc2f052a0f', NULL, '2026-01-15 01:53:18', '2027-01-15 01:53:18', 'ALLOCATED', '2026-01-15 01:53:18', NULL, NULL, NULL, '2026-01-15 01:53:18', NULL, 'admin-muh', NULL, 'medical issue', '/uploads/pending/manual-allocation-docs/ca3b49ed-178c-42fc-bf2f-6ab9c0ddceb2.pdf', 'Print Your Ticket _ Bangladesh Railway E-ticketing Service.pdf');

-- --------------------------------------------------------

--
-- Table structure for table `student_profiles`
--

CREATE TABLE `student_profiles` (
  `userId` char(36) NOT NULL,
  `hallId` char(36) DEFAULT NULL,
  `universityId` varchar(20) NOT NULL,
  `programLevel` varchar(20) DEFAULT NULL,
  `phone` varchar(15) NOT NULL,
  `address` text NOT NULL,
  `department` varchar(100) NOT NULL,
  `academicYear` int(11) NOT NULL,
  `sessionYear` varchar(9) DEFAULT NULL,
  `photoUrl` varchar(255) DEFAULT NULL,
  `studentIdCardUrl` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `student_profiles`
--

INSERT INTO `student_profiles` (`userId`, `hallId`, `universityId`, `programLevel`, `phone`, `address`, `department`, `academicYear`, `sessionYear`, `photoUrl`, `studentIdCardUrl`, `created_at`, `updated_at`) VALUES
('1454f781-e5f6-49e1-8ed7-f32599263e71', 'hall-muh', 'MUH25PHD12M', 'phd', '0000000000', 'Not provided', 'Not provided', 0, NULL, NULL, NULL, '2026-01-11 02:36:23', '2026-01-11 03:25:48'),
('7ef8b997-6e54-4d59-bce0-38901e9fe946', NULL, 'MUH22MSSE13M', NULL, '0000000000', 'Not provided', 'Not provided', 0, NULL, NULL, NULL, '2026-01-11 02:09:00', NULL),
('ASH2225026M', 'hall-ash', 'ASH2225026M', 'undergraduate', '0000000000', 'Not provided', 'IIT', 0, '2021-2022', NULL, NULL, '2025-11-09 23:00:11', '2026-01-11 02:26:45'),
('ASH2225033M', 'hall-ash', 'ASH2225033M', 'undergraduate', '0000000000', 'Not provided', 'IIT', 0, '2021-2022', NULL, NULL, '2026-01-02 23:40:30', '2026-01-11 02:26:45'),
('ASH2225051M', 'hall-ash', 'ASH2225051M', 'undergraduate', '0000000000', 'Not provided', 'IIT', 0, '2020-2021', NULL, NULL, '2026-01-12 01:15:37', '2026-01-12 01:15:37'),
('ASH2225052M', 'hall-ash', 'ASH2225052M', 'undergraduate', '0000000000', 'Not provided', 'IIT', 0, '2020-2021', NULL, NULL, '2026-01-12 01:15:37', '2026-01-12 01:15:37'),
('ASH2225053M', 'hall-ash', 'ASH2225053M', 'undergraduate', '0000000000', 'Not provided', 'IIT', 0, '2020-2021', NULL, NULL, '2026-01-12 01:15:37', '2026-01-12 01:15:37'),
('ASH2225054M', 'hall-ash', 'ASH2225054M', 'undergraduate', '0000000000', 'Not provided', 'IIT', 0, '2020-2021', NULL, NULL, '2026-01-12 01:15:37', '2026-01-12 01:15:37'),
('ASH2225055M', 'hall-ash', 'ASH2225055M', 'undergraduate', '0000000000', 'Not provided', 'IIT', 0, '2020-2021', NULL, NULL, '2026-01-12 01:15:37', '2026-01-12 01:15:37'),
('ASH2225056M', 'hall-ash', 'ASH2225056M', 'undergraduate', '0000000000', 'Not provided', 'IIT', 0, '2020-2021', NULL, NULL, '2026-01-12 01:15:37', '2026-01-12 01:15:37'),
('ASH2225057M', 'hall-ash', 'ASH2225057M', 'undergraduate', '0000000000', 'Not provided', 'IIT', 0, '2020-2021', NULL, NULL, '2026-01-12 01:15:37', '2026-01-12 01:15:37'),
('ASH2225058M', 'hall-ash', 'ASH2225058M', 'undergraduate', '0000000000', 'Not provided', 'IIT', 0, '2020-2021', NULL, NULL, '2026-01-12 01:15:37', '2026-01-12 01:15:37'),
('ASH2225059M', 'hall-ash', 'ASH2225059M', 'undergraduate', '0000000000', 'Not provided', 'IIT', 0, '2020-2021', NULL, NULL, '2026-01-12 01:15:37', '2026-01-12 01:15:37'),
('ASH2225060M', 'hall-ash', 'ASH2225060M', 'undergraduate', '0000000000', 'Not provided', 'IIT', 0, '2020-2021', NULL, NULL, '2026-01-12 01:15:37', '2026-01-12 01:15:37'),
('ASH2225061M', 'hall-ash', 'ASH2225061M', 'undergraduate', '0000000000', 'Not provided', 'IIT', 0, '2020-2021', NULL, NULL, '2026-01-12 01:15:37', '2026-01-12 01:15:37'),
('ASH2225062M', 'hall-ash', 'ASH2225062M', 'undergraduate', '0000000000', 'Not provided', 'IIT', 0, '2020-2021', NULL, NULL, '2026-01-12 01:15:37', '2026-01-12 01:15:37'),
('ASH2225063M', 'hall-ash', 'ASH2225063M', 'undergraduate', '0000000000', 'Not provided', 'IIT', 0, '2020-2021', NULL, NULL, '2026-01-12 01:15:37', '2026-01-12 01:15:37'),
('ASH2225064M', 'hall-ash', 'ASH2225064M', 'undergraduate', '0000000000', 'Not provided', 'IIT', 0, '2020-2021', NULL, NULL, '2026-01-12 01:15:37', '2026-01-12 01:15:37'),
('ASH2225065M', 'hall-ash', 'ASH2225065M', 'undergraduate', '0000000000', 'Not provided', 'IIT', 0, '2020-2021', NULL, NULL, '2026-01-12 01:15:37', '2026-01-12 01:15:37'),
('ASH2225066M', 'hall-ash', 'ASH2225066M', 'undergraduate', '0000000000', 'Not provided', 'IIT', 0, '2020-2021', NULL, NULL, '2026-01-12 01:15:37', '2026-01-12 01:15:37'),
('ASH2225067M', 'hall-ash', 'ASH2225067M', 'undergraduate', '0000000000', 'Not provided', 'IIT', 0, '2020-2021', NULL, NULL, '2026-01-12 01:15:37', '2026-01-12 01:15:37'),
('ASH2225068M', 'hall-ash', 'ASH2225068M', 'undergraduate', '0000000000', 'Not provided', 'IIT', 0, '2020-2021', NULL, NULL, '2026-01-12 01:15:37', '2026-01-12 01:15:37'),
('ASH2225069M', 'hall-ash', 'ASH2225069M', 'undergraduate', '0000000000', 'Not provided', 'IIT', 0, '2020-2021', NULL, NULL, '2026-01-12 01:15:37', '2026-01-12 01:15:37'),
('ASH2225070M', 'hall-ash', 'ASH2225070M', 'undergraduate', '0000000000', 'Not provided', 'IIT', 0, '2020-2021', NULL, NULL, '2026-01-12 01:15:37', '2026-01-12 01:15:37'),
('BKH2225051F', 'hall-bkh', 'BKH2225051F', 'undergraduate', '0000000000', 'Not provided', 'IIT', 0, '2020-2021', NULL, NULL, '2026-01-12 04:32:18', '2026-01-12 04:32:18'),
('BKH2225052F', 'hall-bkh', 'BKH2225052F', 'undergraduate', '0000000000', 'Not provided', 'IIT', 0, '2020-2021', NULL, NULL, '2026-01-12 04:32:18', '2026-01-12 04:32:18'),
('BKH2225053F', 'hall-bkh', 'BKH2225053F', 'undergraduate', '0000000000', 'Not provided', 'IIT', 0, '2020-2021', NULL, NULL, '2026-01-12 04:32:18', '2026-01-12 04:32:18'),
('BKH2225054F', 'hall-bkh', 'BKH2225054F', 'undergraduate', '0000000000', 'Not provided', 'IIT', 0, '2020-2021', NULL, NULL, '2026-01-12 04:32:18', '2026-01-12 04:32:18'),
('BKH2225055F', 'hall-bkh', 'BKH2225055F', 'undergraduate', '0000000000', 'Not provided', 'IIT', 0, '2020-2021', NULL, NULL, '2026-01-12 04:32:18', '2026-01-12 04:32:18'),
('BKH2225056F', 'hall-bkh', 'BKH2225056F', 'undergraduate', '0000000000', 'Not provided', 'IIT', 0, '2020-2021', NULL, NULL, '2026-01-12 04:32:18', '2026-01-12 04:32:18'),
('BKH2225057F', 'hall-bkh', 'BKH2225057F', 'undergraduate', '0000000000', 'Not provided', 'IIT', 0, '2020-2021', NULL, NULL, '2026-01-12 04:32:18', '2026-01-12 04:32:18'),
('BKH2225058F', 'hall-bkh', 'BKH2225058F', 'undergraduate', '0000000000', 'Not provided', 'IIT', 0, '2020-2021', NULL, NULL, '2026-01-12 04:32:18', '2026-01-12 04:32:18'),
('BKH2225059F', 'hall-bkh', 'BKH2225059F', 'undergraduate', '0000000000', 'Not provided', 'IIT', 0, '2020-2021', NULL, NULL, '2026-01-12 04:32:18', '2026-01-12 04:32:18'),
('BKH2225060F', 'hall-bkh', 'BKH2225060F', 'undergraduate', '0000000000', 'Not provided', 'IIT', 0, '2020-2021', NULL, NULL, '2026-01-12 04:32:18', '2026-01-12 04:32:18'),
('BKH2225061F', 'hall-bkh', 'BKH2225061F', 'undergraduate', '0000000000', 'Not provided', 'IIT', 0, '2020-2021', NULL, NULL, '2026-01-12 04:32:18', '2026-01-12 04:32:18'),
('BKH2225062F', 'hall-bkh', 'BKH2225062F', 'undergraduate', '0000000000', 'Not provided', 'IIT', 0, '2020-2021', NULL, NULL, '2026-01-12 04:32:18', '2026-01-12 04:32:18'),
('BKH2225063F', 'hall-bkh', 'BKH2225063F', 'undergraduate', '0000000000', 'Not provided', 'IIT', 0, '2020-2021', NULL, NULL, '2026-01-12 04:32:18', '2026-01-12 04:32:18'),
('BKH2225064F', 'hall-bkh', 'BKH2225064F', 'undergraduate', '0000000000', 'Not provided', 'IIT', 0, '2020-2021', NULL, NULL, '2026-01-12 04:32:18', '2026-01-12 04:32:18'),
('BKH2225065F', 'hall-bkh', 'BKH2225065F', 'undergraduate', '0000000000', 'Not provided', 'IIT', 0, '2020-2021', NULL, NULL, '2026-01-12 04:32:18', '2026-01-12 04:32:18'),
('BKH2225066F', 'hall-bkh', 'BKH2225066F', 'undergraduate', '0000000000', 'Not provided', 'IIT', 0, '2020-2021', NULL, NULL, '2026-01-12 04:32:18', '2026-01-12 04:32:18'),
('BKH2225067F', 'hall-bkh', 'BKH2225067F', 'undergraduate', '0000000000', 'Not provided', 'IIT', 0, '2020-2021', NULL, NULL, '2026-01-12 04:32:18', '2026-01-12 04:32:18'),
('BKH2225068F', 'hall-bkh', 'BKH2225068F', 'undergraduate', '0000000000', 'Not provided', 'IIT', 0, '2020-2021', NULL, NULL, '2026-01-12 04:32:18', '2026-01-12 04:32:18'),
('BKH2225069F', 'hall-bkh', 'BKH2225069F', 'undergraduate', '0000000000', 'Not provided', 'IIT', 0, '2020-2021', NULL, NULL, '2026-01-12 04:32:18', '2026-01-12 04:32:18'),
('BKH2225070F', 'hall-bkh', 'BKH2225070F', 'undergraduate', '0000000000', 'Not provided', 'IIT', 0, '2020-2021', NULL, NULL, '2026-01-12 04:32:18', '2026-01-12 04:32:18'),
('e71c1b15-aaba-49cd-84ef-05c68b5c493b', NULL, 'MUH22MSE13M', NULL, '0000000000', 'Not provided', 'Not provided', 0, '2021-2022', NULL, NULL, '2026-01-11 01:59:57', '2026-01-11 02:00:31'),
('JSH2225051F', 'hall-jsh', 'JSH2225051F', 'undergraduate', '0000000000', 'Not provided', 'IIT', 0, '2020-2021', NULL, NULL, '2026-01-12 04:45:06', '2026-01-12 04:45:06'),
('JSH2225052F', 'hall-jsh', 'JSH2225052F', 'undergraduate', '0000000000', 'Not provided', 'IIT', 0, '2020-2021', NULL, NULL, '2026-01-12 04:45:06', '2026-01-12 04:45:06'),
('JSH2225053F', 'hall-jsh', 'JSH2225053F', 'undergraduate', '0000000000', 'Not provided', 'IIT', 0, '2020-2021', NULL, NULL, '2026-01-12 04:45:06', '2026-01-12 04:45:06'),
('JSH2225054F', 'hall-jsh', 'JSH2225054F', 'undergraduate', '0000000000', 'Not provided', 'IIT', 0, '2020-2021', NULL, NULL, '2026-01-12 04:45:06', '2026-01-12 04:45:06'),
('JSH2225055F', 'hall-jsh', 'JSH2225055F', 'undergraduate', '0000000000', 'Not provided', 'IIT', 0, '2020-2021', NULL, NULL, '2026-01-12 04:45:06', '2026-01-12 04:45:06'),
('JSH2225056F', 'hall-jsh', 'JSH2225056F', 'undergraduate', '0000000000', 'Not provided', 'IIT', 0, '2020-2021', NULL, NULL, '2026-01-12 04:45:06', '2026-01-12 04:45:06'),
('JSH2225057F', 'hall-jsh', 'JSH2225057F', 'undergraduate', '0000000000', 'Not provided', 'IIT', 0, '2020-2021', NULL, NULL, '2026-01-12 04:45:06', '2026-01-12 04:45:06'),
('JSH2225058F', 'hall-jsh', 'JSH2225058F', 'undergraduate', '0000000000', 'Not provided', 'IIT', 0, '2020-2021', NULL, NULL, '2026-01-12 04:45:06', '2026-01-12 04:45:06'),
('JSH2225059F', 'hall-jsh', 'JSH2225059F', 'undergraduate', '0000000000', 'Not provided', 'IIT', 0, '2020-2021', NULL, NULL, '2026-01-12 04:45:06', '2026-01-12 04:45:06'),
('JSH2225060F', 'hall-jsh', 'JSH2225060F', 'undergraduate', '0000000000', 'Not provided', 'IIT', 0, '2020-2021', NULL, NULL, '2026-01-12 04:45:06', '2026-01-12 04:45:06'),
('JSH2225061F', 'hall-jsh', 'JSH2225061F', 'undergraduate', '0000000000', 'Not provided', 'IIT', 0, '2020-2021', NULL, NULL, '2026-01-12 04:45:06', '2026-01-12 04:45:06'),
('JSH2225062F', 'hall-jsh', 'JSH2225062F', 'undergraduate', '0000000000', 'Not provided', 'IIT', 0, '2020-2021', NULL, NULL, '2026-01-12 04:45:06', '2026-01-12 04:45:06'),
('JSH2225063F', 'hall-jsh', 'JSH2225063F', 'undergraduate', '0000000000', 'Not provided', 'IIT', 0, '2020-2021', NULL, NULL, '2026-01-12 04:45:06', '2026-01-12 04:45:06'),
('JSH2225064F', 'hall-jsh', 'JSH2225064F', 'undergraduate', '0000000000', 'Not provided', 'IIT', 0, '2020-2021', NULL, NULL, '2026-01-12 04:45:06', '2026-01-12 04:45:06'),
('JSH2225065F', 'hall-jsh', 'JSH2225065F', 'undergraduate', '0000000000', 'Not provided', 'IIT', 0, '2020-2021', NULL, NULL, '2026-01-12 04:45:06', '2026-01-12 04:45:06'),
('JSH2225066F', 'hall-jsh', 'JSH2225066F', 'undergraduate', '0000000000', 'Not provided', 'IIT', 0, '2020-2021', NULL, NULL, '2026-01-12 04:45:06', '2026-01-12 04:45:06'),
('JSH2225067F', 'hall-jsh', 'JSH2225067F', 'undergraduate', '0000000000', 'Not provided', 'IIT', 0, '2020-2021', NULL, NULL, '2026-01-12 04:45:06', '2026-01-12 04:45:06'),
('JSH2225068F', 'hall-jsh', 'JSH2225068F', 'undergraduate', '0000000000', 'Not provided', 'IIT', 0, '2020-2021', NULL, NULL, '2026-01-12 04:45:06', '2026-01-12 04:45:06'),
('JSH2225069F', 'hall-jsh', 'JSH2225069F', 'undergraduate', '0000000000', 'Not provided', 'IIT', 0, '2020-2021', NULL, NULL, '2026-01-12 04:45:06', '2026-01-12 04:45:06'),
('JSH2225070F', 'hall-jsh', 'JSH2225070F', 'undergraduate', '0000000000', 'Not provided', 'IIT', 0, '2020-2021', NULL, NULL, '2026-01-12 04:45:06', '2026-01-12 04:45:06'),
('MUH2125013M', NULL, 'MUH2125013M', 'undergraduate', '0000000000', 'Not provided', 'IIT', 0, '2020-2021', '/uploads/profile-photos/9a961e97-ab0a-4a65-88f0-88b27cb6e30a.jpg', NULL, '2025-12-26 00:38:41', '2026-01-11 02:26:45'),
('MUH2125020M', 'hall-muh', 'MUH2125020M', 'undergraduate', '0000000000', 'Not provided', 'IIT', 0, '2020-2021', NULL, NULL, '2025-12-26 01:36:52', '2026-01-11 02:26:45'),
('MUH2225001M', 'hall-muh', 'MUH2225001M', 'undergraduate', '0000000000', 'Not provided', 'IIT', 0, '2021-2022', '/uploads/profile-photos/e17dc61a-4ecb-4ad7-b8fb-4bdfed84caf0.png', NULL, '2025-12-15 12:00:12', '2026-01-11 09:34:30'),
('MUH2225007M', 'hall-muh', 'MUH2225007M', 'undergraduate', '0000000000', 'Not provided', 'IIT', 0, '2021-2022', NULL, NULL, '2026-01-11 14:42:37', NULL),
('MUH2225009M', 'hall-muh', 'MUH2225009M', 'undergraduate', '0000000000', 'Not provided', 'IIT', 0, '2021-2022', NULL, NULL, '2026-01-12 09:58:00', NULL),
('MUH2225026M', 'hall-muh', 'MUH2225026M', 'undergraduate', '0000000000', 'Not provided', 'IIT', 0, '2021-2022', '/uploads/profile-photos/f9208704-02d9-48ac-a72d-629eeb69f168.jpg', NULL, '2026-01-11 01:20:44', '2026-01-11 02:26:45'),
('MUH2225051M', 'hall-muh', 'MUH2225051M', 'undergraduate', '0000000000', 'Not provided', 'IIT', 0, '2020-2021', NULL, NULL, '2026-01-12 01:14:46', '2026-01-12 01:14:46'),
('MUH2225052M', 'hall-muh', 'MUH2225052M', 'undergraduate', '0000000000', 'Not provided', 'IIT', 0, '2020-2021', NULL, NULL, '2026-01-12 01:14:46', '2026-01-12 01:14:46'),
('MUH2225053M', 'hall-muh', 'MUH2225053M', 'undergraduate', '0000000000', 'Not provided', 'IIT', 0, '2020-2021', NULL, NULL, '2026-01-12 01:14:46', '2026-01-12 01:14:46'),
('MUH2225054M', 'hall-muh', 'MUH2225054M', 'undergraduate', '0000000000', 'Not provided', 'IIT', 0, '2020-2021', NULL, NULL, '2026-01-12 01:14:46', '2026-01-12 01:14:46'),
('MUH2225055M', 'hall-muh', 'MUH2225055M', 'undergraduate', '0000000000', 'Not provided', 'IIT', 0, '2020-2021', NULL, NULL, '2026-01-12 01:14:46', '2026-01-12 01:14:46'),
('MUH2225056M', 'hall-muh', 'MUH2225056M', 'undergraduate', '0000000000', 'Not provided', 'IIT', 0, '2020-2021', NULL, NULL, '2026-01-12 01:14:46', '2026-01-12 01:14:46'),
('MUH2225057M', 'hall-muh', 'MUH2225057M', 'undergraduate', '0000000000', 'Not provided', 'IIT', 0, '2020-2021', NULL, NULL, '2026-01-12 01:14:46', '2026-01-12 01:14:46'),
('MUH2225058M', 'hall-muh', 'MUH2225058M', 'undergraduate', '0000000000', 'Not provided', 'IIT', 0, '2021-2022', NULL, '/uploads/student-id-cards/c419eaf9-a31d-4db2-9d0a-b7e631938b34.pdf', '2026-01-12 01:14:46', '2026-01-15 00:57:12'),
('MUH2225059M', 'hall-muh', 'MUH2225059M', 'undergraduate', '0000000000', 'Not provided', 'IIT', 0, '2020-2021', NULL, NULL, '2026-01-12 01:14:46', '2026-01-12 01:14:46'),
('MUH2225060M', 'hall-muh', 'MUH2225060M', 'undergraduate', '0000000000', 'Not provided', 'IIT', 0, '2020-2021', NULL, NULL, '2026-01-12 01:14:46', '2026-01-12 01:14:46'),
('MUH2225061M', 'hall-muh', 'MUH2225061M', 'undergraduate', '0000000000', 'Not provided', 'IIT', 0, '2020-2021', NULL, NULL, '2026-01-12 01:14:46', '2026-01-12 01:14:46'),
('MUH2225062M', 'hall-muh', 'MUH2225062M', 'undergraduate', '0000000000', 'Not provided', 'IIT', 0, '2020-2021', NULL, NULL, '2026-01-12 01:14:46', '2026-01-12 01:14:46'),
('MUH2225063M', 'hall-muh', 'MUH2225063M', 'undergraduate', '0000000000', 'Not provided', 'IIT', 0, '2020-2021', NULL, NULL, '2026-01-12 01:14:46', '2026-01-12 01:14:46'),
('MUH2225064M', 'hall-muh', 'MUH2225064M', 'undergraduate', '0000000000', 'Not provided', 'IIT', 0, '2020-2021', NULL, NULL, '2026-01-12 01:14:46', '2026-01-12 01:14:46'),
('MUH2225065M', 'hall-muh', 'MUH2225065M', 'undergraduate', '0000000000', 'Not provided', 'IIT', 0, '2020-2021', NULL, NULL, '2026-01-12 01:14:46', '2026-01-12 01:14:46'),
('MUH2225066M', 'hall-muh', 'MUH2225066M', 'undergraduate', '0000000000', 'Not provided', 'IIT', 0, '2020-2021', NULL, NULL, '2026-01-12 01:14:46', '2026-01-12 01:14:46'),
('MUH2225067M', 'hall-muh', 'MUH2225067M', 'undergraduate', '0000000000', 'Not provided', 'IIT', 0, '2020-2021', NULL, NULL, '2026-01-12 01:14:46', '2026-01-12 01:14:46'),
('MUH2225068M', 'hall-muh', 'MUH2225068M', 'undergraduate', '0000000000', 'Not provided', 'IIT', 0, '2020-2021', NULL, NULL, '2026-01-12 01:14:46', '2026-01-12 01:14:46'),
('MUH2225069M', 'hall-muh', 'MUH2225069M', 'undergraduate', '0000000000', 'Not provided', 'IIT', 0, '2020-2021', NULL, NULL, '2026-01-12 01:14:46', '2026-01-12 01:14:46'),
('MUH2225070M', 'hall-muh', 'MUH2225070M', 'undergraduate', '0000000000', 'Not provided', 'IIT', 0, '2020-2021', NULL, NULL, '2026-01-12 01:14:46', '2026-01-12 01:14:46'),
('MUH2233020M', 'hall-muh', 'MUH2233020M', 'undergraduate', '0000000000', 'Not provided', 'SWES', 0, '2021-2022', NULL, NULL, '2025-12-26 15:21:41', '2026-01-11 02:26:45'),
('NFH2225051F', 'hall-nfh', 'NFH2225051F', 'undergraduate', '0000000000', 'Not provided', 'IIT', 0, '2020-2021', NULL, NULL, '2026-01-12 04:52:14', '2026-01-12 04:52:14'),
('NFH2225052F', 'hall-nfh', 'NFH2225052F', 'undergraduate', '0000000000', 'Not provided', 'IIT', 0, '2020-2021', NULL, NULL, '2026-01-12 04:52:14', '2026-01-12 04:52:14'),
('NFH2225053F', 'hall-nfh', 'NFH2225053F', 'undergraduate', '0000000000', 'Not provided', 'IIT', 0, '2020-2021', NULL, NULL, '2026-01-12 04:52:14', '2026-01-12 04:52:14'),
('NFH2225054F', 'hall-nfh', 'NFH2225054F', 'undergraduate', '0000000000', 'Not provided', 'IIT', 0, '2020-2021', NULL, NULL, '2026-01-12 04:52:14', '2026-01-12 04:52:14'),
('NFH2225055F', 'hall-nfh', 'NFH2225055F', 'undergraduate', '0000000000', 'Not provided', 'IIT', 0, '2020-2021', NULL, NULL, '2026-01-12 04:52:14', '2026-01-12 04:52:14'),
('NFH2225056F', 'hall-nfh', 'NFH2225056F', 'undergraduate', '0000000000', 'Not provided', 'IIT', 0, '2020-2021', NULL, NULL, '2026-01-12 04:52:14', '2026-01-12 04:52:14'),
('NFH2225057F', 'hall-nfh', 'NFH2225057F', 'undergraduate', '0000000000', 'Not provided', 'IIT', 0, '2020-2021', NULL, NULL, '2026-01-12 04:52:14', '2026-01-12 04:52:14'),
('NFH2225058F', 'hall-nfh', 'NFH2225058F', 'undergraduate', '0000000000', 'Not provided', 'IIT', 0, '2020-2021', NULL, NULL, '2026-01-12 04:52:14', '2026-01-12 04:52:14'),
('NFH2225059F', 'hall-nfh', 'NFH2225059F', 'undergraduate', '0000000000', 'Not provided', 'IIT', 0, '2020-2021', NULL, NULL, '2026-01-12 04:52:14', '2026-01-12 04:52:14'),
('NFH2225060F', 'hall-nfh', 'NFH2225060F', 'undergraduate', '0000000000', 'Not provided', 'IIT', 0, '2020-2021', NULL, NULL, '2026-01-12 04:52:14', '2026-01-12 04:52:14'),
('NFH2225061F', 'hall-nfh', 'NFH2225061F', 'undergraduate', '0000000000', 'Not provided', 'IIT', 0, '2020-2021', NULL, NULL, '2026-01-12 04:52:14', '2026-01-12 04:52:14'),
('NFH2225062F', 'hall-nfh', 'NFH2225062F', 'undergraduate', '0000000000', 'Not provided', 'IIT', 0, '2020-2021', NULL, NULL, '2026-01-12 04:52:14', '2026-01-12 04:52:14'),
('NFH2225063F', 'hall-nfh', 'NFH2225063F', 'undergraduate', '0000000000', 'Not provided', 'IIT', 0, '2020-2021', NULL, NULL, '2026-01-12 04:52:14', '2026-01-12 04:52:14'),
('NFH2225064F', 'hall-nfh', 'NFH2225064F', 'undergraduate', '0000000000', 'Not provided', 'IIT', 0, '2020-2021', NULL, NULL, '2026-01-12 04:52:14', '2026-01-12 04:52:14'),
('NFH2225065F', 'hall-nfh', 'NFH2225065F', 'undergraduate', '0000000000', 'Not provided', 'IIT', 0, '2020-2021', NULL, NULL, '2026-01-12 04:52:14', '2026-01-12 04:52:14'),
('NFH2225066F', 'hall-nfh', 'NFH2225066F', 'undergraduate', '0000000000', 'Not provided', 'IIT', 0, '2020-2021', NULL, NULL, '2026-01-12 04:52:14', '2026-01-12 04:52:14'),
('NFH2225067F', 'hall-nfh', 'NFH2225067F', 'undergraduate', '0000000000', 'Not provided', 'IIT', 0, '2020-2021', NULL, NULL, '2026-01-12 04:52:14', '2026-01-12 04:52:14'),
('NFH2225068F', 'hall-nfh', 'NFH2225068F', 'undergraduate', '0000000000', 'Not provided', 'IIT', 0, '2020-2021', NULL, NULL, '2026-01-12 04:52:14', '2026-01-12 04:52:14'),
('NFH2225069F', 'hall-nfh', 'NFH2225069F', 'undergraduate', '0000000000', 'Not provided', 'IIT', 0, '2020-2021', NULL, NULL, '2026-01-12 04:52:14', '2026-01-12 04:52:14'),
('NFH2225070F', 'hall-nfh', 'NFH2225070F', 'undergraduate', '0000000000', 'Not provided', 'IIT', 0, '2020-2021', NULL, NULL, '2026-01-12 04:52:14', '2026-01-12 04:52:14');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `userId` char(36) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `name` varchar(100) NOT NULL,
  `role` enum('STUDENT','ADMIN','EXAM_CONTROLLER','STAFF') NOT NULL,
  `isEmailVerified` tinyint(1) NOT NULL DEFAULT 0,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `lastLogin` datetime DEFAULT NULL,
  `passwordChangedAt` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`userId`, `email`, `password`, `name`, `role`, `isEmailVerified`, `isActive`, `lastLogin`, `passwordChangedAt`, `created_at`, `updated_at`) VALUES
('1454f781-e5f6-49e1-8ed7-f32599263e71', 'phd@student.nstu.edu.bd', '$2b$10$MrlJcTJmr4bhRZkwBttZhuYAk6GaGca0kytZwenX34o1.Q9vvJUI2', 'PHD', 'STUDENT', 0, 1, '2026-01-11 03:28:05', NULL, '2026-01-11 02:36:23', '2026-01-11 03:28:05'),
('7ef8b997-6e54-4d59-bce0-38901e9fe946', 'rahim222@student.nstu.edu.bd', '$2b$10$TYofGmen9zsIAElgZ3Nrou2y/oNm5sBkon43YNedx6B.ninXiK8pW', 'Rahim', 'STUDENT', 0, 1, '2026-01-11 03:27:13', NULL, '2026-01-11 02:09:00', '2026-01-11 03:27:13'),
('admin-ash', 'admin.ash@nstu.edu.bd', '$2b$10$fuCh4ZjlhTvRbkhmvcamGuQ6X7Tu0M4eo345f5dlUpAyVr433Gg8y', 'Admin - Abdus Salam Hall', 'ADMIN', 1, 1, '2026-01-22 23:21:17', NULL, '2025-10-28 20:53:36', '2026-01-22 23:21:17'),
('admin-bkh', 'admin.bkh@nstu.edu.bd', '$2b$10$xgJPwlMspjcgqYsd2FJQSuQr6R/i3PKhIHiDbr2XpCZKy9ZrYZ6NS', 'Md. Abdul Kaium Masud', 'ADMIN', 1, 1, '2026-01-12 09:44:32', NULL, '2026-01-12 09:26:25', '2026-01-12 09:44:32'),
('admin-jsh', 'admin.jsh@nstu.edu.bd', '$2b$10$xgJPwlMspjcgqYsd2FJQSuQr6R/i3PKhIHiDbr2XpCZKy9ZrYZ6NS', 'Md. Nasir Uddin', 'ADMIN', 1, 1, '2026-01-12 09:50:14', NULL, '2026-01-12 09:48:11', '2026-01-12 09:50:14'),
('admin-muh', 'admin.muh@nstu.edu.bd', '$2b$10$ew6W66m07jGrZ1ETkEzKzOFcp77EDXfl952jiQZMUyXobDGKVEyuC', 'Admin - Abdul Malek Ukil Hall', 'ADMIN', 1, 1, '2026-01-22 23:22:14', NULL, '2025-10-28 20:53:36', '2026-01-22 23:22:14'),
('admin-nfh', 'admin.nfh@nstu.edu.bd', '$2b$10$xgJPwlMspjcgqYsd2FJQSuQr6R/i3PKhIHiDbr2XpCZKy9ZrYZ6NS', 'Dr. Abidur Rahman', 'ADMIN', 1, 1, '2026-01-12 09:53:14', NULL, '2026-01-12 09:51:38', '2026-01-12 09:53:14'),
('ASH2225026M', 'tanjim2517@student.nstu.edu.bd', '$2b$10$ag1X.SW489/MYZsTWjQ03OKOsZAWH27kUtKp2JJRaWVg/IVO4WbBe', 'Tanjim Arafat', 'STUDENT', 0, 1, '2025-12-14 18:54:44', NULL, '2025-11-09 23:00:11', '2025-12-14 18:54:44'),
('ASH2225033M', 'adib2517@student.nstu.edu.bd', '$2b$10$XTXL910zLLCr5EI.MozWiulE7UrCCdPBv5ZDhpTDKHFHHPyfN1F9K', 'Tafhimul Adib', 'STUDENT', 0, 1, '2026-01-09 13:08:53', NULL, '2026-01-02 23:40:30', '2026-01-09 13:08:53'),
('ASH2225051M', 'ASH2225051M@student.nstu.edu.bd', '$2b$10$xgJPwlMspjcgqYsd2FJQSuQr6R/i3PKhIHiDbr2XpCZKy9ZrYZ6NS', 'Masum51', 'STUDENT', 1, 1, NULL, NULL, '2026-01-12 01:15:13', '2026-01-12 01:15:13'),
('ASH2225052M', 'ASH2225052M@student.nstu.edu.bd', '$2b$10$xgJPwlMspjcgqYsd2FJQSuQr6R/i3PKhIHiDbr2XpCZKy9ZrYZ6NS', 'Masum52', 'STUDENT', 1, 1, NULL, NULL, '2026-01-12 01:15:13', '2026-01-12 01:15:13'),
('ASH2225053M', 'ASH2225053M@student.nstu.edu.bd', '$2b$10$xgJPwlMspjcgqYsd2FJQSuQr6R/i3PKhIHiDbr2XpCZKy9ZrYZ6NS', 'Masum53', 'STUDENT', 1, 1, NULL, NULL, '2026-01-12 01:15:13', '2026-01-12 01:15:13'),
('ASH2225054M', 'ASH2225054M@student.nstu.edu.bd', '$2b$10$xgJPwlMspjcgqYsd2FJQSuQr6R/i3PKhIHiDbr2XpCZKy9ZrYZ6NS', 'Masum54', 'STUDENT', 1, 1, NULL, NULL, '2026-01-12 01:15:13', '2026-01-12 01:15:13'),
('ASH2225055M', 'ASH2225055M@student.nstu.edu.bd', '$2b$10$xgJPwlMspjcgqYsd2FJQSuQr6R/i3PKhIHiDbr2XpCZKy9ZrYZ6NS', 'Masum55', 'STUDENT', 1, 1, NULL, NULL, '2026-01-12 01:15:13', '2026-01-12 01:15:13'),
('ASH2225056M', 'ASH2225056M@student.nstu.edu.bd', '$2b$10$xgJPwlMspjcgqYsd2FJQSuQr6R/i3PKhIHiDbr2XpCZKy9ZrYZ6NS', 'Hasan56', 'STUDENT', 1, 1, NULL, NULL, '2026-01-12 01:15:13', '2026-01-12 01:15:13'),
('ASH2225057M', 'ASH2225057M@student.nstu.edu.bd', '$2b$10$xgJPwlMspjcgqYsd2FJQSuQr6R/i3PKhIHiDbr2XpCZKy9ZrYZ6NS', 'Hasan57', 'STUDENT', 1, 1, NULL, NULL, '2026-01-12 01:15:13', '2026-01-12 01:15:13'),
('ASH2225058M', 'ASH2225058M@student.nstu.edu.bd', '$2b$10$xgJPwlMspjcgqYsd2FJQSuQr6R/i3PKhIHiDbr2XpCZKy9ZrYZ6NS', 'Hasan58', 'STUDENT', 1, 1, NULL, NULL, '2026-01-12 01:15:13', '2026-01-12 01:15:13'),
('ASH2225059M', 'ASH2225059M@student.nstu.edu.bd', '$2b$10$xgJPwlMspjcgqYsd2FJQSuQr6R/i3PKhIHiDbr2XpCZKy9ZrYZ6NS', 'Hasan59', 'STUDENT', 1, 1, NULL, NULL, '2026-01-12 01:15:13', '2026-01-12 01:15:13'),
('ASH2225060M', 'ASH2225060M@student.nstu.edu.bd', '$2b$10$xgJPwlMspjcgqYsd2FJQSuQr6R/i3PKhIHiDbr2XpCZKy9ZrYZ6NS', 'Hasan60', 'STUDENT', 1, 1, NULL, NULL, '2026-01-12 01:15:13', '2026-01-12 01:15:13'),
('ASH2225061M', 'ASH2225061M@student.nstu.edu.bd', '$2b$10$xgJPwlMspjcgqYsd2FJQSuQr6R/i3PKhIHiDbr2XpCZKy9ZrYZ6NS', 'Argha61', 'STUDENT', 1, 1, NULL, NULL, '2026-01-12 01:15:13', '2026-01-12 01:15:13'),
('ASH2225062M', 'ASH2225062M@student.nstu.edu.bd', '$2b$10$xgJPwlMspjcgqYsd2FJQSuQr6R/i3PKhIHiDbr2XpCZKy9ZrYZ6NS', 'Argha62', 'STUDENT', 1, 1, NULL, NULL, '2026-01-12 01:15:13', '2026-01-12 01:15:13'),
('ASH2225063M', 'ASH2225063M@student.nstu.edu.bd', '$2b$10$xgJPwlMspjcgqYsd2FJQSuQr6R/i3PKhIHiDbr2XpCZKy9ZrYZ6NS', 'Argha63', 'STUDENT', 1, 1, NULL, NULL, '2026-01-12 01:15:13', '2026-01-12 01:15:13'),
('ASH2225064M', 'ASH2225064M@student.nstu.edu.bd', '$2b$10$xgJPwlMspjcgqYsd2FJQSuQr6R/i3PKhIHiDbr2XpCZKy9ZrYZ6NS', 'Argha64', 'STUDENT', 1, 1, NULL, NULL, '2026-01-12 01:15:13', '2026-01-12 01:15:13'),
('ASH2225065M', 'ASH2225065M@student.nstu.edu.bd', '$2b$10$xgJPwlMspjcgqYsd2FJQSuQr6R/i3PKhIHiDbr2XpCZKy9ZrYZ6NS', 'Argha65', 'STUDENT', 1, 1, NULL, NULL, '2026-01-12 01:15:13', '2026-01-12 01:15:13'),
('ASH2225066M', 'ASH2225066M@student.nstu.edu.bd', '$2b$10$xgJPwlMspjcgqYsd2FJQSuQr6R/i3PKhIHiDbr2XpCZKy9ZrYZ6NS', 'Adib66', 'STUDENT', 1, 1, NULL, NULL, '2026-01-12 01:15:13', '2026-01-12 01:15:13'),
('ASH2225067M', 'ASH2225067M@student.nstu.edu.bd', '$2b$10$xgJPwlMspjcgqYsd2FJQSuQr6R/i3PKhIHiDbr2XpCZKy9ZrYZ6NS', 'Adib67', 'STUDENT', 1, 1, NULL, NULL, '2026-01-12 01:15:13', '2026-01-12 01:15:13'),
('ASH2225068M', 'ASH2225068M@student.nstu.edu.bd', '$2b$10$xgJPwlMspjcgqYsd2FJQSuQr6R/i3PKhIHiDbr2XpCZKy9ZrYZ6NS', 'Adib68', 'STUDENT', 1, 1, NULL, NULL, '2026-01-12 01:15:13', '2026-01-12 01:15:13'),
('ASH2225069M', 'ASH2225069M@student.nstu.edu.bd', '$2b$10$xgJPwlMspjcgqYsd2FJQSuQr6R/i3PKhIHiDbr2XpCZKy9ZrYZ6NS', 'Adib69', 'STUDENT', 1, 1, NULL, NULL, '2026-01-12 01:15:13', '2026-01-12 01:15:13'),
('ASH2225070M', 'ASH2225070M@student.nstu.edu.bd', '$2b$10$xgJPwlMspjcgqYsd2FJQSuQr6R/i3PKhIHiDbr2XpCZKy9ZrYZ6NS', 'Adib70', 'STUDENT', 1, 1, NULL, NULL, '2026-01-12 01:15:13', '2026-01-12 01:15:13'),
('BKH2225051F', 'BKH2225051F@student.nstu.edu.bd', '$2b$10$xgJPwlMspjcgqYsd2FJQSuQr6R/i3PKhIHiDbr2XpCZKy9ZrYZ6NS', 'Maria51', 'STUDENT', 1, 1, NULL, NULL, '2026-01-12 04:31:48', '2026-01-12 04:31:48'),
('BKH2225052F', 'BKH2225052F@student.nstu.edu.bd', '$2b$10$xgJPwlMspjcgqYsd2FJQSuQr6R/i3PKhIHiDbr2XpCZKy9ZrYZ6NS', 'Hasi52', 'STUDENT', 1, 1, NULL, NULL, '2026-01-12 04:31:48', '2026-01-12 04:31:48'),
('BKH2225053F', 'BKH2225053F@student.nstu.edu.bd', '$2b$10$xgJPwlMspjcgqYsd2FJQSuQr6R/i3PKhIHiDbr2XpCZKy9ZrYZ6NS', 'Arni53', 'STUDENT', 1, 1, NULL, NULL, '2026-01-12 04:31:48', '2026-01-12 04:31:48'),
('BKH2225054F', 'BKH2225054F@student.nstu.edu.bd', '$2b$10$xgJPwlMspjcgqYsd2FJQSuQr6R/i3PKhIHiDbr2XpCZKy9ZrYZ6NS', 'Adiba54', 'STUDENT', 1, 1, NULL, NULL, '2026-01-12 04:31:48', '2026-01-12 04:31:48'),
('BKH2225055F', 'BKH2225055F@student.nstu.edu.bd', '$2b$10$xgJPwlMspjcgqYsd2FJQSuQr6R/i3PKhIHiDbr2XpCZKy9ZrYZ6NS', 'Maria55', 'STUDENT', 1, 1, NULL, NULL, '2026-01-12 04:31:48', '2026-01-12 04:31:48'),
('BKH2225056F', 'BKH2225056F@student.nstu.edu.bd', '$2b$10$xgJPwlMspjcgqYsd2FJQSuQr6R/i3PKhIHiDbr2XpCZKy9ZrYZ6NS', 'Hasi56', 'STUDENT', 1, 1, NULL, NULL, '2026-01-12 04:31:48', '2026-01-12 04:31:48'),
('BKH2225057F', 'BKH2225057F@student.nstu.edu.bd', '$2b$10$xgJPwlMspjcgqYsd2FJQSuQr6R/i3PKhIHiDbr2XpCZKy9ZrYZ6NS', 'Arni57', 'STUDENT', 1, 1, NULL, NULL, '2026-01-12 04:31:48', '2026-01-12 04:31:48'),
('BKH2225058F', 'BKH2225058F@student.nstu.edu.bd', '$2b$10$xgJPwlMspjcgqYsd2FJQSuQr6R/i3PKhIHiDbr2XpCZKy9ZrYZ6NS', 'Adiba58', 'STUDENT', 1, 1, NULL, NULL, '2026-01-12 04:31:48', '2026-01-12 04:31:48'),
('BKH2225059F', 'BKH2225059F@student.nstu.edu.bd', '$2b$10$xgJPwlMspjcgqYsd2FJQSuQr6R/i3PKhIHiDbr2XpCZKy9ZrYZ6NS', 'Maria59', 'STUDENT', 1, 1, NULL, NULL, '2026-01-12 04:31:48', '2026-01-12 04:31:48'),
('BKH2225060F', 'BKH2225060F@student.nstu.edu.bd', '$2b$10$xgJPwlMspjcgqYsd2FJQSuQr6R/i3PKhIHiDbr2XpCZKy9ZrYZ6NS', 'Hasi60', 'STUDENT', 1, 1, NULL, NULL, '2026-01-12 04:31:48', '2026-01-12 04:31:48'),
('BKH2225061F', 'BKH2225061F@student.nstu.edu.bd', '$2b$10$xgJPwlMspjcgqYsd2FJQSuQr6R/i3PKhIHiDbr2XpCZKy9ZrYZ6NS', 'Arni61', 'STUDENT', 1, 1, NULL, NULL, '2026-01-12 04:31:48', '2026-01-12 04:31:48'),
('BKH2225062F', 'BKH2225062F@student.nstu.edu.bd', '$2b$10$xgJPwlMspjcgqYsd2FJQSuQr6R/i3PKhIHiDbr2XpCZKy9ZrYZ6NS', 'Adiba62', 'STUDENT', 1, 1, NULL, NULL, '2026-01-12 04:31:48', '2026-01-12 04:31:48'),
('BKH2225063F', 'BKH2225063F@student.nstu.edu.bd', '$2b$10$xgJPwlMspjcgqYsd2FJQSuQr6R/i3PKhIHiDbr2XpCZKy9ZrYZ6NS', 'Maria63', 'STUDENT', 1, 1, NULL, NULL, '2026-01-12 04:31:48', '2026-01-12 04:31:48'),
('BKH2225064F', 'BKH2225064F@student.nstu.edu.bd', '$2b$10$xgJPwlMspjcgqYsd2FJQSuQr6R/i3PKhIHiDbr2XpCZKy9ZrYZ6NS', 'Hasi64', 'STUDENT', 1, 1, NULL, NULL, '2026-01-12 04:31:48', '2026-01-12 04:31:48'),
('BKH2225065F', 'BKH2225065F@student.nstu.edu.bd', '$2b$10$xgJPwlMspjcgqYsd2FJQSuQr6R/i3PKhIHiDbr2XpCZKy9ZrYZ6NS', 'Arni65', 'STUDENT', 1, 1, NULL, NULL, '2026-01-12 04:31:48', '2026-01-12 04:31:48'),
('BKH2225066F', 'BKH2225066F@student.nstu.edu.bd', '$2b$10$xgJPwlMspjcgqYsd2FJQSuQr6R/i3PKhIHiDbr2XpCZKy9ZrYZ6NS', 'Adiba66', 'STUDENT', 1, 1, NULL, NULL, '2026-01-12 04:31:48', '2026-01-12 04:31:48'),
('BKH2225067F', 'BKH2225067F@student.nstu.edu.bd', '$2b$10$xgJPwlMspjcgqYsd2FJQSuQr6R/i3PKhIHiDbr2XpCZKy9ZrYZ6NS', 'Maria67', 'STUDENT', 1, 1, NULL, NULL, '2026-01-12 04:31:48', '2026-01-12 04:31:48'),
('BKH2225068F', 'BKH2225068F@student.nstu.edu.bd', '$2b$10$xgJPwlMspjcgqYsd2FJQSuQr6R/i3PKhIHiDbr2XpCZKy9ZrYZ6NS', 'Hasi68', 'STUDENT', 1, 1, NULL, NULL, '2026-01-12 04:31:48', '2026-01-12 04:31:48'),
('BKH2225069F', 'BKH2225069F@student.nstu.edu.bd', '$2b$10$xgJPwlMspjcgqYsd2FJQSuQr6R/i3PKhIHiDbr2XpCZKy9ZrYZ6NS', 'Arni69', 'STUDENT', 1, 1, NULL, NULL, '2026-01-12 04:31:48', '2026-01-12 04:31:48'),
('BKH2225070F', 'BKH2225070F@student.nstu.edu.bd', '$2b$10$xgJPwlMspjcgqYsd2FJQSuQr6R/i3PKhIHiDbr2XpCZKy9ZrYZ6NS', 'Adiba70', 'STUDENT', 1, 1, NULL, NULL, '2026-01-12 04:31:48', '2026-01-12 04:31:48'),
('e71c1b15-aaba-49cd-84ef-05c68b5c493b', 'msce@student.nstu.edu.bd', '$2b$10$xgJPwlMspjcgqYsd2FJQSuQr6R/i3PKhIHiDbr2XpCZKy9ZrYZ6NS', 'MasumMSSE', 'STUDENT', 0, 1, NULL, NULL, '2026-01-11 01:59:57', NULL),
('exam-controller-main', 'exam@nstu.edu.bd', '$2b$10$MNKiXSJyYpfMRLo25rmRFeprbFfBk3hHkSrBFpZ3Ox7iC7XzpgliW', 'Exam Controller', 'EXAM_CONTROLLER', 1, 1, '2026-01-15 11:31:43', NULL, '2026-01-10 01:27:15', '2026-01-15 11:31:43'),
('fac211dd-2071-4706-b27e-46ec2a28ad6b', 'masumms@student.nstu.edu.bd', '$2b$10$9T3C6syJwUOW9bos9f2Q2.Nxq0CxOj/Xx/QuQUhNNMPHiZZQD9zR.', 'MUH22BSSE25M', 'STUDENT', 0, 1, '2026-01-11 01:32:31', NULL, '2026-01-11 01:29:35', '2026-01-11 01:32:31'),
('JSH2225051F', 'JSH2225051F@student.nstu.edu.bd', '$2b$10$xgJPwlMspjcgqYsd2FJQSuQr6R/i3PKhIHiDbr2XpCZKy9ZrYZ6NS', 'Maria51', 'STUDENT', 1, 1, NULL, NULL, '2026-01-12 04:44:07', '2026-01-12 04:44:07'),
('JSH2225052F', 'JSH2225052F@student.nstu.edu.bd', '$2b$10$xgJPwlMspjcgqYsd2FJQSuQr6R/i3PKhIHiDbr2XpCZKy9ZrYZ6NS', 'Hasi52', 'STUDENT', 1, 1, NULL, NULL, '2026-01-12 04:44:07', '2026-01-12 04:44:07'),
('JSH2225053F', 'JSH2225053F@student.nstu.edu.bd', '$2b$10$xgJPwlMspjcgqYsd2FJQSuQr6R/i3PKhIHiDbr2XpCZKy9ZrYZ6NS', 'Arni53', 'STUDENT', 1, 1, NULL, NULL, '2026-01-12 04:44:07', '2026-01-12 04:44:07'),
('JSH2225054F', 'JSH2225054F@student.nstu.edu.bd', '$2b$10$xgJPwlMspjcgqYsd2FJQSuQr6R/i3PKhIHiDbr2XpCZKy9ZrYZ6NS', 'Adiba54', 'STUDENT', 1, 1, NULL, NULL, '2026-01-12 04:44:07', '2026-01-12 04:44:07'),
('JSH2225055F', 'JSH2225055F@student.nstu.edu.bd', '$2b$10$xgJPwlMspjcgqYsd2FJQSuQr6R/i3PKhIHiDbr2XpCZKy9ZrYZ6NS', 'Maria55', 'STUDENT', 1, 1, NULL, NULL, '2026-01-12 04:44:07', '2026-01-12 04:44:07'),
('JSH2225056F', 'JSH2225056F@student.nstu.edu.bd', '$2b$10$xgJPwlMspjcgqYsd2FJQSuQr6R/i3PKhIHiDbr2XpCZKy9ZrYZ6NS', 'Hasi56', 'STUDENT', 1, 1, NULL, NULL, '2026-01-12 04:44:07', '2026-01-12 04:44:07'),
('JSH2225057F', 'JSH2225057F@student.nstu.edu.bd', '$2b$10$xgJPwlMspjcgqYsd2FJQSuQr6R/i3PKhIHiDbr2XpCZKy9ZrYZ6NS', 'Arni57', 'STUDENT', 1, 1, NULL, NULL, '2026-01-12 04:44:07', '2026-01-12 04:44:07'),
('JSH2225058F', 'JSH2225058F@student.nstu.edu.bd', '$2b$10$xgJPwlMspjcgqYsd2FJQSuQr6R/i3PKhIHiDbr2XpCZKy9ZrYZ6NS', 'Adiba58', 'STUDENT', 1, 1, NULL, NULL, '2026-01-12 04:44:07', '2026-01-12 04:44:07'),
('JSH2225059F', 'JSH2225059F@student.nstu.edu.bd', '$2b$10$xgJPwlMspjcgqYsd2FJQSuQr6R/i3PKhIHiDbr2XpCZKy9ZrYZ6NS', 'Maria59', 'STUDENT', 1, 1, NULL, NULL, '2026-01-12 04:44:07', '2026-01-12 04:44:07'),
('JSH2225060F', 'JSH2225060F@student.nstu.edu.bd', '$2b$10$xgJPwlMspjcgqYsd2FJQSuQr6R/i3PKhIHiDbr2XpCZKy9ZrYZ6NS', 'Hasi60', 'STUDENT', 1, 1, NULL, NULL, '2026-01-12 04:44:07', '2026-01-12 04:44:07'),
('JSH2225061F', 'JSH2225061F@student.nstu.edu.bd', '$2b$10$xgJPwlMspjcgqYsd2FJQSuQr6R/i3PKhIHiDbr2XpCZKy9ZrYZ6NS', 'Arni61', 'STUDENT', 1, 1, NULL, NULL, '2026-01-12 04:44:07', '2026-01-12 04:44:07'),
('JSH2225062F', 'JSH2225062F@student.nstu.edu.bd', '$2b$10$xgJPwlMspjcgqYsd2FJQSuQr6R/i3PKhIHiDbr2XpCZKy9ZrYZ6NS', 'Adiba62', 'STUDENT', 1, 1, NULL, NULL, '2026-01-12 04:44:07', '2026-01-12 04:44:07'),
('JSH2225063F', 'JSH2225063F@student.nstu.edu.bd', '$2b$10$xgJPwlMspjcgqYsd2FJQSuQr6R/i3PKhIHiDbr2XpCZKy9ZrYZ6NS', 'Maria63', 'STUDENT', 1, 1, NULL, NULL, '2026-01-12 04:44:07', '2026-01-12 04:44:07'),
('JSH2225064F', 'JSH2225064F@student.nstu.edu.bd', '$2b$10$xgJPwlMspjcgqYsd2FJQSuQr6R/i3PKhIHiDbr2XpCZKy9ZrYZ6NS', 'Hasi64', 'STUDENT', 1, 1, NULL, NULL, '2026-01-12 04:44:07', '2026-01-12 04:44:07'),
('JSH2225065F', 'JSH2225065F@student.nstu.edu.bd', '$2b$10$xgJPwlMspjcgqYsd2FJQSuQr6R/i3PKhIHiDbr2XpCZKy9ZrYZ6NS', 'Arni65', 'STUDENT', 1, 1, NULL, NULL, '2026-01-12 04:44:07', '2026-01-12 04:44:07'),
('JSH2225066F', 'JSH2225066F@student.nstu.edu.bd', '$2b$10$xgJPwlMspjcgqYsd2FJQSuQr6R/i3PKhIHiDbr2XpCZKy9ZrYZ6NS', 'Adiba66', 'STUDENT', 1, 1, NULL, NULL, '2026-01-12 04:44:07', '2026-01-12 04:44:07'),
('JSH2225067F', 'JSH2225067F@student.nstu.edu.bd', '$2b$10$xgJPwlMspjcgqYsd2FJQSuQr6R/i3PKhIHiDbr2XpCZKy9ZrYZ6NS', 'Maria67', 'STUDENT', 1, 1, NULL, NULL, '2026-01-12 04:44:07', '2026-01-12 04:44:07'),
('JSH2225068F', 'JSH2225068F@student.nstu.edu.bd', '$2b$10$xgJPwlMspjcgqYsd2FJQSuQr6R/i3PKhIHiDbr2XpCZKy9ZrYZ6NS', 'Hasi68', 'STUDENT', 1, 1, NULL, NULL, '2026-01-12 04:44:07', '2026-01-12 04:44:07'),
('JSH2225069F', 'JSH2225069F@student.nstu.edu.bd', '$2b$10$xgJPwlMspjcgqYsd2FJQSuQr6R/i3PKhIHiDbr2XpCZKy9ZrYZ6NS', 'Arni69', 'STUDENT', 1, 1, NULL, NULL, '2026-01-12 04:44:07', '2026-01-12 04:44:07'),
('JSH2225070F', 'JSH2225070F@student.nstu.edu.bd', '$2b$10$xgJPwlMspjcgqYsd2FJQSuQr6R/i3PKhIHiDbr2XpCZKy9ZrYZ6NS', 'Adiba70', 'STUDENT', 1, 1, NULL, NULL, '2026-01-12 04:44:07', '2026-01-12 04:44:07'),
('MUH2125013M', 'masum21@student.nstu.edu.bd', '$2b$10$UlRXx0zVW0ubwng9W.W1juqoY0HctMWVf9iwep7ffCgczsAZUNu7W', 'Masum', 'STUDENT', 0, 1, '2026-01-11 00:58:01', NULL, '2025-12-26 00:38:41', '2026-01-11 00:58:01'),
('MUH2125020M', 'masum20@student.nstu.edu.bd', '$2b$10$UJrbkdqVhyDZDB2JeSQ2PuQLpx72VP0slkueWxeQyF0EGXcRSpZkO', 'masum', 'STUDENT', 0, 1, '2025-12-26 02:11:46', NULL, '2025-12-26 01:36:52', '2025-12-26 02:11:46'),
('MUH2225001M', 'sazzad@student.nstu.edu.bd', '$2b$10$zoZpDMu2/pzlq5FWjsaDKuFKgdfZdDaHpXTBb85r3oWoDSLyvc482', 'Sazzad Mahmud', 'STUDENT', 0, 1, '2026-01-11 20:58:05', NULL, '2025-12-15 12:00:12', '2026-01-11 20:58:05'),
('MUH2225007M', 'hasan2517@student.nstu.edu.bd', '$2b$10$zoZpDMu2/pzlq5FWjsaDKuFKgdfZdDaHpXTBb85r3oWoDSLyvc482', 'HM', 'STUDENT', 1, 1, '2026-01-12 09:22:05', NULL, '2026-01-11 14:42:37', '2026-01-12 09:22:05'),
('MUH2225009M', 'masum2517@student.nstu.edu.bd', '$2b$10$e49D1VUda2M2yjgQ/5npMeJKTZXfRQrSmZqy/4xX79TDDKCZsK9ka', 'Masum Bhuiyan', 'STUDENT', 1, 1, NULL, NULL, '2026-01-12 09:58:00', NULL),
('MUH2225025M', 'masum09@student.nstu.edu.bd', '$2b$10$GfVPe9vhUHNZB.GiDTuyU.VsAtPOP622ta86LINu91gfuIyUMc9hK', 'masum212', 'STUDENT', 0, 1, '2026-01-11 21:43:26', NULL, '2026-01-11 01:04:29', '2026-01-11 21:43:26'),
('MUH2225026M', 'masum1234@student.nstu.edu.bd', '$2b$10$p6MaXrH3skLcm/72ed448e6BNvXE5tj.bIhXb/6hSdbJWdvMNfWf6', 'Masum11', 'STUDENT', 0, 1, '2026-01-22 23:22:40', NULL, '2026-01-11 01:20:44', '2026-01-22 23:22:40'),
('MUH2225030M', 'masum@student.nstu.edu.bd', '$2b$10$ybQdc/LD/cKBLbl6JSOMyeQEKFMmHf8UMvMZ1jwiAtbNayLcy7Zmi', 'Masum', 'STUDENT', 0, 1, '2026-01-11 00:48:32', NULL, '2025-12-18 13:38:43', '2026-01-11 00:48:32'),
('MUH2225051M', 'MUH2225051M@student.nstu.edu.bd', '$2b$10$xgJPwlMspjcgqYsd2FJQSuQr6R/i3PKhIHiDbr2XpCZKy9ZrYZ6NS', 'Masum51', 'STUDENT', 1, 1, '2026-01-15 15:40:54', NULL, '2026-01-12 01:13:56', '2026-01-15 15:40:54'),
('MUH2225052M', 'MUH2225052M@student.nstu.edu.bd', '$2b$10$xgJPwlMspjcgqYsd2FJQSuQr6R/i3PKhIHiDbr2XpCZKy9ZrYZ6NS', 'Masum52', 'STUDENT', 1, 1, '2026-01-15 15:32:26', NULL, '2026-01-12 01:13:56', '2026-01-15 15:32:26'),
('MUH2225053M', 'MUH2225053M@student.nstu.edu.bd', '$2b$10$xgJPwlMspjcgqYsd2FJQSuQr6R/i3PKhIHiDbr2XpCZKy9ZrYZ6NS', 'Masum53', 'STUDENT', 1, 1, '2026-01-15 16:16:17', NULL, '2026-01-12 01:13:56', '2026-01-15 16:16:17'),
('MUH2225054M', 'MUH2225054M@student.nstu.edu.bd', '$2b$10$xgJPwlMspjcgqYsd2FJQSuQr6R/i3PKhIHiDbr2XpCZKy9ZrYZ6NS', 'Masum54', 'STUDENT', 1, 1, '2026-01-15 16:17:36', NULL, '2026-01-12 01:13:56', '2026-01-15 16:17:36'),
('MUH2225055M', 'MUH2225055M@student.nstu.edu.bd', '$2b$10$xgJPwlMspjcgqYsd2FJQSuQr6R/i3PKhIHiDbr2XpCZKy9ZrYZ6NS', 'Masum55', 'STUDENT', 1, 1, '2026-01-15 16:18:57', NULL, '2026-01-12 01:13:56', '2026-01-15 16:18:57'),
('MUH2225056M', 'MUH2225056M@student.nstu.edu.bd', '$2b$10$xgJPwlMspjcgqYsd2FJQSuQr6R/i3PKhIHiDbr2XpCZKy9ZrYZ6NS', 'Hasan56', 'STUDENT', 1, 1, '2026-01-15 16:20:15', NULL, '2026-01-12 01:13:56', '2026-01-15 16:20:15'),
('MUH2225057M', 'MUH2225057M@student.nstu.edu.bd', '$2b$10$xgJPwlMspjcgqYsd2FJQSuQr6R/i3PKhIHiDbr2XpCZKy9ZrYZ6NS', 'Hasan57', 'STUDENT', 1, 1, '2026-01-15 16:21:51', NULL, '2026-01-12 01:13:56', '2026-01-15 16:21:51'),
('MUH2225058M', 'MUH2225058M@student.nstu.edu.bd', '$2b$10$xgJPwlMspjcgqYsd2FJQSuQr6R/i3PKhIHiDbr2XpCZKy9ZrYZ6NS', 'Hasan58', 'STUDENT', 1, 1, '2026-01-17 10:52:05', NULL, '2026-01-12 01:13:56', '2026-01-17 10:52:05'),
('MUH2225059M', 'MUH2225059M@student.nstu.edu.bd', '$2b$10$xgJPwlMspjcgqYsd2FJQSuQr6R/i3PKhIHiDbr2XpCZKy9ZrYZ6NS', 'Hasan59', 'STUDENT', 1, 1, '2026-01-17 09:30:55', NULL, '2026-01-12 01:13:56', '2026-01-17 09:30:55'),
('MUH2225060M', 'MUH2225060M@student.nstu.edu.bd', '$2b$10$xgJPwlMspjcgqYsd2FJQSuQr6R/i3PKhIHiDbr2XpCZKy9ZrYZ6NS', 'Hasan60', 'STUDENT', 1, 1, NULL, NULL, '2026-01-12 01:13:56', '2026-01-12 01:13:56'),
('MUH2225061M', 'MUH2225061M@student.nstu.edu.bd', '$2b$10$xgJPwlMspjcgqYsd2FJQSuQr6R/i3PKhIHiDbr2XpCZKy9ZrYZ6NS', 'Argha61', 'STUDENT', 1, 1, '2026-01-15 15:31:52', NULL, '2026-01-12 01:13:56', '2026-01-15 15:31:52'),
('MUH2225062M', 'MUH2225062M@student.nstu.edu.bd', '$2b$10$xgJPwlMspjcgqYsd2FJQSuQr6R/i3PKhIHiDbr2XpCZKy9ZrYZ6NS', 'Argha62', 'STUDENT', 1, 1, '2026-01-15 01:03:25', NULL, '2026-01-12 01:13:56', '2026-01-15 01:03:25'),
('MUH2225063M', 'MUH2225063M@student.nstu.edu.bd', '$2b$10$xgJPwlMspjcgqYsd2FJQSuQr6R/i3PKhIHiDbr2XpCZKy9ZrYZ6NS', 'Argha63', 'STUDENT', 1, 1, '2026-01-14 13:04:06', NULL, '2026-01-12 01:13:56', '2026-01-14 13:04:06'),
('MUH2225064M', 'MUH2225064M@student.nstu.edu.bd', '$2b$10$xgJPwlMspjcgqYsd2FJQSuQr6R/i3PKhIHiDbr2XpCZKy9ZrYZ6NS', 'Argha64', 'STUDENT', 1, 1, '2026-01-15 16:23:59', NULL, '2026-01-12 01:13:56', '2026-01-15 16:23:59'),
('MUH2225065M', 'MUH2225065M@student.nstu.edu.bd', '$2b$10$xgJPwlMspjcgqYsd2FJQSuQr6R/i3PKhIHiDbr2XpCZKy9ZrYZ6NS', 'Argha65', 'STUDENT', 1, 1, '2026-01-22 23:20:50', NULL, '2026-01-12 01:13:56', '2026-01-22 23:20:50'),
('MUH2225066M', 'MUH2225066M@student.nstu.edu.bd', '$2b$10$xgJPwlMspjcgqYsd2FJQSuQr6R/i3PKhIHiDbr2XpCZKy9ZrYZ6NS', 'Adib66', 'STUDENT', 1, 1, '2026-01-14 12:22:50', NULL, '2026-01-12 01:13:56', '2026-01-14 12:22:50'),
('MUH2225067M', 'MUH2225067M@student.nstu.edu.bd', '$2b$10$xgJPwlMspjcgqYsd2FJQSuQr6R/i3PKhIHiDbr2XpCZKy9ZrYZ6NS', 'Adib67', 'STUDENT', 1, 1, NULL, NULL, '2026-01-12 01:13:56', '2026-01-12 01:13:56'),
('MUH2225068M', 'MUH2225068M@student.nstu.edu.bd', '$2b$10$xgJPwlMspjcgqYsd2FJQSuQr6R/i3PKhIHiDbr2XpCZKy9ZrYZ6NS', 'Adib68', 'STUDENT', 1, 1, '2026-01-15 16:24:13', NULL, '2026-01-12 01:13:56', '2026-01-15 16:24:13'),
('MUH2225069M', 'MUH2225069M@student.nstu.edu.bd', '$2b$10$xgJPwlMspjcgqYsd2FJQSuQr6R/i3PKhIHiDbr2XpCZKy9ZrYZ6NS', 'Adib69', 'STUDENT', 1, 1, '2026-01-17 10:42:25', NULL, '2026-01-12 01:13:56', '2026-01-17 10:42:25'),
('MUH2225070M', 'MUH2225070M@student.nstu.edu.bd', '$2b$10$xgJPwlMspjcgqYsd2FJQSuQr6R/i3PKhIHiDbr2XpCZKy9ZrYZ6NS', 'Adib70', 'STUDENT', 1, 1, '2026-01-22 23:19:00', NULL, '2026-01-12 01:13:56', '2026-01-22 23:19:00'),
('MUH2233020M', 'shipon@student.nstu.edu.bd', '$2b$10$Ua2g2CheqaAAoM7DkBMi0ONY/Ul.hFX079NTDswYyElwGnx.lWW7u', 'Shipon Mia', 'STUDENT', 0, 1, '2025-12-26 15:34:34', NULL, '2025-12-26 15:21:41', '2025-12-26 15:34:34'),
('NFH2225051F', 'NFH2225051F@student.nstu.edu.bd', '$2b$10$xgJPwlMspjcgqYsd2FJQSuQr6R/i3PKhIHiDbr2XpCZKy9ZrYZ6NS', 'Maria51', 'STUDENT', 1, 1, NULL, NULL, '2026-01-12 04:49:56', '2026-01-12 04:49:56'),
('NFH2225052F', 'NFH2225052F@student.nstu.edu.bd', '$2b$10$xgJPwlMspjcgqYsd2FJQSuQr6R/i3PKhIHiDbr2XpCZKy9ZrYZ6NS', 'Hasi52', 'STUDENT', 1, 1, NULL, NULL, '2026-01-12 04:49:56', '2026-01-12 04:49:56'),
('NFH2225053F', 'NFH2225053F@student.nstu.edu.bd', '$2b$10$xgJPwlMspjcgqYsd2FJQSuQr6R/i3PKhIHiDbr2XpCZKy9ZrYZ6NS', 'Arni53', 'STUDENT', 1, 1, NULL, NULL, '2026-01-12 04:49:56', '2026-01-12 04:49:56'),
('NFH2225054F', 'NFH2225054F@student.nstu.edu.bd', '$2b$10$xgJPwlMspjcgqYsd2FJQSuQr6R/i3PKhIHiDbr2XpCZKy9ZrYZ6NS', 'Adiba54', 'STUDENT', 1, 1, NULL, NULL, '2026-01-12 04:49:56', '2026-01-12 04:49:56'),
('NFH2225055F', 'NFH2225055F@student.nstu.edu.bd', '$2b$10$xgJPwlMspjcgqYsd2FJQSuQr6R/i3PKhIHiDbr2XpCZKy9ZrYZ6NS', 'Maria55', 'STUDENT', 1, 1, NULL, NULL, '2026-01-12 04:49:56', '2026-01-12 04:49:56'),
('NFH2225056F', 'NFH2225056F@student.nstu.edu.bd', '$2b$10$xgJPwlMspjcgqYsd2FJQSuQr6R/i3PKhIHiDbr2XpCZKy9ZrYZ6NS', 'Hasi56', 'STUDENT', 1, 1, NULL, NULL, '2026-01-12 04:49:56', '2026-01-12 04:49:56'),
('NFH2225057F', 'NFH2225057F@student.nstu.edu.bd', '$2b$10$xgJPwlMspjcgqYsd2FJQSuQr6R/i3PKhIHiDbr2XpCZKy9ZrYZ6NS', 'Arni57', 'STUDENT', 1, 1, NULL, NULL, '2026-01-12 04:49:56', '2026-01-12 04:49:56'),
('NFH2225058F', 'NFH2225058F@student.nstu.edu.bd', '$2b$10$xgJPwlMspjcgqYsd2FJQSuQr6R/i3PKhIHiDbr2XpCZKy9ZrYZ6NS', 'Adiba58', 'STUDENT', 1, 1, NULL, NULL, '2026-01-12 04:49:56', '2026-01-12 04:49:56'),
('NFH2225059F', 'NFH2225059F@student.nstu.edu.bd', '$2b$10$xgJPwlMspjcgqYsd2FJQSuQr6R/i3PKhIHiDbr2XpCZKy9ZrYZ6NS', 'Maria59', 'STUDENT', 1, 1, NULL, NULL, '2026-01-12 04:49:56', '2026-01-12 04:49:56'),
('NFH2225060F', 'NFH2225060F@student.nstu.edu.bd', '$2b$10$xgJPwlMspjcgqYsd2FJQSuQr6R/i3PKhIHiDbr2XpCZKy9ZrYZ6NS', 'Hasi60', 'STUDENT', 1, 1, NULL, NULL, '2026-01-12 04:49:56', '2026-01-12 04:49:56'),
('NFH2225061F', 'NFH2225061F@student.nstu.edu.bd', '$2b$10$xgJPwlMspjcgqYsd2FJQSuQr6R/i3PKhIHiDbr2XpCZKy9ZrYZ6NS', 'Arni61', 'STUDENT', 1, 1, NULL, NULL, '2026-01-12 04:49:56', '2026-01-12 04:49:56'),
('NFH2225062F', 'NFH2225062F@student.nstu.edu.bd', '$2b$10$xgJPwlMspjcgqYsd2FJQSuQr6R/i3PKhIHiDbr2XpCZKy9ZrYZ6NS', 'Adiba62', 'STUDENT', 1, 1, NULL, NULL, '2026-01-12 04:49:56', '2026-01-12 04:49:56'),
('NFH2225063F', 'NFH2225063F@student.nstu.edu.bd', '$2b$10$xgJPwlMspjcgqYsd2FJQSuQr6R/i3PKhIHiDbr2XpCZKy9ZrYZ6NS', 'Maria63', 'STUDENT', 1, 1, NULL, NULL, '2026-01-12 04:49:56', '2026-01-12 04:49:56'),
('NFH2225064F', 'NFH2225064F@student.nstu.edu.bd', '$2b$10$xgJPwlMspjcgqYsd2FJQSuQr6R/i3PKhIHiDbr2XpCZKy9ZrYZ6NS', 'Hasi64', 'STUDENT', 1, 1, NULL, NULL, '2026-01-12 04:49:56', '2026-01-12 04:49:56'),
('NFH2225065F', 'NFH2225065F@student.nstu.edu.bd', '$2b$10$xgJPwlMspjcgqYsd2FJQSuQr6R/i3PKhIHiDbr2XpCZKy9ZrYZ6NS', 'Arni65', 'STUDENT', 1, 1, NULL, NULL, '2026-01-12 04:49:56', '2026-01-12 04:49:56'),
('NFH2225066F', 'NFH2225066F@student.nstu.edu.bd', '$2b$10$xgJPwlMspjcgqYsd2FJQSuQr6R/i3PKhIHiDbr2XpCZKy9ZrYZ6NS', 'Adiba66', 'STUDENT', 1, 1, NULL, NULL, '2026-01-12 04:49:56', '2026-01-12 04:49:56'),
('NFH2225067F', 'NFH2225067F@student.nstu.edu.bd', '$2b$10$xgJPwlMspjcgqYsd2FJQSuQr6R/i3PKhIHiDbr2XpCZKy9ZrYZ6NS', 'Maria67', 'STUDENT', 1, 1, NULL, NULL, '2026-01-12 04:49:56', '2026-01-12 04:49:56'),
('NFH2225068F', 'NFH2225068F@student.nstu.edu.bd', '$2b$10$xgJPwlMspjcgqYsd2FJQSuQr6R/i3PKhIHiDbr2XpCZKy9ZrYZ6NS', 'Hasi68', 'STUDENT', 1, 1, NULL, NULL, '2026-01-12 04:49:56', '2026-01-12 04:49:56'),
('NFH2225069F', 'NFH2225069F@student.nstu.edu.bd', '$2b$10$xgJPwlMspjcgqYsd2FJQSuQr6R/i3PKhIHiDbr2XpCZKy9ZrYZ6NS', 'Arni69', 'STUDENT', 1, 1, NULL, NULL, '2026-01-12 04:49:56', '2026-01-12 04:49:56'),
('NFH2225070F', 'NFH2225070F@student.nstu.edu.bd', '$2b$10$xgJPwlMspjcgqYsd2FJQSuQr6R/i3PKhIHiDbr2XpCZKy9ZrYZ6NS', 'Adiba70', 'STUDENT', 1, 1, NULL, NULL, '2026-01-12 04:49:56', '2026-01-12 04:49:56'),
('staff-ash', 'staff.ash@nstu.edu.bd', '$2b$10$D2/HC9yEcNiP/cKV8fog.eZVKceJLD72yaS7zjyfRQTeArDd4JeYu', 'Staff - Abdus Salam Hall', 'STAFF', 1, 1, '2026-01-09 20:13:48', NULL, '2026-01-09 19:53:14', '2026-01-09 20:13:48'),
('staff-bkh', 'staff.bkh@nstu.edu.bd', '$2b$10$EK694AX2xQ2bzle1vvNRieoAd8plzH2jJCMr1YocEX8wk/f4L9rAW', 'Staff - Bibi Khadiza Hall', 'STAFF', 1, 1, NULL, NULL, '2026-01-09 19:53:14', NULL),
('staff-jsh', 'staff.jsh@nstu.edu.bd', '$2b$10$Uv3eUjALgkj/qhgBdetl.OGuh7UxVB.tx4VGMRM8kEJHZHAYQX9aO', 'Staff - Shahid Smriti Chatri Hall', 'STAFF', 1, 1, NULL, NULL, '2026-01-09 20:06:54', NULL),
('staff-mal', 'staff.mal@nstu.edu.bd', '$2b$10$J4tJ6nPXmRTySi/IspdJ.u5O4GrY2Gm2CMQ7lsPOq/cD4ri6vz3XS', 'Staff - Maqsudul Hasan Hall', 'STAFF', 1, 1, NULL, NULL, '2026-01-09 19:53:14', NULL),
('staff-muh', 'staff.muh@nstu.edu.bd', '$2b$10$4EHYSAj6nRpgmvBTzJVCh.OA9RNulVwbHYHXIrcPntMP1sUJhAcPK', 'Staff - Abdul Malek Ukil Hall', 'STAFF', 1, 1, '2026-01-10 20:20:30', NULL, '2026-01-09 19:53:14', '2026-01-10 20:20:30'),
('staff-nfh', 'staff.nfh@nstu.edu.bd', '$2b$10$i8bbANhrHT8flm9zgKME4eH93hoBwchE2es.ff5rH/wO3xGosnur2', 'Staff - Nawab Faizunnesa Choudhurani Hall', 'STAFF', 1, 1, NULL, NULL, '2026-01-09 20:06:54', NULL),
('staff-user-uuid', 'staff@nstu.edu.bd', '$2b$10$1GvL8k598hXVtTnwD0.CXO7aFU79vdgck65hHM8saeZVJP2tMYCR.', 'Staff Member', 'STAFF', 1, 1, '2026-01-11 15:31:42', NULL, '2025-11-05 12:00:04', '2026-01-11 15:31:42'),
('student-muh', 'student.muh@student.nstu.edu.bd', '$2b$10$2v31nC9sIKkeGnAMVEOr2eqWlkQJ.Zlz3.R2xtPqc4nnKmZKFnO8O', 'Hasan Mahmud', 'STUDENT', 1, 1, '2026-01-11 09:47:01', NULL, '2025-10-28 20:53:37', '2026-01-11 09:47:01');

-- --------------------------------------------------------

--
-- Table structure for table `waitlist_entries`
--

CREATE TABLE `waitlist_entries` (
  `entryId` char(36) NOT NULL,
  `studentId` char(36) NOT NULL,
  `hallId` char(36) NOT NULL,
  `applicationId` char(36) NOT NULL,
  `position` int(11) NOT NULL,
  `score` decimal(5,2) DEFAULT NULL,
  `status` enum('ACTIVE','INACTIVE','DELETED') NOT NULL DEFAULT 'ACTIVE',
  `addedAt` datetime NOT NULL DEFAULT current_timestamp(),
  `removedAt` datetime DEFAULT NULL,
  `removalReason` text DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `waitlist_entries`
--

INSERT INTO `waitlist_entries` (`entryId`, `studentId`, `hallId`, `applicationId`, `position`, `score`, `status`, `addedAt`, `removedAt`, `removalReason`, `created_at`, `updated_at`) VALUES
('008ec1ff-d9bf-4242-9aa0-68ca4369266f', 'MUH2225026M', 'hall-muh', '359d48b5-6f06-416e-8352-6dee6bd9f0bf', 53, 55.00, 'INACTIVE', '2026-01-11 01:25:17', '2026-01-11 01:26:35', NULL, '2026-01-11 01:25:17', '2026-01-12 10:10:03'),
('20096d0f-6ffa-45bb-b49e-94be77f0acf8', 'MUH2125020M', 'hall-muh', '8b4a5628-caef-4d29-92a3-ac3234333974', 54, 10.00, 'INACTIVE', '2025-12-26 02:10:48', '2025-12-26 02:11:08', NULL, '2025-12-26 02:10:48', '2026-01-12 10:10:03'),
('2f3690af-0d4a-4302-90b2-0a2618cc07b6', 'MUH2125013M', 'hall-muh', '88844505-03ef-4f9a-add8-c4584eb5eaf8', 55, 35.00, 'INACTIVE', '2025-12-26 00:53:09', '2025-12-26 00:54:05', NULL, '2025-12-26 00:53:09', '2026-01-12 10:10:03'),
('5f13ca74-ada8-4642-b3d2-3183249eb38f', 'MUH2225051M', 'hall-muh', '65ac72c5-b0b4-45ee-95ff-5e24095f1b81', 1, 80.00, 'ACTIVE', '2026-01-12 10:10:03', NULL, NULL, '2026-01-12 10:10:03', '2026-01-12 10:10:03'),
('6a813cbf-66e4-47d9-9d3e-cc669bf1e3b9', 'MUH2125020M', 'hall-muh', '3e720e16-d8e5-4ac0-81e3-f44208dad6af', 56, 45.00, 'INACTIVE', '2025-12-26 01:39:55', '2025-12-26 01:40:17', NULL, '2025-12-26 01:39:55', '2026-01-12 10:10:03'),
('925b93aa-2441-4aa3-bcc7-bebff6d1bc92', 'student-muh', 'hall-muh', 'ec42fd37-691c-49ab-be90-fad5207d71c9', 2, 20.00, 'ACTIVE', '2025-12-25 05:00:24', NULL, NULL, '2025-12-25 05:00:24', '2026-01-12 10:10:03'),
('fad8b2d0-a4ba-4ef8-885f-b9a31bd2dbed', 'MUH2233020M', 'hall-muh', 'e59d076e-3e13-4b04-91de-1687a066b62a', 57, 25.00, 'INACTIVE', '2025-12-26 15:23:53', '2025-12-26 15:24:49', NULL, '2025-12-26 15:23:53', '2026-01-12 10:10:03');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin_profiles`
--
ALTER TABLE `admin_profiles`
  ADD PRIMARY KEY (`userId`),
  ADD KEY `idx_admin_hall` (`hallId`),
  ADD KEY `fk_admin_profiles_created_by` (`created_by`);

--
-- Indexes for table `applications`
--
ALTER TABLE `applications`
  ADD PRIMARY KEY (`applicationId`),
  ADD UNIQUE KEY `idx_app_form_student` (`formId`,`studentId`),
  ADD KEY `idx_app_student` (`studentId`),
  ADD KEY `idx_app_status` (`status`),
  ADD KEY `idx_app_submission` (`submissionDate`),
  ADD KEY `idx_app_hall_status` (`hallId`,`status`),
  ADD KEY `fk_applications_form_version` (`formVersionId`),
  ADD KEY `fk_applications_reviewed_by` (`reviewedBy`);

--
-- Indexes for table `application_forms`
--
ALTER TABLE `application_forms`
  ADD PRIMARY KEY (`formId`),
  ADD KEY `idx_form_hall_active` (`hallId`,`isActive`),
  ADD KEY `fk_application_forms_created_by` (`created_by`),
  ADD KEY `fk_application_forms_updated_by` (`updated_by`);

--
-- Indexes for table `attachments`
--
ALTER TABLE `attachments`
  ADD PRIMARY KEY (`attachmentId`),
  ADD KEY `idx_attachment_entity` (`entityType`,`entityId`),
  ADD KEY `idx_attachment_creator` (`created_by`),
  ADD KEY `idx_attachment_type` (`fileType`);

--
-- Indexes for table `complaints`
--
ALTER TABLE `complaints`
  ADD PRIMARY KEY (`complaintId`),
  ADD KEY `fk_complaints_user` (`userId`),
  ADD KEY `fk_complaints_hall` (`hallId`),
  ADD KEY `fk_complaints_attachment` (`attachmentId`),
  ADD KEY `fk_complaints_created_by` (`created_by`),
  ADD KEY `fk_complaints_updated_by` (`updated_by`);

--
-- Indexes for table `disciplinary_records`
--
ALTER TABLE `disciplinary_records`
  ADD PRIMARY KEY (`recordId`),
  ADD KEY `idx_disciplinary_student` (`studentId`),
  ADD KEY `idx_disciplinary_hall_student` (`hallId`,`studentId`),
  ADD KEY `idx_disciplinary_date` (`incidentDate`),
  ADD KEY `fk_disciplinary_attachment` (`attachmentId`),
  ADD KEY `fk_disciplinary_created_by` (`created_by`),
  ADD KEY `fk_disciplinary_updated_by` (`updated_by`);

--
-- Indexes for table `exam_controller_profiles`
--
ALTER TABLE `exam_controller_profiles`
  ADD PRIMARY KEY (`userId`);

--
-- Indexes for table `exam_results`
--
ALTER TABLE `exam_results`
  ADD PRIMARY KEY (`resultId`),
  ADD KEY `idx_result_semester` (`semester`),
  ADD KEY `idx_result_visible` (`isVisible`),
  ADD KEY `idx_result_semester_year` (`semester`,`academicYear`),
  ADD KEY `fk_exam_results_attachment` (`attachmentId`),
  ADD KEY `fk_exam_results_created_by` (`created_by`);

--
-- Indexes for table `exam_seat_plans`
--
ALTER TABLE `exam_seat_plans`
  ADD PRIMARY KEY (`planId`),
  ADD KEY `idx_seatplan_date` (`examDate`),
  ADD KEY `idx_seatplan_visible` (`isVisible`),
  ADD KEY `idx_seatplan_semester` (`semester`),
  ADD KEY `fk_exam_seat_plans_attachment` (`attachmentId`),
  ADD KEY `fk_exam_seat_plans_created_by` (`created_by`);

--
-- Indexes for table `field_options`
--
ALTER TABLE `field_options`
  ADD PRIMARY KEY (`optionId`),
  ADD KEY `fk_field_options_field` (`fieldId`),
  ADD KEY `fk_field_options_version` (`versionId`);

--
-- Indexes for table `form_fields`
--
ALTER TABLE `form_fields`
  ADD PRIMARY KEY (`fieldId`),
  ADD KEY `fk_form_fields_form` (`formId`),
  ADD KEY `fk_form_fields_version` (`versionId`);

--
-- Indexes for table `form_responses`
--
ALTER TABLE `form_responses`
  ADD PRIMARY KEY (`responseId`),
  ADD UNIQUE KEY `idx_response_application` (`applicationId`);

--
-- Indexes for table `form_response_values`
--
ALTER TABLE `form_response_values`
  ADD PRIMARY KEY (`responseId`,`fieldId`),
  ADD KEY `idx_response_value_field` (`fieldId`);

--
-- Indexes for table `form_sessions`
--
ALTER TABLE `form_sessions`
  ADD PRIMARY KEY (`formSessionId`),
  ADD KEY `fk_form_sessions_form` (`formId`);

--
-- Indexes for table `form_versions`
--
ALTER TABLE `form_versions`
  ADD PRIMARY KEY (`versionId`),
  ADD UNIQUE KEY `idx_form_version_number` (`formId`,`versionNumber`),
  ADD KEY `fk_form_versions_created_by` (`created_by`);

--
-- Indexes for table `halls`
--
ALTER TABLE `halls`
  ADD PRIMARY KEY (`hallId`),
  ADD UNIQUE KEY `idx_hall_code` (`hallCode`),
  ADD UNIQUE KEY `idx_hall_name` (`hallName`),
  ADD KEY `idx_hall_gender` (`gender`),
  ADD KEY `idx_hall_status` (`status`);

--
-- Indexes for table `interviews`
--
ALTER TABLE `interviews`
  ADD PRIMARY KEY (`interviewId`),
  ADD UNIQUE KEY `u_app` (`applicationId`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`notificationId`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`paymentId`),
  ADD KEY `fk_payments_student` (`studentId`);

--
-- Indexes for table `renewals`
--
ALTER TABLE `renewals`
  ADD PRIMARY KEY (`renewalId`),
  ADD UNIQUE KEY `idx_renewal_student_year` (`studentId`,`academicYear`),
  ADD KEY `idx_renewal_status` (`status`),
  ADD KEY `idx_renewal_allocation` (`allocationId`),
  ADD KEY `fk_renewals_reviewed_by` (`reviewedBy`),
  ADD KEY `fk_renewals_attachment` (`attachmentId`);

--
-- Indexes for table `rooms`
--
ALTER TABLE `rooms`
  ADD PRIMARY KEY (`roomId`),
  ADD UNIQUE KEY `idx_room_hall_number` (`hallId`,`roomNumber`),
  ADD KEY `idx_room_status` (`status`),
  ADD KEY `idx_room_hall_status` (`hallId`,`status`);

--
-- Indexes for table `staff_profiles`
--
ALTER TABLE `staff_profiles`
  ADD PRIMARY KEY (`userId`),
  ADD KEY `idx_staff_hall` (`hallId`),
  ADD KEY `fk_staff_profiles_created_by` (`created_by`);

--
-- Indexes for table `student_allocations`
--
ALTER TABLE `student_allocations`
  ADD PRIMARY KEY (`allocationId`),
  ADD KEY `idx_allocation_student` (`studentId`),
  ADD KEY `idx_allocation_room` (`roomId`),
  ADD KEY `idx_allocation_status` (`status`),
  ADD KEY `fk_allocations_application` (`applicationId`),
  ADD KEY `fk_allocations_payment` (`paymentId`),
  ADD KEY `fk_allocations_created_by` (`created_by`),
  ADD KEY `fk_allocations_updated_by` (`updated_by`);

--
-- Indexes for table `student_profiles`
--
ALTER TABLE `student_profiles`
  ADD PRIMARY KEY (`userId`),
  ADD UNIQUE KEY `idx_student_university_id` (`universityId`),
  ADD KEY `idx_student_hall` (`hallId`),
  ADD KEY `idx_student_phone` (`phone`),
  ADD KEY `idx_student_profiles_studentIdCardUrl` (`studentIdCardUrl`),
  ADD KEY `idx_student_profiles_programLevel` (`programLevel`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`userId`),
  ADD UNIQUE KEY `idx_users_email` (`email`),
  ADD KEY `idx_users_role` (`role`),
  ADD KEY `idx_users_active` (`isActive`);

--
-- Indexes for table `waitlist_entries`
--
ALTER TABLE `waitlist_entries`
  ADD PRIMARY KEY (`entryId`),
  ADD UNIQUE KEY `idx_waitlist_hall_position` (`hallId`,`position`),
  ADD KEY `idx_waitlist_student` (`studentId`),
  ADD KEY `idx_waitlist_status` (`status`),
  ADD KEY `fk_waitlist_application` (`applicationId`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `admin_profiles`
--
ALTER TABLE `admin_profiles`
  ADD CONSTRAINT `fk_admin_profiles_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`userId`),
  ADD CONSTRAINT `fk_admin_profiles_hall` FOREIGN KEY (`hallId`) REFERENCES `halls` (`hallId`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_admin_profiles_user` FOREIGN KEY (`userId`) REFERENCES `users` (`userId`) ON DELETE CASCADE;

--
-- Constraints for table `applications`
--
ALTER TABLE `applications`
  ADD CONSTRAINT `fk_applications_form` FOREIGN KEY (`formId`) REFERENCES `application_forms` (`formId`),
  ADD CONSTRAINT `fk_applications_form_version` FOREIGN KEY (`formVersionId`) REFERENCES `form_versions` (`versionId`),
  ADD CONSTRAINT `fk_applications_hall` FOREIGN KEY (`hallId`) REFERENCES `halls` (`hallId`),
  ADD CONSTRAINT `fk_applications_reviewed_by` FOREIGN KEY (`reviewedBy`) REFERENCES `users` (`userId`),
  ADD CONSTRAINT `fk_applications_student` FOREIGN KEY (`studentId`) REFERENCES `users` (`userId`);

--
-- Constraints for table `application_forms`
--
ALTER TABLE `application_forms`
  ADD CONSTRAINT `fk_application_forms_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`userId`),
  ADD CONSTRAINT `fk_application_forms_hall` FOREIGN KEY (`hallId`) REFERENCES `halls` (`hallId`),
  ADD CONSTRAINT `fk_application_forms_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `users` (`userId`);

--
-- Constraints for table `attachments`
--
ALTER TABLE `attachments`
  ADD CONSTRAINT `fk_attachments_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`userId`);

--
-- Constraints for table `complaints`
--
ALTER TABLE `complaints`
  ADD CONSTRAINT `fk_complaints_attachment` FOREIGN KEY (`attachmentId`) REFERENCES `attachments` (`attachmentId`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_complaints_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`userId`),
  ADD CONSTRAINT `fk_complaints_hall` FOREIGN KEY (`hallId`) REFERENCES `halls` (`hallId`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_complaints_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `users` (`userId`),
  ADD CONSTRAINT `fk_complaints_user` FOREIGN KEY (`userId`) REFERENCES `users` (`userId`);

--
-- Constraints for table `disciplinary_records`
--
ALTER TABLE `disciplinary_records`
  ADD CONSTRAINT `fk_disciplinary_attachment` FOREIGN KEY (`attachmentId`) REFERENCES `attachments` (`attachmentId`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_disciplinary_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`userId`),
  ADD CONSTRAINT `fk_disciplinary_hall` FOREIGN KEY (`hallId`) REFERENCES `halls` (`hallId`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_disciplinary_student` FOREIGN KEY (`studentId`) REFERENCES `users` (`userId`),
  ADD CONSTRAINT `fk_disciplinary_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `users` (`userId`);

--
-- Constraints for table `exam_controller_profiles`
--
ALTER TABLE `exam_controller_profiles`
  ADD CONSTRAINT `fk_exam_controller_profiles_user` FOREIGN KEY (`userId`) REFERENCES `users` (`userId`) ON DELETE CASCADE;

--
-- Constraints for table `exam_results`
--
ALTER TABLE `exam_results`
  ADD CONSTRAINT `fk_exam_results_attachment` FOREIGN KEY (`attachmentId`) REFERENCES `attachments` (`attachmentId`),
  ADD CONSTRAINT `fk_exam_results_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`userId`);

--
-- Constraints for table `exam_seat_plans`
--
ALTER TABLE `exam_seat_plans`
  ADD CONSTRAINT `fk_exam_seat_plans_attachment` FOREIGN KEY (`attachmentId`) REFERENCES `attachments` (`attachmentId`),
  ADD CONSTRAINT `fk_exam_seat_plans_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`userId`);

--
-- Constraints for table `field_options`
--
ALTER TABLE `field_options`
  ADD CONSTRAINT `fk_field_options_field` FOREIGN KEY (`fieldId`) REFERENCES `form_fields` (`fieldId`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_field_options_version` FOREIGN KEY (`versionId`) REFERENCES `form_versions` (`versionId`) ON DELETE CASCADE;

--
-- Constraints for table `form_fields`
--
ALTER TABLE `form_fields`
  ADD CONSTRAINT `fk_form_fields_form` FOREIGN KEY (`formId`) REFERENCES `application_forms` (`formId`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_form_fields_version` FOREIGN KEY (`versionId`) REFERENCES `form_versions` (`versionId`) ON DELETE CASCADE;

--
-- Constraints for table `form_responses`
--
ALTER TABLE `form_responses`
  ADD CONSTRAINT `fk_form_responses_application` FOREIGN KEY (`applicationId`) REFERENCES `applications` (`applicationId`) ON DELETE CASCADE;

--
-- Constraints for table `form_response_values`
--
ALTER TABLE `form_response_values`
  ADD CONSTRAINT `fk_response_values_field` FOREIGN KEY (`fieldId`) REFERENCES `form_fields` (`fieldId`),
  ADD CONSTRAINT `fk_response_values_response` FOREIGN KEY (`responseId`) REFERENCES `form_responses` (`responseId`) ON DELETE CASCADE;

--
-- Constraints for table `form_sessions`
--
ALTER TABLE `form_sessions`
  ADD CONSTRAINT `fk_form_sessions_form` FOREIGN KEY (`formId`) REFERENCES `application_forms` (`formId`) ON DELETE CASCADE;

--
-- Constraints for table `form_versions`
--
ALTER TABLE `form_versions`
  ADD CONSTRAINT `fk_form_versions_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`userId`),
  ADD CONSTRAINT `fk_form_versions_form` FOREIGN KEY (`formId`) REFERENCES `application_forms` (`formId`) ON DELETE CASCADE;

--
-- Constraints for table `interviews`
--
ALTER TABLE `interviews`
  ADD CONSTRAINT `fk_interview_app` FOREIGN KEY (`applicationId`) REFERENCES `applications` (`applicationId`) ON DELETE CASCADE;

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `fk_payments_student` FOREIGN KEY (`studentId`) REFERENCES `users` (`userId`);

--
-- Constraints for table `renewals`
--
ALTER TABLE `renewals`
  ADD CONSTRAINT `fk_renewals_allocation` FOREIGN KEY (`allocationId`) REFERENCES `student_allocations` (`allocationId`),
  ADD CONSTRAINT `fk_renewals_attachment` FOREIGN KEY (`attachmentId`) REFERENCES `attachments` (`attachmentId`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_renewals_reviewed_by` FOREIGN KEY (`reviewedBy`) REFERENCES `users` (`userId`),
  ADD CONSTRAINT `fk_renewals_student` FOREIGN KEY (`studentId`) REFERENCES `users` (`userId`);

--
-- Constraints for table `rooms`
--
ALTER TABLE `rooms`
  ADD CONSTRAINT `fk_rooms_hall` FOREIGN KEY (`hallId`) REFERENCES `halls` (`hallId`) ON DELETE CASCADE;

--
-- Constraints for table `staff_profiles`
--
ALTER TABLE `staff_profiles`
  ADD CONSTRAINT `fk_staff_profiles_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`userId`),
  ADD CONSTRAINT `fk_staff_profiles_hall` FOREIGN KEY (`hallId`) REFERENCES `halls` (`hallId`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_staff_profiles_user` FOREIGN KEY (`userId`) REFERENCES `users` (`userId`) ON DELETE CASCADE;

--
-- Constraints for table `student_allocations`
--
ALTER TABLE `student_allocations`
  ADD CONSTRAINT `fk_allocations_application` FOREIGN KEY (`applicationId`) REFERENCES `applications` (`applicationId`),
  ADD CONSTRAINT `fk_allocations_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`userId`),
  ADD CONSTRAINT `fk_allocations_payment` FOREIGN KEY (`paymentId`) REFERENCES `payments` (`paymentId`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_allocations_room` FOREIGN KEY (`roomId`) REFERENCES `rooms` (`roomId`),
  ADD CONSTRAINT `fk_allocations_student` FOREIGN KEY (`studentId`) REFERENCES `users` (`userId`),
  ADD CONSTRAINT `fk_allocations_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `users` (`userId`);

--
-- Constraints for table `student_profiles`
--
ALTER TABLE `student_profiles`
  ADD CONSTRAINT `fk_student_profiles_hall` FOREIGN KEY (`hallId`) REFERENCES `halls` (`hallId`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_student_profiles_user` FOREIGN KEY (`userId`) REFERENCES `users` (`userId`) ON DELETE CASCADE;

--
-- Constraints for table `waitlist_entries`
--
ALTER TABLE `waitlist_entries`
  ADD CONSTRAINT `fk_waitlist_application` FOREIGN KEY (`applicationId`) REFERENCES `applications` (`applicationId`),
  ADD CONSTRAINT `fk_waitlist_hall` FOREIGN KEY (`hallId`) REFERENCES `halls` (`hallId`),
  ADD CONSTRAINT `fk_waitlist_student` FOREIGN KEY (`studentId`) REFERENCES `users` (`userId`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
