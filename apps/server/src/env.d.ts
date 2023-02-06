// eslint-disable-next-line no-unused-vars
declare namespace NodeJS {
  export interface ProcessEnv {
    PORT: number;
    NODE_ENV: "development" | "production";
  }
}
