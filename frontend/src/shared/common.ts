import { DocumentNode, print } from 'graphql';

export const paginationPages = (totalPages: number, currentPage: number) => {
  const pages: {
    number: number | null;
    text: string;
    key: string;
    isEllipsis: boolean;
  }[] = [];

  const addPage = (page: number) => {
    pages.push({
      number: page,
      text: page.toString(),
      key: page.toString(),
      isEllipsis: false,
    });
  };

  const addEllipsis = (key: string) => {
    pages.push({
      number: null,
      text: '...',
      key,
      isEllipsis: true,
    });
  };

  if (totalPages <= 5) {
    for (let i = 1; i <= totalPages; i++) addPage(i);
    return pages;
  }

  addPage(1);

  if (currentPage > 3) {
    addEllipsis('left');
  }

  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  for (let i = start; i <= end; i++) {
    addPage(i);
  }

  if (currentPage < totalPages - 2) {
    addEllipsis('right');
  }

  addPage(totalPages);

  return pages;
};

export function buildMultipartRequest<TVariables>(
  file: File | null,
  variables: TVariables,
  mutation: DocumentNode,
) {
  const operations = JSON.stringify({
    query: print(mutation),
    variables: {
      ...variables,
      file: file ? null : undefined,
    },
  });

  const map = JSON.stringify({
    '0': ['variables.file'],
  });

  const formData = new FormData();
  formData.append('operations', operations);
  formData.append('map', map);

  if (file) {
    formData.append('0', file);
  }

  return formData;
}

export function validateForm(
  form: Record<string, any>,
  fieldsToValidate: string[],
): [Record<string, string>, boolean] {
  const errors: Record<string, string> = {};
  let valid = true;

  for (const key of fieldsToValidate) {
    const value = form[key];

    if (typeof value === 'string') {
      if (!value.trim()) {
        errors[key] = `${key} is required`;
        valid = false;
      }
    } else if (typeof value === 'number') {
      if (value <= 0) {
        errors[key] = `${key} must be greater than 0`;
        valid = false;
      }
    } else if (value === null || value === undefined) {
      errors[key] = `${key} is required`;
      valid = false;
    }
  }

  return [errors, valid];
}

export function formatToIntlDate(isoDateString: string) {
  const date = new Date(isoDateString);

  const formattedDate = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  }).format(date);

  return formattedDate;
}

export function truncateString(content: string, maxLength: number) {
  if (content.length > maxLength) {
    return content.substring(0, maxLength - 3) + '...';
  } else {
    return content;
  }
}

export async function toBase64(url: string): Promise<string> {
  const res = await fetch(url);
  const blob = await res.blob();

  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
