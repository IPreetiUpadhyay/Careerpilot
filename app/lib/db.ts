import { Pool } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var careerPilotPool: Pool | undefined;
}

export function getDb() {
  if (!process.env.DATABASE_URL) return null;
  if (!global.careerPilotPool) {
    global.careerPilotPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_SSL === "false" ? false : { rejectUnauthorized: false },
    });
  }
  return global.careerPilotPool;
}

// Deployment validation: backend foundation.
