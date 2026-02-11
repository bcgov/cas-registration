import { NextResponse } from "next/server";

const healthCheckRoute = () => {
  return NextResponse.json({ status: "ok" }, { status: 200 });
};

export default healthCheckRoute;
