export function removeFileByFileName(
  input: HTMLInputElement,
  fileName: string,
) {
  const dt = new DataTransfer();
  for (let i = 0; i < input.files!.length; i++) {
    if (input.files![i].name !== fileName) dt.items.add(input.files![i]);
  }
  input.files = dt.files;
  return Array.from(input.files);
}
