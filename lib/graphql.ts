const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/graphql";

interface GraphQLResult<T> {
  data?: T;
  errors?: Array<{ message: string }>;
}

export async function gqlRequest<TData, TVariables extends Record<string, unknown> = Record<string, unknown>>(
  query: string,
  variables?: TVariables
): Promise<TData> {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    credentials: "include",
    body: JSON.stringify({ query, variables: (variables ?? null) as Record<string, unknown> | null })
  });

  const json = (await response.json()) as GraphQLResult<TData>;
  if (json.errors && json.errors.length > 0) {
    throw new Error(json.errors[0]?.message ?? "GraphQL request failed");
  }
  if (!json.data) {
    throw new Error("GraphQL response has no data");
  }
  return json.data;
}
