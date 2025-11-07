import { NextResponse } from "next/server";

export async function GET() {
  const API_KEY = process.env.NEXT_PUBLIC_EXCHANGERATE_API_KEY;
  const BASE_URL = process.env.NEXT_PUBLIC_EXCHANGERATE_API_URL;
  // If API config is missing, return a sensible fallback so the dev server
  // doesn't crash and pages depending on exchange rate can still render.
  const missing =
    !BASE_URL || !API_KEY ||
    String(BASE_URL).trim().toLowerCase() === "undefined" ||
    String(API_KEY).trim().toLowerCase() === "undefined";

  if (missing) {
    console.warn("Exchange rate API config missing; returning fallback rates");
    return NextResponse.json(
      {
        source: "fallback",
        rates: {
          // default FX values used elsewhere in the app (EGP per KWD etc.)
          EGP: 23.5,
          KWD: 0.034,
        },
      },
      { status: 200 }
    );
  }

  try {
    const response = await fetch(
      `${BASE_URL}/live?access_key=${API_KEY}&currencies=EGP,KWD&source=USD`,
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Exchange rate fetch error:", error);
    // Return fallback on error so UI can continue to render in dev
    return NextResponse.json(
      {
        source: "error-fallback",
        rates: {
          EGP: 23.5,
          KWD: 0.034,
        },
      },
      { status: 200 }
    );
  }
}
