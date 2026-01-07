-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: aukcja
-- ------------------------------------------------------
-- Server version	8.0.44

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `auction`
--

DROP TABLE IF EXISTS `auction`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auction` (
  `id_auction` int unsigned NOT NULL AUTO_INCREMENT,
  `id_item` int unsigned NOT NULL,
  `start_price` decimal(10,2) NOT NULL,
  `start_auction` datetime NOT NULL,
  `end_auction` datetime NOT NULL,
  `overtime_auction` int NOT NULL DEFAULT '0',
  `id_winner` int unsigned DEFAULT NULL,
  PRIMARY KEY (`id_auction`),
  KEY `auction_id_item_foreign` (`id_item`),
  KEY `auction_id_winner_foreign` (`id_winner`),
  CONSTRAINT `auction_id_item_foreign` FOREIGN KEY (`id_item`) REFERENCES `auction_item` (`id_item`),
  CONSTRAINT `auction_id_winner_foreign` FOREIGN KEY (`id_winner`) REFERENCES `users` (`id_user`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `auction_item`
--

DROP TABLE IF EXISTS `auction_item`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auction_item` (
  `id_item` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` varchar(2048) NOT NULL,
  `id_seller` int unsigned NOT NULL,
  `status` enum('at_auction','sold','not_issued') NOT NULL,
  PRIMARY KEY (`id_item`),
  KEY `auction_item_id_seller_foreign` (`id_seller`),
  CONSTRAINT `auction_item_id_seller_foreign` FOREIGN KEY (`id_seller`) REFERENCES `users` (`id_user`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `auction_price_history`
--

DROP TABLE IF EXISTS `auction_price_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auction_price_history` (
  `id_price_history` int unsigned NOT NULL AUTO_INCREMENT,
  `id_auction` int unsigned NOT NULL,
  `id_users` int unsigned NOT NULL,
  `new_price` decimal(10,2) NOT NULL,
  `date_price_reprint` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_price_history`),
  KEY `aph_id_auction_foreign` (`id_auction`),
  KEY `aph_id_users_foreign` (`id_users`),
  CONSTRAINT `aph_id_auction_foreign` FOREIGN KEY (`id_auction`) REFERENCES `auction` (`id_auction`),
  CONSTRAINT `aph_id_users_foreign` FOREIGN KEY (`id_users`) REFERENCES `users` (`id_user`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id_categories` int unsigned NOT NULL AUTO_INCREMENT,
  `categories_name` varchar(255) NOT NULL,
  PRIMARY KEY (`id_categories`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `categories_item`
--

DROP TABLE IF EXISTS `categories_item`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories_item` (
  `id_cat` int unsigned NOT NULL,
  `id_item` int unsigned NOT NULL,
  PRIMARY KEY (`id_cat`,`id_item`),
  KEY `ci_id_item_foreign` (`id_item`),
  CONSTRAINT `ci_id_cat_foreign` FOREIGN KEY (`id_cat`) REFERENCES `categories` (`id_categories`),
  CONSTRAINT `ci_id_item_foreign` FOREIGN KEY (`id_item`) REFERENCES `auction_item` (`id_item`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `photos_item`
--

DROP TABLE IF EXISTS `photos_item`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `photos_item` (
  `id_photo` int unsigned NOT NULL AUTO_INCREMENT,
  `id_item` int unsigned NOT NULL,
  `photo` varchar(512) NOT NULL,
  `is_main_photo` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id_photo`),
  KEY `photos_item_id_item_foreign` (`id_item`),
  CONSTRAINT `photos_item_id_item_foreign` FOREIGN KEY (`id_item`) REFERENCES `auction_item` (`id_item`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id_user` int unsigned NOT NULL AUTO_INCREMENT,
  `first_name` varchar(64) NOT NULL,
  `last_name` varchar(64) NOT NULL,
  `email` varchar(128) NOT NULL,
  `password` varchar(1024) NOT NULL,
  `phone_number` varchar(20) NOT NULL,
  `create_account_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_user`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-01-03  2:47:31
