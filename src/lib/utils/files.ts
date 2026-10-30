export function removeFileByIndex(input: HTMLInputElement, index: number) {
  const dt = new DataTransfer();
  for (let i = 0; i < input.files!.length; i++) {
    if (i !== index) dt.items.add(input.files![i]);
  }
  input.files = dt.files;
  return Array.from(input.files);
}
