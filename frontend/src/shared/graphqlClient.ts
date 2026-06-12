import { DocumentNode, print } from 'graphql';

export type GraphQLResult<T> =
  | { data: T; error: null }
  | { data: null; error: { code: string; message: string } };

export async function graphqlRequest<TResult, TVariables = undefined>(
  query: DocumentNode,
  variables: TVariables | FormData,
  options?: {
    auth?: boolean;
  },
): Promise<GraphQLResult<TResult>> {
  let body: BodyInit;

  const isFormData = variables instanceof FormData;

  const headers: Record<string, string> = {};
  let fetchOptions: RequestInit = {
    method: 'POST',
    headers,
  };

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
    fetchOptions.credentials = 'include';
  }

  fetchOptions.body = body;

  const res = await fetch('/graphql', fetchOptions);

  const json = await res.json();

  if (json.errors?.length) {
    const err = json.errors[0];

    return {
      data: null,
      error: {
        code: err.extensions?.code ?? 'UNKNOWN',
        message: err.message,
      },
    };
  }

  return {
    data: json.data,
    error: null,
  };
}
