import { FastifyInstance } from "fastify";
import crypto from "crypto";

//#region Generate Access Token
export function generateAccessToken(
    app: FastifyInstance,
    payload: {
        id: string;
        email: string;
        role: string;
        deviceId: string;
    }
) {
    console.log("app.jwt:", app.jwt);
    return app.jwt.sign({
        sub: payload.id,
        email: payload.email,
        role: payload.role,
        deviceId: payload.deviceId,
    });
}
//#endregion

//#region Generate Refresh Token
export function generateRefreshToken(
    app: FastifyInstance,
    payload: {
        deviceId: string;
        userId: string;
    }
) {
    return app.jwt.sign(
        {
            deviceId: payload.deviceId,
            userId: payload.userId,
            jti: crypto.randomUUID(),
        },
        {
            key: process.env.JWT_REFRESH_SECRET,
            expiresIn: process.env.JWT_REFRESH_EXPIRES,
        }
    );
}
//#endregion


//#region Verify Access Token
export async function verifyAccessToken(
    app: FastifyInstance,
    token: string
) {
    const decoded = await app.jwt.verify<{
        sub: string;
        email: string;
        role: string;
        deviceId: string;
    }>(token);

    return decoded;
}
//#endregion

//#region Verify Refresh Token
export async function verifyRefreshToken(
    app: FastifyInstance,
    token: string
) {
    const decoded = await app.jwt.verify<{
        deviceId: string;
        userId: string;
        jti: string;
    }>(token, {
        key: process.env.JWT_REFRESH_SECRET,
    });

    return decoded;
}
//#endregion



