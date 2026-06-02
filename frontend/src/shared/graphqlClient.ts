export async function graphqlRequest(
  query: string,
  variables: Record<string, any> = {},
) {
  const res = await fetch('/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  });

  const json = await res.json();
  return json.data;
}
