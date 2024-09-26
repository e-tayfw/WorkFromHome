-- -------------------------------------------------------------
-- TablePlus 6.1.6(570)
--
-- https://tableplus.com/
--
-- Database: postgres
-- Generation Time: 2024-09-23 21:17:33.7770
-- -------------------------------------------------------------


-- This script only contains the table creation statements and does not fully represent the table in the database. Do not use it as a backup.

DROP TYPE IF EXISTS "public"."status";
CREATE TYPE "public"."status" AS ENUM ('Pending', 'Approved', 'Rejected', 'Withdrawn', 'Withdraw Pending', 'Withdraw Rejected');

-- Table Definition
CREATE TABLE "public"."RequestLog" (
    "Log_ID" int8 NOT NULL,
    "Requst_ID" int8 NOT NULL,
    "Previous_State" "public"."status" NOT NULL,
    "New_State" "public"."status" NOT NULL,
    "Employee_ID" int8 NOT NULL,
    "Date" date NOT NULL,
    "Remarks" varchar,
    CONSTRAINT "RequestLog_Requst_ID_fkey" FOREIGN KEY ("Requst_ID") REFERENCES "public"."Request"("Request_ID"),
    CONSTRAINT "RequestLog_Employee_ID_fkey" FOREIGN KEY ("Employee_ID") REFERENCES "public"."Employee"("Staff_ID"),
    PRIMARY KEY ("Log_ID")
);
