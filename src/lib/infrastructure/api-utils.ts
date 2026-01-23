import { NextResponse } from "next/server";
import { ZodError, type z } from "zod";

export function errorResponse(message: string, status: number = 500) {
  return NextResponse.json({ error: message }, { status });
}

export function successResponse<T>(data: T, status: number = 200) {
  return NextResponse.json(data, { status });
}

export function handleApiError(
  error: unknown,
  operation: string,
): NextResponse {
  console.error(`[API Error] ${operation}:`, error);

  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: "Validation failed",
        details: error.issues.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        })),
      },
      { status: 400 },
    );
  }

  if (error instanceof Error) {
    if (error.message.includes("UNIQUE constraint")) {
      return errorResponse("A record with this value already exists", 409);
    }
    if (error.message.includes("FOREIGN KEY constraint")) {
      return errorResponse("Referenced record does not exist", 400);
    }
    if (error.message.includes("NOT NULL constraint")) {
      return errorResponse("Required field is missing", 400);
    }
  }

  return errorResponse(`Failed to ${operation}`, 500);
}

export function withErrorHandling(
  handler: () => NextResponse | Promise<NextResponse>,
  operation: string,
): Promise<NextResponse> {
  return Promise.resolve(handler()).catch((error) =>
    handleApiError(error, operation),
  );
}

export function parseQueryParams<T>(url: string, schema: z.ZodSchema<T>): T {
  const { searchParams } = new URL(url);
  const params = Object.fromEntries(searchParams.entries());
  return schema.parse(params);
}

export async function parseRequestBody<T>(
  request: Request,
  schema: z.ZodSchema<T>,
): Promise<T> {
  const body = await request.json();
  return schema.parse(body);
}
