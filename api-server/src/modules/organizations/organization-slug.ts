export function organizationSlug(organization: { id: string; name: string }) {
  const name = organization.name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  // The UUID makes links unique and keeps existing links working after a rename.
  return `${name || "clb"}-${organization.id}`;
}

export function withOrganizationSlug<T extends { id: string; name: string }>(organization: T) {
  return { ...organization, slug: organizationSlug(organization) };
}
