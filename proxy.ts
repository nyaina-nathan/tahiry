import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./services/jwt.service";

const PUBLIC_PAGE_ROUTES = ["/", "/password-change", "/robots.txt"];

export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;

  if (PUBLIC_PAGE_ROUTES.includes(path)) {
    return NextResponse.next();
  }

  if (
    path === "/login" &&
    req.nextUrl.searchParams.get("isPasswordResetFail") === "true"
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get("sess_id")?.value;

  const session = await verifyToken(token);

  if (path === "/login") {
    if (session) {
      return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
    }
    return NextResponse.next();
  }

  if (!session) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|icon.png).*)"],
};
