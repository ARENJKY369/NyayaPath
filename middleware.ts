import { NextRequest, NextResponse } from "next/server";

const AUTH_COOKIE_NAME = "nyayapath_session";

const protectedPaths = [
  "/workspace",
  "/workspace/",
  "/settings",
  "/settings/",
  "/security",
  "/security/",
  "/history",
  "/history/",
];

function isProtectedPath(pathname: string) {
  return protectedPaths.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  const cookieValue = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!cookieValue) {
    const url = new URL("/auth", request.url);
    url.searchParams.set("returnTo", `${pathname}${search}`);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/workspace/:path*",
    "/settings/:path*",
    "/security/:path*",
    "/history/:path*",
  ],
};
