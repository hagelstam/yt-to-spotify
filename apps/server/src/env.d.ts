declare namespace NodeJS {
  export interface ProcessEnv {
    PORT: number;
    NODE_ENV: "development" | "production";
  }
}

declare namespace Express {
  export interface Request {
    id: string;
  }
}
