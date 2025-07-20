import "./styles.css";

import { createRouter, RouterProvider } from "@tanstack/solid-router";
import { render } from "solid-js/web";

import gsapInit from "./lib/gsap/gsapInit";
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
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

const rootElement = document.getElementById("app");
if (rootElement) {
  render(() => <App />, rootElement);
}
