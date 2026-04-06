import { useState } from "react";
import type { Locale } from "@/i18n";
import { t } from "@/i18n";

interface Props {
  formspreeId: string;
  tournamentName: string;
  locale: Locale;
}

export default function ApplicationForm({ formspreeId, tournamentName, locale }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const i = t(locale);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    data.append("_subject", `大会申込: ${tournamentName}`);

    const res = await fetch(`https://formspree.io/f/${formspreeId}`, {
      method: "POST",
      body: data,
      headers: { Accept: "application/json" },
    });

    if (res.ok) {
      setSubmitted(true);
    }
  }

  if (submitted) {
    return (
      <div className="p-4 bg-[#fafafa] text-center text-[10px] text-[#525252] rounded-b-md">
        {locale === "ja" ? "送信しました。ありがとうございます。" : "Submitted. Thank you."}
      </div>
    );
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full bg-[#171717] text-white text-center py-2.5 rounded-[5px] text-[10px] font-medium hover:bg-[#3f3f46] transition-colors duration-200 cursor-pointer"
      >
        {i.tournament.register}
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 animate-fade-in-up">
      <input type="hidden" name="tournament" value={tournamentName} />
      <input
        type="text"
        name="name"
        required
        placeholder={locale === "ja" ? "お名前" : "Name"}
        className="w-full bg-white border border-[#e5e5e5] rounded px-2 py-1.5 text-[9px] outline-none focus:border-[#a3a3a3] transition-colors"
      />
      <input
        type="email"
        name="email"
        required
        placeholder={locale === "ja" ? "メールアドレス" : "Email"}
        className="w-full bg-white border border-[#e5e5e5] rounded px-2 py-1.5 text-[9px] outline-none focus:border-[#a3a3a3] transition-colors"
      />
      <input
        type="text"
        name="jca_number"
        placeholder={locale === "ja" ? "JCA会員番号（任意）" : "JCA Number (optional)"}
        className="w-full bg-white border border-[#e5e5e5] rounded px-2 py-1.5 text-[9px] outline-none focus:border-[#a3a3a3] transition-colors"
      />
      <textarea
        name="notes"
        placeholder={locale === "ja" ? "備考" : "Notes"}
        rows={2}
        className="w-full bg-white border border-[#e5e5e5] rounded px-2 py-1.5 text-[9px] outline-none focus:border-[#a3a3a3] transition-colors resize-none"
      />
      <button
        type="submit"
        className="w-full bg-[#171717] text-white text-center py-2.5 rounded-[5px] text-[10px] font-medium hover:bg-[#3f3f46] transition-colors duration-200 cursor-pointer"
      >
        {locale === "ja" ? "送信する" : "Submit"}
      </button>
      <button
        type="button"
        onClick={() => setIsOpen(false)}
        className="text-[8px] text-[#a3a3a3] text-center cursor-pointer"
      >
        {locale === "ja" ? "閉じる" : "Cancel"}
      </button>
    </form>
  );
}
