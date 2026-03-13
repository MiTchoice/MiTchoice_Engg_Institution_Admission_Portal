export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/quiz/:path*",
    "/score-card/:path*",
    "/branch-choice/:path*",
    "/admission-form/:path*",
    "/admission-letter/:path*",
    "/admin/:path*",
    "/api/quiz/:path*",
    "/api/score/:path*",
    "/api/branch/:path*",
    "/api/admission/:path*",
    "/api/admin/:path*",
    "/api/pdf/:path*",
  ],
};
