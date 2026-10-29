import { PDFDocument } from "pdf-lib";

export async function canvasesToPdf() {
  const pdf = await PDFDocument.create();

  const canvases = document.querySelectorAll("canvas");

  for (const canvas of canvases) {
    const blob = await new Promise<Blob>((r) =>
      canvas.toBlob((b) => r(b!), "image/png"),
    );
    const png = await pdf.embedPng(await blob.arrayBuffer());
    const page = pdf.addPage([png.width, png.height]);
    page.drawImage(png, { x: 0, y: 0, width: png.width, height: png.height });
  }

  const bytes = await pdf.save();
  const url = URL.createObjectURL(
    new Blob([bytes], { type: "application/pdf" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = "scans.pdf";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
