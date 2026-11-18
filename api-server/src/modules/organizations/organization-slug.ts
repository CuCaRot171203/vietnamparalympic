export function organizationSlug(organization: { id: string; name: string }) {
  const name = organization.name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  // Public URLs use the club name. Legacy UUID links are resolved separately.
  return name || "clb";
}

export function withOrganizationSlug<T extends { id: string; name: string }>(
  organization: T,
) {
  return { ...organization, slug: organizationSlug(organization) };
}
