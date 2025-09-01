import { createFileRoute } from "@tanstack/solid-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { z } from "zod";

import RootPage from "./-components/RootPage";

export const Route = createFileRoute("/")({
  validateSearch: zodValidator(
    z.object({
      yym: z.number().optional(),
    }),
  ),
  component: RootPage,
});
