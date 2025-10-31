import { NextRequest, NextResponse } from "next/server";

const DIRECTUS_API_URL = process.env.DIRECTUS_URL;
const DIRECTUS_TOKEN = process.env.DIRECTUS_STATIC_TOKEN;

async function makeDirectusRequest(
  endpoint: string,
  options: RequestInit = {}
) {
  const url = `${DIRECTUS_API_URL}${endpoint}`;
  const headers = {
    "Content-Type": "application/json",
    ...(DIRECTUS_TOKEN && { Authorization: `Bearer ${DIRECTUS_TOKEN}` }),
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(
      `Directus API error: ${response.status} - ${response.statusText}`
    );
  }

  return response.json();
}

export async function POST(request: NextRequest) {
  try {
    const userData = await request.json();

    const response = await makeDirectusRequest("/items/b60_user", {
      method: "POST",
      body: JSON.stringify(userData),
    });

    return NextResponse.json({
      success: true,
      user: response.data,
    });
  } catch (error) {
    console.error("Create user error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to create user";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    const firebaseUid = searchParams.get("firebase_uid");
    const userId = searchParams.get("id");

    let endpoint = "/items/b60_user?limit=1";

    if (email) {
      endpoint += `&filter[email][_eq]=${encodeURIComponent(email)}`;
    } else if (firebaseUid) {
      endpoint += `&filter[firebase_uid][_eq]=${encodeURIComponent(
        firebaseUid
      )}`;
    } else if (userId) {
      endpoint = `/items/b60_user/${userId}`;
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "Email, firebase_uid, or id parameter required",
        },
        { status: 400 }
      );
    }

    const response = await makeDirectusRequest(endpoint);

    const user = userId ? response.data : response.data?.[0];

    return NextResponse.json({
      success: true,
      user: user || null,
    });
  } catch (error) {
    console.error("Get user error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to get user";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("id");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 }
      );
    }

    const updates = await request.json();

    const response = await makeDirectusRequest(`/items/b60_user/${userId}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    });

    return NextResponse.json({
      success: true,
      user: response.data,
    });
  } catch (error) {
    console.error("Update user error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to update user";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
