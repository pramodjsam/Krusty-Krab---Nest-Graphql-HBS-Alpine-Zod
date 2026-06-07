import { DocumentNode, print } from 'graphql';

export async function graphqlRequest<TResult, TVariables = undefined>(
  query: DocumentNode,
  variables: TVariables | FormData,
  options?: {
    auth?: boolean;
  },
): Promise<TResult> {
  let body: BodyInit;

  const isFormData = variables instanceof FormData;

  const headers: Record<string, string> = {};

  if (isFormData) {
    body = variables;
    headers['x-apollo-operation-name'] = 'uploadFile';
  } else {
    headers['Content-Type'] = 'application/json';
    headers['Accept'] = 'application/json';

    body = JSON.stringify({
      query: print(query),
      variables,
    });
  }

  if (options?.auth) {
    // TODO: CHANGE AFTER AUTH SETUP
    headers['Authorization'] =
      'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiZW1haWwiOiJqYW5lQGVtYWlsLmNvbSIsInJvbGUiOiJVU0VSIiwiaWF0IjoxNzgwNzg5ODQ1LCJleHAiOjE3ODA4NzYyNDV9.RYLimHzpUaKZ8AS0qgu1wNHUKqMXl6_7f33mzVU0ZcE'; // TODO: Change after auth setup
  }

  const res = await fetch('/graphql', {
    method: 'POST',
    headers,
    body,
  });

  const json = await res.json();

  return json.data;
}
