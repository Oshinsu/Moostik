import { NextResponse } from "next/server";

// ============================================================================
// COMMUNITY GALLERY API
// ============================================================================

export async function GET() {
  try {
    // TODO: Implement real gallery fetching from Supabase
    // For now, return empty array as the feature is in development
    return NextResponse.json({
      items: [],
      total: 0,
      page: 1,
      pageSize: 24,
    });
  } catch (error) {
    console.error("Failed to fetch gallery:", error);
    return NextResponse.json(
      { error: "Failed to fetch gallery" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // TODO: Implement gallery submission
    // Validate user authentication
    // Upload image/video to storage
    // Create database entry

    return NextResponse.json({
      success: true,
      message: "Submission received - feature in development",
    });
  } catch (error) {
    console.error("Failed to submit to gallery:", error);
    return NextResponse.json(
      { error: "Failed to submit to gallery" },
      { status: 500 }
    );
  }
}
