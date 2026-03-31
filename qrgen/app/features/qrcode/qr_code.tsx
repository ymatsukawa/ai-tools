import { useState } from "react"
import { QRCodeSVG } from "qrcode.react";
import { type QRCode } from "~/domain/qrcode";

export function QrCode() {
  const [qr, setQr] = useState<QRCode>({ input: '' });

  const onValueChanged = (val: string) => {
    setQr({ input: val })
  }

  return (
    <div className="relative z-10 flex min-h-dvh items-center justify-center px-6">
      <div className="flex w-full max-w-md flex-col items-center gap-10">

        <div className="qr-glow rounded-2xl bg-white p-6">
          <QRCodeSVG
            value={qr.input || ""}
            size={220}
            bgColor="#ffffff"
            fgColor="#0a0a0a"
            level="M"
            marginSize={0}
          />
        </div>

        <div className="w-full">
          <input
            id="qr-input"
            type="text"
            placeholder="http://example.com"
            value={qr.input}
            onChange={(e) => {
              e.preventDefault();
              onValueChanged(e.target.value);
            }}
            className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-5 py-4 font-mono text-base text-white/90 outline-none transition-all duration-300 placeholder:text-white/20 hover:border-white/20 focus:border-white/30 focus:bg-white/[0.06] focus:ring-1 focus:ring-white/10"
          />
        </div>

      </div>
    </div>
  );
}