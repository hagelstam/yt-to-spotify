declare namespace NodeJS {
  export interface ProcessEnv {
    PORT: number;
    NODE_ENV: "development" | "production";
    SERVER_URL: string;
    CLIENT_URL: string;
  }
}
