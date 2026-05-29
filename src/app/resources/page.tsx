import { fetchPublicResources, mapApiResourceToResource } from "@/lib/resources";
import { resources as mockResources } from "./_data";
import ResourcesIndexClient from "./ResourcesIndexClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Free resources for serious applicants · Captor",
};

export default async function ResourcesPage() {
  const apiResources = await fetchPublicResources({ perPage: 48 });
  const live = apiResources !== null;
  const resources = live ? apiResources!.map(mapApiResourceToResource) : mockResources;
  return <ResourcesIndexClient resources={resources} live={live} />;
}
