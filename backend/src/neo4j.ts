import neo4j from "neo4j-driver";
import { config } from "dotenv";

config();

export const driver = neo4j.driver(
    process.env.URL || "",
    neo4j.auth.basic(process.env.USERNAME || "", process.env.PASSWORD || "")
);