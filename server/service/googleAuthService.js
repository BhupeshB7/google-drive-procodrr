import { OAuth2Client } from "google-auth-library";
const clientId =
    "834134541338-mb3rt320qksotk5arhfma9hn0e9k3lka.apps.googleusercontent.com";
const client = new OAuth2Client({
    clientId,
});

export async function verifyGoogleIdToken(idToken) {
    const loginTicket = await client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
    });
    const userData = loginTicket.getPayload();
    return userData;
}
