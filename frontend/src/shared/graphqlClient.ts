import { DocumentNode, print } from 'graphql';

export async function graphqlRequest<TResult, TVariables = undefined>(
  query: DocumentNode,
  variables: TVariables | FormData,
): Promise<TResult> {
  let body: BodyInit;

  const isFormData = variables instanceof FormData;

  if (isFormData) {
    body = variables;
  } else {
    body = JSON.stringify({
      query: print(query),
      variables,
    });
  }

  const res = await fetch('/graphql', {
    method: 'POST',
    headers: isFormData
      ? {
          'x-apollo-operation-name': 'uploadFile',
        }
      : {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
    body,
  });

  const json = await res.json();

  return json.data;
}
