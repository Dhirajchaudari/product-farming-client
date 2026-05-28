export function getApiBaseUrl(): string {
  const graphqlUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/graphql";
  return graphqlUrl.replace(/\/graphql\/?$/i, "");
}
