-- -------------------------------------------------------------
-- TablePlus 6.1.6(570)
--
-- https://tableplus.com/
--
-- Database: dev_db
-- Generation Time: 2024-09-28 15:36:22.9150
-- -------------------------------------------------------------

-- DROP TABLE IF EXISTS "public"."Request" CASCADE;
-- This script only contains the table creation statements and does not fully represent the table in the database. Do not use it as a backup.

-- Sequence and defined type
-- CREATE SEQUENCE IF NOT EXISTS "Request_Request_ID_seq";

-- Table Definition
-- CREATE TABLE "public"."Request" (
--     "Request_ID" int8 NOT NULL DEFAULT nextval('"Request_Request_ID_seq"'::regclass),
--     "Requestor_ID" int8 NOT NULL,
--     "Approver_ID" int8 NOT NULL,
--     "Status" varchar(255) NOT NULL,
--     "Date_Requested" date NOT NULL,
--     "Request_Batch" int8,
--     "Date_Of_Request" date NOT NULL,
--     "Duration" varchar(255) NOT NULL,
--     "created_at" timestamp(0),
--     "updated_at" timestamp(0),
--     CONSTRAINT "request_requestor_id_foreign" FOREIGN KEY ("Requestor_ID") REFERENCES "public"."Employee"("Staff_ID"),
--     CONSTRAINT "request_approver_id_foreign" FOREIGN KEY ("Approver_ID") REFERENCES "public"."Employee"("Staff_ID"),
--     PRIMARY KEY ("Request_ID")
-- );

-- Comments
-- COMMENT ON TABLE "public"."Request" IS 'Track all requests made by employees';

INSERT INTO "public"."Request" ("Requestor_ID", "Approver_ID", "Status", "Date_Requested", "Request_Batch", "Date_Of_Request", "Duration", "created_at", "updated_at") VALUES
(140078, 140894, 'Pending', '2024-09-27', NULL, '2024-09-27', 'FD', '2024-09-27 02:37:59', '2024-09-27 02:37:59'),
(140879, 140001, 'Approved', '2024-09-18', NULL, '2024-09-18', 'FD', NULL, NULL),
(150265, 151408, 'Pending', '2024-09-20', NULL, '2024-09-18', 'FD', NULL, NULL),
(130002, 130002, 'Withdrawn', '2024-09-17', NULL, '2024-09-18', 'PM', NULL, NULL),
(210044, 210001, 'Rejected', '2024-10-03', NULL, '2024-09-18', 'PM', NULL, NULL),
(160307, 160008, 'Withdraw Pending', '2024-09-03', NULL, '2024-09-18', 'FD', NULL, NULL),
(171029, 170166, 'Withdraw Rejected', '2024-08-15', NULL, '2024-09-18', 'FD', NULL, NULL),
(171009, 170166, 'Approved', '2024-09-25', NULL, '2024-09-18', 'FD', NULL, NULL),
(171014, 170166, 'Approved', '2024-09-24', NULL, '2024-09-18', 'PM', NULL, NULL),
(171018, 170166, 'Approved', '2024-09-26', NULL, '2024-09-18', 'PM', NULL, NULL),
(171029, 170166, 'Approved', '2024-09-27', NULL, '2024-09-18', 'AM', NULL, NULL),
(171029, 170166, 'Approved', '2024-09-25', NULL, '2024-09-18', 'FD', NULL, NULL),
(171029, 170166, 'Approved', '2024-09-23', NULL, '2024-09-18', 'PM', NULL, NULL),
(150175, 151408, 'Pending', '2024-09-27', NULL, '2024-09-27', 'FD', '2024-09-27 02:45:49', '2024-09-27 02:45:49'),
(150168, 151408, 'Pending', '2024-09-27', NULL, '2024-09-27', 'FD', '2024-09-27 02:47:30', '2024-09-27 02:47:30');
