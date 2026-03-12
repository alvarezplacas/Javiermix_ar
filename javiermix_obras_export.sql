/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-12.2.2-MariaDB, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: javiermix_obras
-- ------------------------------------------------------
-- Server version	12.2.2-MariaDB-ubu2404

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

--
-- Table structure for table `artwork_likes_tracking`
--

DROP TABLE IF EXISTS `artwork_likes_tracking`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `artwork_likes_tracking` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `artwork_filename` varchar(255) NOT NULL,
  `user_ip` varchar(100) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `artwork_likes_tracking`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `artwork_likes_tracking` WRITE;
/*!40000 ALTER TABLE `artwork_likes_tracking` DISABLE KEYS */;
/*!40000 ALTER TABLE `artwork_likes_tracking` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `artworks`
--

DROP TABLE IF EXISTS `artworks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `artworks` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `filename` varchar(255) NOT NULL,
  `serie_id` varchar(100) NOT NULL,
  `title` varchar(255) NOT NULL,
  `camera` varchar(100) DEFAULT NULL,
  `lens` varchar(100) DEFAULT NULL,
  `paper` varchar(100) DEFAULT NULL,
  `dimensions` varchar(100) DEFAULT NULL,
  `date` varchar(100) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `size_small` varchar(50) DEFAULT NULL,
  `precio_small` decimal(10,2) DEFAULT NULL,
  `size_medium` varchar(50) DEFAULT NULL,
  `precio_medium` decimal(10,2) DEFAULT NULL,
  `size_large` varchar(50) DEFAULT NULL,
  `precio_large` decimal(10,2) DEFAULT NULL,
  `stock` int(11) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `likes` int(11) DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=47 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `artworks`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `artworks` WRITE;
/*!40000 ALTER TABLE `artworks` DISABLE KEYS */;
INSERT INTO `artworks` VALUES
(2,'JMX_9177.avif','rostros_de_metal','El CapitÃ¡n','Nikon D5600','80mm',NULL,'115 x 70 cm','22/2/2026','Una pieza que captura la esencia del metal y el tiempo.','20 x 30 cm',255.00,'30 x 45 cm',390.00,'40x60 cm',550.00,1,'2026-03-03 01:31:07',0),
(3,'JMX_9135.avif','rostros_de_metal','Royal','Nikon D5600','50mm',NULL,'90 x 60 cm','14/2/2026','Elegancia mecÃ¡nica en estado puro.','20 x 30 cm',255.00,'30 x 45 cm',390.00,'40x60 cm',550.00,1,'2026-03-03 01:31:07',0),
(4,'JMX_9316.avif','rostros_de_metal','El Mundo Esta Loco','Nikon D5600','35mm',NULL,'N/A','5/2/2026','Este rostro carmesÃ­ no es solo el primer diseÃ±o de Ford tras la guerra; es el testigo del momento exacto en que la paz se convirtiÃ³ en codicia. En la ficciÃ³n, un ejemplar idÃ©ntico fue el encargado de despeÃ±ar la cordura, iniciando la carrera mÃ¡s absurda por la ambiciÃ³n humana.\n\nAquÃ­, el metal encarna esa \'fricciÃ³n del mundo\' que mencionamos antes: un brillo que sobrevive al caos de quienes corren desesperados por un tesoro inexistente, mientras el acero permanece impasible, observando cÃ³mo la humanidad se deshace en su propia urgencia','20 x 30 cm',255.00,'30 x 45 cm',390.00,'40x60 cm',550.00,1,'2026-03-03 01:31:07',0),
(5,'JMX_9371.avif','rostros_de_metal','Bigote','Nikon D5600','35mm',NULL,'N/A','5/2/2026',NULL,'20 x 30 cm',255.00,'30 x 45 cm',390.00,'40x60 cm',550.00,1,'2026-03-03 01:31:07',0),
(6,'JMX_9180.avif','rostros_de_metal','JMX 9180','Nikon D5600','35mm',NULL,'N/A','5/2/2026',NULL,'20 x 30 cm',255.00,'30 x 45 cm',390.00,'40x60 cm',550.00,1,'2026-03-03 01:31:07',0),
(7,'JMX_9309.avif','rostros_de_metal','JMX 9309','Nikon D5600','35mm',NULL,'N/A','5/2/2026',NULL,'20 x 30 cm',255.00,'30 x 45 cm',390.00,'40x60 cm',550.00,1,'2026-03-03 01:31:07',0),
(8,'JMX_9302.avif','rostros_de_metal','Musculo','Nikon D5600','35mm',NULL,'N/A','7/2/2026',NULL,'20 x 30 cm',255.00,'30 x 45 cm',390.00,'40x60 cm',550.00,1,'2026-03-03 01:31:07',0),
(9,'9176.avif','rostros_de_metal','9176','Nikon D5600','35mm',NULL,'N/A','14/2/2026',NULL,'20 x 30 cm',255.00,'30 x 45 cm',390.00,'40x60 cm',550.00,1,'2026-03-03 01:31:07',0),
(10,'JMX_9136.avif','rostros_de_metal','JMX 9136','Nikon D5600','35mm',NULL,'N/A','14/2/2026',NULL,'20 x 30 cm',255.00,'30 x 45 cm',390.00,'40x60 cm',550.00,1,'2026-03-03 01:31:07',0),
(11,'9383.avif','rostros_de_metal','9383','Nikon D5600','35mm',NULL,'N/A','12/2/2026',NULL,'20 x 30 cm',255.00,'30 x 45 cm',390.00,'40x60 cm',550.00,1,'2026-03-03 01:31:07',0),
(12,'9207.avif','rostros_de_metal','9207','Nikon D5600','35mm',NULL,'N/A','12/2/2026',NULL,'20 x 30 cm',255.00,'30 x 45 cm',390.00,'40x60 cm',550.00,1,'2026-03-03 01:31:07',0),
(13,'9230.avif','rostros_de_metal','9230','Nikon D5600','35mm',NULL,'N/A','12/2/2026',NULL,'20 x 30 cm',255.00,'30 x 45 cm',390.00,'40x60 cm',550.00,1,'2026-03-03 01:31:07',0),
(14,'9140.avif','rostros_de_metal','9140','Nikon D5600','35mm',NULL,'N/A','12/2/2026',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-03-03 01:31:07',0),
(15,'9312.avif','rostros_de_metal','9312','Nikon D5600','35mm',NULL,'N/A','12/2/2026',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-03-03 01:31:07',0),
(16,'9206.avif','rostros_de_metal','9206','Nikon D5600','35mm',NULL,'N/A','13/2/2026',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-03-03 01:31:07',0),
(17,'JMX_9230.avif','rostros_de_metal','Ford A','Nikon D5600','35mm',NULL,'N/A','12/2/2026',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-03-03 01:31:07',0),
(18,'JMX_9312.avif','rostros_de_metal','Toro','Nikon D5600','35mm',NULL,'N/A','12/2/2026',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-03-03 01:31:07',0),
(19,'JMX_9331.avif','rostros_de_metal','T-9','Nikon D5600','35mm',NULL,'N/A','12/2/2026',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-03-03 01:31:07',0),
(20,'JMX_9354.avif','rostros_de_metal','El MontaÃ±Ã©s','Nikon D5600','35mm',NULL,'N/A','12/2/2026','El TA-05 \"El MontaÃ±Ã©s\", veterano de los cielos polares, custodia desde las alturas la silueta clÃ¡sica de la ingenierÃ­a automotriz de posguerra. Una fotografÃ­a que documenta la identidad mecÃ¡nica de una Ã©poca donde la robustez era el lenguaje de la elegancia',NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-03-03 01:31:07',0),
(21,'JMX_9383.avif','rostros_de_metal','JMX 9383','Nikon D5600','35mm',NULL,'N/A','12/2/2026',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-03-03 01:31:07',0),
(22,'JMX_9176.avif','rostros_de_metal','Jailbar','Nikon D5600','35mm',NULL,'N/A','12/2/2026',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-03-03 01:31:07',0),
(23,'JMX_9140.avif','rostros_de_metal','Mapache','Nikon D5600','35mm',NULL,'N/A','12/2/2026',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-03-03 01:31:07',0),
(25,'JMX_9206.avif','rostros_de_metal','JMX 9206','Nikon D5600','35mm',NULL,'N/A','12/2/2026',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-03-03 01:31:07',0),
(26,'JMX_9207.avif','rostros_de_metal','JMX 9207','Nikon D5600','35mm',NULL,'N/A','12/2/2026',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-03-03 01:31:07',0),
(27,'9139.avif','rostros_de_metal','9139','Nikon D5600','35mm',NULL,'N/A','22/2/2026',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-03-03 01:31:07',0),
(28,'9174.avif','rostros_de_metal','9174','Nikon D5600','35mm',NULL,'N/A','22/2/2026',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-03-03 01:31:07',0),
(29,'JMX_9139.avif','rostros_de_metal','JMX 9139','Nikon D5600','35mm',NULL,'N/A','22/2/2026',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-03-03 01:31:07',0),
(30,'JMX_9174.avif','rostros_de_metal','JMX 9174','Nikon D5600','35mm',NULL,'N/A','22/2/2026',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-03-03 01:31:07',0),
(31,'GeneralBelgranoBSAS_931.avif','monumentos','GeneralBelgranoBSAS 931','Nikon D5600','35mm',NULL,'N/A','10/2/2026',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-03-03 01:31:07',0),
(32,'ambiente.avif','monumentos','ambiente','Nikon D5600','35mm',NULL,'N/A','10/2/2026',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-03-03 01:31:07',0),
(33,'JMX_0095.avif','monumentos','JMX 0095','Nikon D5600','35mm',NULL,'N/A','25/2/2026',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-03-03 01:31:07',0),
(34,'GeneralBelgranoBSAS_895.avif','epidermis_urbana','GeneralBelgranoBSAS 895','Nikon D5600','35mm',NULL,'N/A','22/2/2026',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-03-03 01:31:07',0),
(35,'04.avif','epidermis_urbana','4','Nikon D5600','35mm',NULL,'N/A','14/2/2026',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-03-03 01:31:07',0),
(36,'890.avif','epidermis_urbana','890','Nikon D5600','35mm',NULL,'N/A','22/2/2026',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-03-03 01:31:07',0),
(37,'GeneralBelgranoBSAS_886.avif','epidermis_urbana','GeneralBelgranoBSAS 886','Nikon D5600','35mm',NULL,'N/A','22/2/2026',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-03-03 01:31:07',0),
(38,'GeneralBelgranoBSAS_887.avif','epidermis_urbana','GeneralBelgranoBSAS 887','Nikon D5600','35mm',NULL,'N/A','22/2/2026',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-03-03 01:31:07',0),
(39,'GeneralBelgranoBSAS_890.avif','epidermis_urbana','GeneralBelgranoBSAS 890','Nikon D5600','35mm',NULL,'N/A','22/2/2026',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-03-03 01:31:07',0),
(40,'886.avif','epidermis_urbana','886','Nikon D5600','35mm',NULL,'N/A','22/2/2026',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-03-03 01:31:07',0),
(41,'895.avif','epidermis_urbana','895','Nikon D5600','35mm',NULL,'N/A','22/2/2026',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-03-03 01:31:07',0),
(42,'V890.avif','epidermis_urbana','V890','Nikon D5600','35mm',NULL,'N/A','22/2/2026',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-03-03 01:31:07',0),
(43,'887.avif','epidermis_urbana','887','Nikon D5600','35mm',NULL,'N/A','22/2/2026',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-03-03 01:31:07',0),
(44,'885.avif','epidermis_urbana','885','Nikon D5600','35mm',NULL,'N/A','22/2/2026',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-03-03 01:31:07',0),
(45,'El muro_04.avif','epidermis_urbana','El muro 04','Nikon D5600','35mm',NULL,'N/A','14/2/2026',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-03-03 01:31:07',0),
(46,'JMX_8001','Estructuras','Trascender',NULL,NULL,NULL,NULL,NULL,'Â¿QuÃ© queda de un hombre cuando su apellido se vuelve un logotipo? Esta pieza de la serie urbana de Javier Mix documenta la domesticaciÃ³n de lo salvaje. El \"10\" ya no es una posiciÃ³n en el campo, sino un Ã­ndice de mercado. Entre paredes de jardÃ­n vertical y transeÃºntes anÃ³nimos, la imagen cuestiona si la verdadera trascendencia es permanecer en la memoria colectiva o terminar decorando la estÃ©tica estÃ©ril del consumo moderno.','20 x 30 cm',250.00,'30 x 45 cm',350.00,NULL,550.00,1,'2026-03-03 02:12:17',0);
/*!40000 ALTER TABLE `artworks` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `certificates`
--

DROP TABLE IF EXISTS `certificates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `certificates` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(36) NOT NULL,
  `artwork_id` bigint(20) unsigned NOT NULL,
  `collector_id` bigint(20) unsigned NOT NULL,
  `sale_date` timestamp NULL DEFAULT current_timestamp(),
  `sale_price` decimal(10,2) NOT NULL,
  `dimensions` varchar(100) NOT NULL,
  `edition_number` varchar(20) DEFAULT NULL,
  `is_verified` int(11) DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `certificates_uuid_unique` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `certificates`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `certificates` WRITE;
/*!40000 ALTER TABLE `certificates` DISABLE KEYS */;
/*!40000 ALTER TABLE `certificates` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `collectors`
--

DROP TABLE IF EXISTS `collectors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `collectors` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `instagram` varchar(100) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `status` varchar(50) DEFAULT 'lead',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `collectors_email_unique` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `collectors`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `collectors` WRITE;
/*!40000 ALTER TABLE `collectors` DISABLE KEYS */;
/*!40000 ALTER TABLE `collectors` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `magazine`
--

DROP TABLE IF EXISTS `magazine`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `magazine` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `slug` varchar(255) NOT NULL,
  `title` varchar(255) NOT NULL,
  `content_html` mediumtext NOT NULL,
  `featured_image` varchar(255) DEFAULT NULL,
  `video_url` varchar(255) DEFAULT NULL,
  `media_json` text DEFAULT NULL,
  `tags` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `rating_total` int(11) DEFAULT 0,
  `rating_count` int(11) DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `magazine_slug_unique` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `magazine`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `magazine` WRITE;
/*!40000 ALTER TABLE `magazine` DISABLE KEYS */;
INSERT INTO `magazine` VALUES
(1,'cartografo-de-lo-invisible','CartÃ³grafo de lo invisible','<p><strong style=\"color: rgb(255, 255, 255);\">PinÃ©lides AristÃ³bulo Fusco</strong>&nbsp;(1913-1991) no fue un fotÃ³grafo comÃºn, empezando por su nombre, fruto de un error burocrÃ¡tico en su partida de nacimiento. Para su familia era â€œPinuchoâ€, pero para Juan Domingo PerÃ³n terminÃ³ siendo&nbsp;<strong style=\"color: rgb(255, 255, 255);\">â€œFusquitoâ€</strong>, el hombre que logrÃ³ despojar al poder de su rigidez para retratar su humanidad.</p><p><strong style=\"color: rgb(255, 255, 255);\">Llegando al Negativo</strong></p><p>Antes de ser el fotÃ³grafo del peronismo, Fusco fue un hombre de letras. Fue compaÃ±ero de secundaria de&nbsp;<strong style=\"color: rgb(255, 255, 255);\">Julio CortÃ¡zar</strong>&nbsp;en el Mariano Acosta y ejerciÃ³ como maestro de grado en La Boca, su docencia comenzÃ³ a los 17 aÃ±os.</p><p>Fusco era tambiÃ©n profesor de piano y cursÃ³ estudios de artes plÃ¡sticas en la AsociaciÃ³n EstÃ­mulo Bellas Artes. Fue un gran lector tanto de historia y filosofÃ­a como de ficciÃ³n y poesÃ­a.</p><p>Su carrera en los medios comenzÃ³ con una veta humorÃ­stica y tÃ©cnica en la revista&nbsp;<strong style=\"color: rgb(255, 255, 255);\">â€œRico Tipoâ€</strong>, donde creÃ³ la secciÃ³n â€œA primera vistaâ€, utilizando la fotografÃ­a como una herramienta de vanguardia para el humor.</p><p><strong style=\"color: rgb(255, 255, 255);\">El Encuentro que CambiÃ³ la Historia</strong></p><p>Su ingreso al mundo oficial fue casi fortuito. En 1948, mientras tomaba fotos en Plaza de Mayo, fue abordado por un enviado de&nbsp;<strong style=\"color: rgb(255, 255, 255);\">RaÃºl Apold</strong>&nbsp;(Secretario de DifusiÃ³n), quien quedÃ³ impresionado por su mirada. A partir de allÃ­, se integrÃ³ a la SubsecretarÃ­a de Informaciones, donde documentarÃ­a:</p><ul><li><strong style=\"color: rgb(255, 255, 255);\">La mÃ­stica peronista:</strong>&nbsp;CapturÃ³ el icÃ³nico abrazo entre Evita y PerÃ³n en el balcÃ³n de la Rosada el 17 de octubre de 1951.</li><li><strong style=\"color: rgb(255, 255, 255);\">La intimidad en San Vicente:</strong>&nbsp;Es el autor de la famosa serie de&nbsp;<strong style=\"color: rgb(255, 255, 255);\">Eva PerÃ³n con el pelo suelto</strong>, una imagen que dÃ©cadas despuÃ©s se convertirÃ­a en un Ã­cono de la militancia.</li><li><strong style=\"color: rgb(255, 255, 255);\">La obra pÃºblica:</strong>&nbsp;DocumentÃ³ la construcciÃ³n de barrios, hoteles y gasoductos, aplicando su especialidad en la fotografÃ­a aÃ©rea.</li></ul><hr class=\"editorial-divider wp-block-separator has-alpha-channel-opacity\"><p><strong style=\"color: rgb(255, 255, 255);\">El Artista de Vanguardia</strong></p><p>Fusco nunca dejÃ³ que el reportero grÃ¡fico asfixiara al artista. Fue un pilar fundamental en la modernizaciÃ³n de la estÃ©tica fotogrÃ¡fica argentina a travÃ©s de dos grupos clave:</p><ol><li><strong style=\"color: rgb(255, 255, 255);\">La Carpeta de los Diez (1952):</strong>&nbsp;Fue el Ãºnico argentino en este grupo de fotÃ³grafos europeos (como Annemarie Heinrich y Anatole Saderman) que buscaban elevar la fotografÃ­a al nivel del arte puro, rompiendo con la tradiciÃ³n de los fotoclubs.</li><li><strong style=\"color: rgb(255, 255, 255);\">Grupo Forum (1956):</strong>&nbsp;Tras la caÃ­da del peronismo, continuÃ³ explorando la â€œfotografÃ­a subjetivaâ€ con una clara influencia de la&nbsp;<strong style=\"color: rgb(255, 255, 255);\">Bauhaus</strong>&nbsp;y la â€œNueva VisiÃ³nâ€.</li></ol><hr class=\"editorial-divider wp-block-separator has-alpha-channel-opacity\"><p><strong style=\"color: rgb(255, 255, 255);\">PersecuciÃ³n y Resiliencia</strong></p><p>Tras el golpe de Estado de 1955, Fusco sufriÃ³ la censura y la persecuciÃ³n. Fue dejado cesante de su cargo docente y acusado falsamente de â€œpornografÃ­aâ€ por sus experimentos tÃ©cnicos con pelÃ­cula infrarroja.</p><p>Para salvar su obra del odio polÃ­tico, tuvo que&nbsp;<strong style=\"color: rgb(255, 255, 255);\">esconder sus negativos</strong>&nbsp;en una curtiembre en Nueva Pompeya, donde permanecieron ocultos durante dÃ©cadas, producto de la proscripciÃ³n al peronismo y la prohibiciÃ³n de cualquier imagen relacionada al expresidente. El archivo fue recuperado por sus familiares casi cuarenta aÃ±os despuÃ©s.</p><p><strong style=\"color: rgb(255, 255, 255);\">Su Legado Final</strong></p><p>El aporte que hizo Fusco para la construcciÃ³n del imaginario peronista fue central. Algunas de sus coberturas fueron el registro de la llegada de inmigrantes alentada por el gobierno nacional, la construcciÃ³n de la obra pÃºblica que se llevÃ³ adelante en el perÃ­odo y el retrato del mundo del trabajo.</p><p>Aquejado por el mal de Parkinson en sus Ãºltimos aÃ±os, Fusco falleciÃ³ en 1991. PasÃ³ dÃ©cadas sin recibir el crÃ©dito correspondiente por imÃ¡genes que ya eran propiedad del imaginario colectivo argentino. Hoy, su obra se reconoce no solo por su valor documental, sino por su&nbsp;<strong style=\"color: rgb(255, 255, 255);\">integridad tÃ©cnica y artÃ­stica</strong>.</p><p>La trayectoria de PinÃ©lides Fusco â€”desde las aulas junto a CortÃ¡zar hasta los pasillos del poder y el exilio interno de sus negativos ocultos en una curtiembreâ€” posee la Ã©pica de un guion cinematogrÃ¡fico. Es la crÃ³nica de una vida que, como sus mejores placas, esperÃ³ dÃ©cadas en la oscuridad para finalmente revelarnos su verdadera e inabarcable dimensiÃ³n humana.</p><hr class=\"editorial-divider wp-block-separator has-alpha-channel-opacity is-style-dots ql-align-center\"><p><strong>AnÃ¡lisis Curatorial: La Subjetividad como Acto de Resistencia</strong></p><p>Para entender a PinÃ©lides Fusco, hay que mirar mÃ¡s allÃ¡ del documento histÃ³rico; hay que observar la trayectoria y su lucha con las clases dominantes, asÃ­ como entendemos a CortÃ¡zar entendemos al fotÃ³grafo.</p><h3>1. El Encuadre que Rompe el Protocolo</h3><p>Fusco operaba bajo una premisa que hoy es vital para cualquier fotÃ³grafo de autor:&nbsp;<strong style=\"color: rgb(255, 255, 255);\">la fotografÃ­a es una forma de inteligencia</strong>.</p><ul><li><strong style=\"color: rgb(255, 255, 255);\">La Intimidad Despojada:</strong>&nbsp;En su sesiÃ³n de San Vicente (1948), Fusco comete su primera â€œrebeldÃ­aâ€ estÃ©tica al pedirle a Eva PerÃ³n que se suelte el pelo, eliminando las marcas del poder para capturar una vulnerabilidad absoluta.</li><li><strong style=\"color: rgb(255, 255, 255);\">El Reencuadre CrÃ­tico:</strong>&nbsp;Su famosa foto del â€œabrazoâ€ en el balcÃ³n no fue una casualidad; fue una decisiÃ³n de laboratorio. El â€œtijeretazoâ€ que le dio al negativo original para reencuadrar la escena demuestra que para Ã©l, la verdad de la imagen estaba en la emociÃ³n y no en la totalidad del registro oficial.</li></ul><p><br></p><p><strong>La TÃ©cnica al Servicio de la VisiÃ³n (Speed Graphic)</strong></p><p>Como bien sabÃ©s, manejar una&nbsp;<a href=\"https://javiermix.ar/revista/la-ultima-camara-estadounidense/\" rel=\"noopener noreferrer\" target=\"_blank\" style=\"color: inherit;\"><strong>Speed Graphic</strong></a><strong style=\"color: rgb(255, 255, 255);\">&nbsp;4Ã—5â€³</strong>&nbsp;en los aÃ±os 40 era un ejercicio de lentitud y precisiÃ³n.</p><ul><li><strong style=\"color: rgb(255, 255, 255);\">El Disparo Ãšnico:</strong>&nbsp;Fusco solo cargaba doce placas en su bolso. Esa limitaciÃ³n tÃ©cnica lo obligaba a una&nbsp;<strong style=\"color: rgb(255, 255, 255);\">economÃ­a de la mirada</strong>: no podÃ­a haber disparos en falso.</li><li><strong style=\"color: rgb(255, 255, 255);\">La EstÃ©tica de la â€œNueva VisiÃ³nâ€:</strong>&nbsp;A travÃ©s del Grupo Forum y la Carpeta de los Diez, Fusco introdujo en Argentina una estÃ©tica de vanguardia influenciada por la&nbsp;<strong style=\"color: rgb(255, 255, 255);\">Bauhaus</strong>. Buscaba que la fotografÃ­a dejara de ser un mero documento para convertirse en una obra de creaciÃ³n, manejando la luz en gradaciones sutiles que daban jerarquÃ­a plÃ¡stica a lo cotidiano.</li></ul><p><strong style=\"color: rgb(255, 255, 255);\">ReflexiÃ³n :</strong>&nbsp;PinÃ©lides Fusco nos enseÃ±a que el fotÃ³grafo no es un espectador pasivo, sino un cartÃ³grafo de lo invisible. Su legado no son solo son obras fotogrÃ¡ficas, su legado es la construcciÃ³n de un sentimiento de una emociÃ³n y en esa lucha sostener una posiciÃ³n con muchas ideas, pensando el futuro y en su obra.</p><div class=\"ql-clipboard\" contenteditable=\"true\" tabindex=\"-1\"></div><div class=\"ql-tooltip ql-hidden\"><a class=\"ql-preview\" rel=\"noopener noreferrer\" target=\"_blank\" href=\"about:blank\"></a><input type=\"text\" data-formula=\"e=mc^2\" data-link=\"https://quilljs.com\" data-video=\"Embed URL\"><a class=\"ql-action\"></a><a class=\"ql-remove\"></a></div>','/uploads/magazine/1772504607512-https___s3.amazonaws.com_arc-wordpress-client-uploads_infobae-wp_wp-content_uploads_2017_07_29004455_Peron-y-Evita-HD-11.avif',NULL,'[\n  {\n    \"type\": \"image\",\n    \"src\": \"/uploads/magazine/1772504607279-7086b_master.avif\",\n    \"caption\": \"\"\n  },\n  {\n    \"type\": \"image\",\n    \"src\": \"/uploads/magazine/1772504607293-fotonoticia_20170701085340_1200-2565876285.avif\",\n    \"caption\": \"\"\n  },\n  {\n    \"type\": \"image\",\n    \"src\": \"/uploads/magazine/1772504607303-fotonoticia_20171008071503_1200-380797878.avif\",\n    \"caption\": \"\"\n  },\n  {\n    \"type\": \"image\",\n    \"src\": \"/uploads/magazine/1772504607312-evita_y_pern_127936-1987194250.avif\",\n    \"caption\": \"\"\n  },\n  {\n    \"type\": \"image\",\n    \"src\": \"/uploads/magazine/1772504607337-GettyImages-613514258-5ac9b3943037130037ae79bf-2261209830.avif\",\n    \"caption\": \"\"\n  },\n  {\n    \"type\": \"image\",\n    \"src\": \"/uploads/magazine/1772504607325-eva-peron-2093914570.avif\",\n    \"caption\": \"\"\n  },\n  {\n    \"type\": \"image\",\n    \"src\": \"/uploads/magazine/1772504607469-peron_evita_polext110-1024x1000-3900659840.avif\",\n    \"caption\": \"\"\n  },\n  {\n    \"type\": \"image\",\n    \"src\": \"/uploads/magazine/1772504607483-vamos_a_celebrar_el_8_de_marzo____13883535.avif\",\n    \"caption\": \"\"\n  },\n  {\n    \"type\": \"image\",\n    \"src\": \"/uploads/magazine/1772504607494-Peron-56a58abb5f9b58b7d0dd4d53-286386839.avif\",\n    \"caption\": \"\"\n  },\n  {\n    \"type\": \"image\",\n    \"src\": \"/uploads/magazine/1772504607512-https___s3.amazonaws.com_arc-wordpress-client-uploads_infobae-wp_wp-content_uploads_2017_07_29004455_Peron-y-Evita-HD-11.avif\",\n    \"caption\": \"\"\n  }\n]','Historia','2026-03-03 02:25:09',0,0);
/*!40000 ALTER TABLE `magazine` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `magazine_ratings_tracking`
--

DROP TABLE IF EXISTS `magazine_ratings_tracking`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `magazine_ratings_tracking` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `article_slug` varchar(255) NOT NULL,
  `user_ip` varchar(100) NOT NULL,
  `score` int(11) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `magazine_ratings_tracking`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `magazine_ratings_tracking` WRITE;
/*!40000 ALTER TABLE `magazine_ratings_tracking` DISABLE KEYS */;
/*!40000 ALTER TABLE `magazine_ratings_tracking` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `marketing_strategies`
--

DROP TABLE IF EXISTS `marketing_strategies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `marketing_strategies` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `category` varchar(50) NOT NULL,
  `description` text DEFAULT NULL,
  `status` varchar(20) DEFAULT 'pending',
  `priority` varchar(20) DEFAULT 'medium',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `marketing_strategies`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `marketing_strategies` WRITE;
/*!40000 ALTER TABLE `marketing_strategies` DISABLE KEYS */;
INSERT INTO `marketing_strategies` VALUES
(1,'Dominio de Video Corto (Reels/TikTok)','social','Crear 3 videos semanales mostrando procesos de obra, montaje en sala y detalles de papel. Priorizar autenticidad sobre perfecciÃ³n.','pending','high','2026-03-02 04:16:52'),
(2,'OptimizaciÃ³n SEO de ImÃ¡genes','seo','Renombrar todos los archivos de imagen con palabras clave y aÃ±adir Alt Text descriptivo para bÃºsqueda orgÃ¡nica en Google.','in_progress','high','2026-03-02 04:16:52'),
(3,'Networking y Alianzas Locales','local','Contactar con estudios de interiorismo en Buenos Aires para proponer las obras como piezas centrales de proyectos.','pending','medium','2026-03-02 04:16:52'),
(4,'Comunidad y Respuesta Activa','social','Responder a todos los comentarios y mensajes en menos de 4 horas para fomentar el algoritmo de compromiso.','active','high','2026-03-02 04:16:52'),
(5,'Programa de Referidos para Coleccionistas','editorial','Ofrecer beneficios exclusivos a coleccionistas existentes que refieran nuevos compradores de obras.','pending','medium','2026-03-02 04:16:52'),
(6,'OptimizaciÃ³n para Motores de Respuesta (AI)','seo','Estructurar el contenido de la revista con preguntas frecuentes para aparecer en resÃºmenes de IA (Google AI Overviews).','pending','low','2026-03-02 04:16:52');
/*!40000 ALTER TABLE `marketing_strategies` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-03-04 21:58:31
