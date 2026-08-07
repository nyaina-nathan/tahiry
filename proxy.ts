import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./services/jwt.service";

const AUTH_ROUTES = ["/login", "/api/auth/login", "/api/auth/register", "/api/auth/validate-register", "/api/auth/logout"];

export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;

  const token = req.cookies.get("sess_id")?.value;

  const session = await verifyToken(token);

  if (AUTH_ROUTES.includes(path)) {
    if (session) {
      return NextResponse.redirect(new URL("/", req.nextUrl));
    }
    return NextResponse.next();
  }

  if (!session) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("X-User-ID", session.sub);

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
