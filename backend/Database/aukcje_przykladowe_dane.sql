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
-- Dumping data for table `auction`
--

LOCK TABLES `auction` WRITE;
/*!40000 ALTER TABLE `auction` DISABLE KEYS */;
INSERT INTO `auction` VALUES (1,1,1000.00,'2026-01-03 00:00:00','2026-02-03 00:00:00',0,NULL),(2,2,500.50,'2026-01-03 00:00:00','2026-01-04 00:00:00',90,1),(3,3,9.99,'2026-01-15 00:00:00','2026-01-15 20:00:00',0,NULL);
/*!40000 ALTER TABLE `auction` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `auction_item`
--

LOCK TABLES `auction_item` WRITE;
/*!40000 ALTER TABLE `auction_item` DISABLE KEYS */;
INSERT INTO `auction_item` VALUES (1,'PC','Komputer',1,'at_auction'),(2,'Ekspres do kawy ciśnieniowy automatyczny Philips 1200 czarny EP1200/00','Podstawowe informacje:✅ Dostępne przepisy: Ristretto, Espresso, Long coffee, Cappuccino, Latte macchiato, Spienione mleko✅ System mleczny: Automatyczny system spieniania Milk Maestro ze zintegrowaną karafką na mleko z możliwością regulacji objętości pianki mlecznej✅ Czyszczenie ekspresu: Automatyczne czyszczenie tabletką✅ Kolory: Pepite/Czarny✅ Akcesoria w zestawie: Instrukcja obsługi, karafka na mleko, dysza do wody, igła czyszcząca, dysza pary✅ Wyświetlacz: Kolorowe przyciski, podświetlenia LED ❓ Dodatkowe informacje:Automatyczne: odkamienianie, płukanie, czyszczenie ekspresu Ciśnienie 15 barów Moc: 1450WZbiornik na wodę 1,7 l Stalowy szwajcarski młynek stożkowy: 5 stopni mielenia Pojemnik na fusy: opróżniany po 9 kawach Wyjmowana tacka ociekowa Zbiornik na ziarna o pojemności 250g Ruchoma wylewka: kawa w naczyniu do wysokości 13cm Spienianie mleka Zapamiętywanie ustawień Personalizacja: 2 ulubione kawy',2,'sold'),(3,'Dwustronny szary szalik damski zimowy','Stylowy szalik damski z monogramem na całej powierzchni to połączenie ponadczasowego designu i komfortu, które sprawdzi się w sezonie jesienno-zimowym.',1,'not_issued');
/*!40000 ALTER TABLE `auction_item` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `auction_price_history`
--

LOCK TABLES `auction_price_history` WRITE;
/*!40000 ALTER TABLE `auction_price_history` DISABLE KEYS */;
INSERT INTO `auction_price_history` VALUES (1,2,3,550.00,'2026-01-03 10:00:00'),(2,2,1,600.00,'2026-01-03 12:00:00'),(3,2,3,750.00,'2026-01-03 18:00:00'),(4,2,1,999.99,'2026-01-03 18:32:59'),(5,2,3,1000.01,'2026-01-03 23:55:42'),(6,2,1,1001.00,'2026-01-03 23:59:55'),(7,2,3,1200.00,'2026-01-04 00:00:42'),(8,2,1,1349.99,'2026-01-04 00:01:30'),(9,1,2,1049.50,'2026-01-13 23:55:42');
/*!40000 ALTER TABLE `auction_price_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,'Dom'),(2,'Elektronika'),(3,'Firma i Usługi'),(4,'Moda'),(5,'Motoryzacja'),(6,'Zdrowie'),(7,'Uroda'),(8,'Ogród'),(9,'Meble');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `categories_item`
--

LOCK TABLES `categories_item` WRITE;
/*!40000 ALTER TABLE `categories_item` DISABLE KEYS */;
INSERT INTO `categories_item` VALUES (2,1),(1,2),(2,2),(3,2),(4,3);
/*!40000 ALTER TABLE `categories_item` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `photos_item`
--

LOCK TABLES `photos_item` WRITE;
/*!40000 ALTER TABLE `photos_item` DISABLE KEYS */;
/*!40000 ALTER TABLE `photos_item` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'User1','U1','user1@user.com','123','888 888 888','2026-01-03 02:09:30'),(2,'User2','U2','user2@user.com','qwe','999 999 999','2026-01-03 02:09:30'),(3,'User3','U3','user3@user.com','123','000 000 000','2026-01-03 02:09:30');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-01-03  2:50:06
