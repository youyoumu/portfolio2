import "./styles.css";

import { createRouter, RouterProvider } from "@tanstack/solid-router";
import { render } from "solid-js/web";

import gsapInit from "./lib/gsap/gsapInit";
import { isMobile } from "./lib/utils/isMobile";
import { routeTree } from "./routeTree.gen";

gsapInit();

const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  scrollRestoration: true,
  defaultPreloadStaleTime: 0,
});

declare module "@tanstack/solid-router" {
  interface Register {
    router: typeof router;
  }
}

function App() {
  return <RouterProvider router={router} />;
}

const rootElement = document.getElementById("app");
if (rootElement) {
  render(() => <App />, rootElement);
}

if (!isMobile()) {
  ScrollSmoother.create({
    content: rootElement,
    smooth: 0.5, // how long (in seconds) it takes to "catch up" to the native scroll position
    effects: true, // looks for data-speed and data-lag attributes on elements
    smoothTouch: 0.1, // much shorter smoothing time on touch devices (default is NO smoothing on touch devices)
  });
}
