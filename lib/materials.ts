import type { MaterialPage } from "@/lib/types";

const materialPages: MaterialPage[] = [
  {
    id: "profile-rivera",
    category: "profile",
    title: "Nora Rivera",
    summary: "Personnel profile entry used for archival tasks.",
    slug: ["profile", "rivera"],
    blocks: [
      {
        type: "keyValue",
        rows: [
          { label: "Name", value: "Nora Rivera" },
          { label: "Birthday", value: "March 14, 1991" },
          { label: "Role", value: "Archivist" },
        ],
      },
    ],
  },
  {
    id: "catalog-basic-tools",
    category: "catalog",
    title: "Basic Tools Catalog",
    summary: "Compact hardware price list for station purchases.",
    slug: ["catalog", "basic-tools"],
    blocks: [
      {
        type: "table",
        columns: ["SKU", "Name", "Price"],
        rows: [
          ["T-100", "Wrench", "25"],
          ["T-220", "Hammer", "19"],
          ["T-315", "Pliers", "23"],
          ["T-410", "Saw", "31"],
        ],
      },
    ],
  },
  {
    id: "policy-shipping-v1",
    category: "policy",
    title: "Shipping Rules v1",
    summary: "Rules used by the station warehouse for method selection.",
    slug: ["policy", "shipping-v1"],
    blocks: [
      {
        type: "ordered",
        items: [
          "If weight <= 2kg and order total >= 100, use EXPRESS-LITE.",
          "If weight <= 2kg and order total < 100, use STANDARD-S.",
          "If weight > 2kg, use HEAVY-X.",
        ],
      },
    ],
  },
  {
    id: "projects-aurora",
    category: "project",
    title: "Project Aurora",
    summary: "Active internal project with a single assigned owner.",
    slug: ["projects", "aurora"],
    blocks: [
      {
        type: "keyValue",
        rows: [
          { label: "Project", value: "Aurora" },
          { label: "Owner", value: "Liam Chen" },
          { label: "Owner Page", value: "/materials/people/liam-chen" },
          { label: "Status", value: "Active" },
        ],
      },
    ],
  },
  {
    id: "people-liam-chen",
    category: "people",
    title: "Liam Chen",
    summary: "Research department employee entry.",
    slug: ["people", "liam-chen"],
    blocks: [
      {
        type: "keyValue",
        rows: [
          { label: "Name", value: "Liam Chen" },
          { label: "Employee ID", value: "EC-4182" },
          { label: "Department", value: "Research" },
        ],
      },
    ],
  },
  {
    id: "archive-blue-harbor-note",
    category: "archive",
    title: "Blue Harbor Note",
    summary: "Archived note entry returned by station search.",
    slug: ["archive", "blue-harbor-note"],
    blocks: [
      {
        type: "keyValue",
        rows: [
          { label: "Archive Title", value: "Blue Harbor Note" },
          { label: "Archive Code", value: "AH-9037" },
        ],
      },
    ],
  },
];

export function getMaterialPageBySlug(slug: string[]) {
  return materialPages.find((page) => page.slug.join("/") === slug.join("/"));
}

export function getAllMaterialParams() {
  return materialPages.map((page) => ({ slug: page.slug }));
}
