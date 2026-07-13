import crypto from "crypto";

//#region Generate Device Fingerprint
export function generateDeviceFingerprint(request: any): string {
    const userAgent = request.headers['user-agent'] || '';
    const ipAddress = request.ip || '';
    const access = request.headers['access'] || '';

    const raw =  `${userAgent}|${ipAddress}|${access}`;
    return crypto.createHash('sha256').update(raw).digest('hex');
}
//#endregion
