-- -------------------------------------------------------------
-- TablePlus 6.1.6(570)
--
-- https://tableplus.com/
--
-- Database: postgres
-- Generation Time: 2024-09-23 21:17:18.6390
-- -------------------------------------------------------------


-- This script only contains the table creation statements and does not fully represent the table in the database. Do not use it as a backup.

DROP TYPE IF EXISTS "public"."status";
CREATE TYPE "public"."status" AS ENUM ('Pending', 'Approved', 'Rejected', 'Withdrawn', 'Withdraw Pending', 'Withdraw Rejected');
DROP TYPE IF EXISTS "public"."day_period";
CREATE TYPE "public"."day_period" AS ENUM ('AM', 'PM', 'FD');

-- Table Definition
CREATE TABLE IF NOT EXISTS "public"."Request" (
    "Request_ID" int8 NOT NULL,
    "Requestor_ID" int8 NOT NULL,
    "Approver_ID" int8 NOT NULL,
    "Status" "public"."status" NOT NULL,
    "Date_Requested" date NOT NULL,
    "Request_Batch" int8,
    "Date_Of_Request" date NOT NULL,
    "Duration" "public"."day_period" NOT NULL,
    CONSTRAINT "Request_Approver_ID_fkey" FOREIGN KEY ("Approver_ID") REFERENCES "public"."Employee"("Staff_ID"),
    CONSTRAINT "Request_Requestor_ID_fkey" FOREIGN KEY ("Requestor_ID") REFERENCES "public"."Employee"("Staff_ID"),
    PRIMARY KEY ("Request_ID")
);

-- Comments
COMMENT ON TABLE "public"."Request" IS 'Track all requests made by employees';

INSERT INTO "public"."Request" ("Request_ID", "Requestor_ID", "Approver_ID", "Status", "Date_Requested", "Request_Batch", "Date_Of_Request", "Duration") VALUES
(2, 140879, 140001, 'Approved', '2024-09-18', NULL, '2024-09-18', 'FD'),
(3, 150265, 151408, 'Pending', '2024-09-20', NULL, '2024-09-18', 'FD'),
(4, 130002, 130002, 'Withdrawn', '2024-09-17', NULL, '2024-09-18', 'PM'),
(5, 210044, 210001, 'Rejected', '2024-10-03', NULL, '2024-09-18', 'PM'),
(6, 160307, 160008, 'Withdraw Pending', '2024-09-03', NULL, '2024-09-18', 'FD'),
(7, 171029, 170166, 'Withdraw Rejected', '2024-08-15', NULL, '2024-09-18', 'FD'),
(8, 171009, 170166, 'Approved', '2024-09-25', NULL, '2024-09-18', 'FD'),
(9, 171014, 170166, 'Approved', '2024-09-24', NULL, '2024-09-18', 'PM'),
(10, 171018, 170166, 'Approved', '2024-09-26', NULL, '2024-09-18', 'PM'),
(11, 171029, 170166, 'Approved', '2024-09-27', NULL, '2024-09-18', 'AM'),
(12, 171029, 170166, 'Approved', '2024-09-25', NULL, '2024-09-18', 'FD'),
(13, 171029, 170166, 'Approved', '2024-09-23', NULL, '2024-09-18', 'PM');