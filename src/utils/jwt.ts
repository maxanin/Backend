import { SignJWT, jwtVerify } from "jose";
const secret = new TextEncoder().encode(process.env.APP_JWT_SECRET!);

export async function signAppJwt(payload: object, exp = "7d") {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(exp)
    .sign(secret);
}

export async function verifyAppJwt(token: string) {
  const { payload } = await jwtVerify(token, secret);
  return payload;
}
