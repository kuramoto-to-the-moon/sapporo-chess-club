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
  const [error, setError] = useState<string | null>(null);
  const i = t(locale);

  const formId = `application-form-${formspreeId}`;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const data = new FormData(form);
    data.append("_subject", `大会申込: ${tournamentName}`);

    try {
      const res = await fetch(`https://formspree.io/f/${formspreeId}`, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        setError(
          locale === "ja"
            ? "送信に失敗しました。もう一度お試しください。"
            : "Submission failed. Please try again."
        );
      }
    } catch {
      setError(
        locale === "ja"
          ? "送信に失敗しました。もう一度お試しください。"
          : "Submission failed. Please try again."
      );
    }
  }

  if (submitted) {
    return (
      <div
        className="p-4 bg-[#fafafa] text-center text-sm text-[#525252] rounded-b-md"
        role="status"
        aria-live="polite"
      >
        {locale === "ja" ? "送信しました。ありがとうございます。" : "Submitted. Thank you."}
      </div>
    );
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="text-sm text-[#2563eb] hover:text-[#1d4ed8] transition-colors duration-150 font-medium cursor-pointer"
      >
        {i.tournament.register} →
      </button>
    );
  }

  const inputClass =
    "w-full bg-white border border-[#e5e5e5] rounded px-2 py-1.5 text-sm outline-none focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] transition-colors";
  const labelClass = "block text-xs text-[#525252] mb-0.5 font-medium";

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 animate-fade-in-up"
      aria-label={locale === "ja" ? `${tournamentName} 参加申込フォーム` : `${tournamentName} registration form`}
      noValidate
    >
      <input type="hidden" name="tournament" value={tournamentName} />

      {error && (
        <p role="alert" className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-2 py-1.5">
          {error}
        </p>
      )}

      <div>
        <label htmlFor={`${formId}-name`} className={labelClass}>
          {locale === "ja" ? "お名前" : "Name"}
          <span aria-hidden="true" className="text-red-500 ml-0.5">*</span>
        </label>
        <input
          id={`${formId}-name`}
          type="text"
          name="name"
          required
          aria-required="true"
          placeholder={locale === "ja" ? "お名前" : "Name"}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor={`${formId}-email`} className={labelClass}>
          {locale === "ja" ? "メールアドレス" : "Email"}
          <span aria-hidden="true" className="text-red-500 ml-0.5">*</span>
        </label>
        <input
          id={`${formId}-email`}
          type="email"
          name="email"
          required
          aria-required="true"
          placeholder={locale === "ja" ? "メールアドレス" : "Email"}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor={`${formId}-jca`} className={labelClass}>
          {locale === "ja" ? "JCA会員番号（任意）" : "JCA Number (optional)"}
        </label>
        <input
          id={`${formId}-jca`}
          type="text"
          name="jca_number"
          placeholder={locale === "ja" ? "JCA会員番号（任意）" : "JCA Number (optional)"}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor={`${formId}-notes`} className={labelClass}>
          {locale === "ja" ? "備考" : "Notes"}
        </label>
        <textarea
          id={`${formId}-notes`}
          name="notes"
          placeholder={locale === "ja" ? "備考" : "Notes"}
          rows={2}
          className={`${inputClass} resize-none`}
        />
      </div>

      <button
        type="submit"
        className="w-full bg-[#2563eb] text-white text-center py-2.5 rounded-[5px] text-sm font-medium hover:bg-[#1d4ed8] hover:scale-[1.02] active:scale-100 transition-all duration-150 cursor-pointer"
      >
        {locale === "ja" ? "送信する" : "Submit"}
      </button>
      <button
        type="button"
        onClick={() => setIsOpen(false)}
        className="text-xs text-[#737373] text-center cursor-pointer hover:text-[#171717] transition-colors duration-150"
      >
        {locale === "ja" ? "閉じる" : "Cancel"}
      </button>
    </form>
  );
}
