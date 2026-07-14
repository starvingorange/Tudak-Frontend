import ky from "ky";

export const http = ky.create({
  prefix: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10_000,
});
