import { turnstileConfig } from "@/config/env";

export async function verifyTurnstile(token: string) {
  try {
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        // Cloudflare expects `secret` and `response`
        body: `secret=${turnstileConfig.secretKey}&response=${token}`,
      },
    );

    const data = await response.json();

    if (data.success) {
      return true;
    } else {
      console.warn("Turnstile verification failed:", data["error-codes"]);
      return false;
    }
  } catch (error) {
    console.error("Error verifying Turnstile:", error);
    return false;
  }
}
