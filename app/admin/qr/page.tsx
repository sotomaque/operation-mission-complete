import QRCode from "qrcode";

import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/lib/admin-guard";

/**
 * QR code generator for the two invite links. Renders the SVG inline so
 * a right-click → Save As (or screenshot) gives the host a print-ready
 * file. Both codes also have a download link for the SVG markup.
 *
 * The encoded URL uses NEXT_PUBLIC_APP_URL so it's correct per
 * environment — preview deploys generate preview QRs, prod generates
 * prod QRs.
 */

const SHEETS = [
  {
    code: "adventure",
    seal: "Compass Rose",
    title: "Adventure + Welcome",
    note: "Includes the maritime expedition.",
  },
  {
    code: "welcome",
    seal: "Anchor",
    title: "Welcome Party",
    note: "The evening rendezvous only.",
  },
] as const;

async function makeSvg(url: string) {
  return QRCode.toString(url, {
    type: "svg",
    errorCorrectionLevel: "H",
    margin: 2,
    color: { dark: "#0d1320", light: "#ece2c9" },
  });
}

export default async function QrPage() {
  await requireAdmin();
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const codes = await Promise.all(
    SHEETS.map(async (s) => {
      const url = `${base}/mission/${s.code}`;
      const svg = await makeSvg(url);
      return { ...s, url, svg };
    }),
  );

  return (
    <main className="min-h-screen px-4 py-8 max-w-5xl mx-auto">
      <header className="mb-8">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-dossier-fg-muted">
          Print-ready
        </p>
        <h1 className="font-serif text-3xl text-dossier-fg leading-tight">
          QR Codes for Physical Invitations
        </h1>
        <p className="font-mono text-sm text-dossier-fg-muted mt-2 max-w-2xl">
          Right-click any QR → Save Image As, or use the Download SVG
          button below each card. Print at any size — error-correction
          is set to H so scanning survives ink bleed and minor damage.
        </p>
      </header>

      <div className="grid sm:grid-cols-2 gap-6">
        {codes.map((c) => (
          <article
            key={c.code}
            className="paper rounded-sm p-8 flex flex-col items-center text-center"
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-copper mb-1">
              Seal · {c.seal}
            </p>
            <h2 className="font-serif text-2xl text-dossier-ink mb-1">
              {c.title}
            </h2>
            <p className="font-mono text-xs text-dossier-ink-muted mb-5">
              {c.note}
            </p>

            <div
              className="w-64 h-64 flex items-center justify-center [&_svg]:w-full [&_svg]:h-full"
              dangerouslySetInnerHTML={{ __html: c.svg }}
            />

            <p className="mt-4 font-mono text-[10px] text-dossier-ink-muted break-all">
              {c.url}
            </p>

            <div className="mt-5">
              <a
                href={`data:image/svg+xml;utf8,${encodeURIComponent(c.svg)}`}
                download={`omc-${c.code}-qr.svg`}
                className="inline-flex"
              >
                <Button variant="outline" size="sm" type="button">
                  Download SVG
                </Button>
              </a>
            </div>
          </article>
        ))}
      </div>

      <p className="mt-8 text-center font-mono text-[10px] uppercase tracking-[0.25em] text-dossier-fg-muted">
        Cards print at 300 DPI · QR scales infinitely (vector)
      </p>
    </main>
  );
}
