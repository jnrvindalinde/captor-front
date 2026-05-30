import { fetchPublicResources, mapApiResourceToResource } from "@/lib/resources";
import { resources as mockResources } from "./_data";
import ResourcesIndexClient from "./ResourcesIndexClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Resources",
  description:
    "Free guides, templates, videos and worksheets for applicants who want to do this properly.",
  openGraph: {
    title: "Resources · Career 360 Consult",
    description:
      "Free guides, templates, videos and worksheets for applicants who want to do this properly.",
  },
};

export default async function ResourcesPage() {
  const apiResources = await fetchPublicResources({ perPage: 48 });
  const live = apiResources !== null;
  const resources = live ? apiResources!.map(mapApiResourceToResource) : mockResources;
  return <ResourcesIndexClient resources={resources} live={live} />;
}
