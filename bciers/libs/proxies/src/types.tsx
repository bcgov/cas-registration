import { NextProxy } from "next/server";

export type ProxyFactory = (proxy: NextProxy) => NextProxy;
