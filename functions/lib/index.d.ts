import * as admin from 'firebase-admin';
declare global {
    namespace Express {
        interface Request {
            user?: admin.auth.DecodedIdToken;
        }
    }
}
export declare const api: import("firebase-functions/v2/https").HttpsFunction;
export declare const seedDatabase: import("firebase-functions/v2/https").CallableFunction<any, Promise<{
    success: boolean;
    message: string;
}>, unknown>;
