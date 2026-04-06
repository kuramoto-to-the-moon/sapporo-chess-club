import { useState } from "react";
import type { Locale } from "@/i18n";
import { t } from "@/i18n";

interface Props {
  formspreeId: string;
  tournamentName: string;
  locale: Locale;
}

type FieldName = "name" | "email" | "jca_number" | "notes";
type Errors = Partial<Record<FieldName, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const JCA_RE = /^[A-Za-z0-9-]{1,20}$/;

export default function ApplicationForm({ formspreeId, tournamentName, locale }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const i = t(locale);
  const e = i.form.errors;

  const formId = `application-form-${formspreeId}`;

  function validateValue(field: FieldName, raw: string): string | undefined {
    const v = raw.trim();
    switch (field) {
      case "name":
        if (!v) return e.nameRequired;
        if (v.length > 50) return e.nameTooLong;
        return;
      case "email":
        if (!v) return e.emailRequired;
        if (!EMAIL_RE.test(v)) return e.emailInvalid;
        return;
      case "jca_number":
        if (v && !JCA_RE.test(v)) return e.jcaInvalid;
        return;
      case "notes":
        if (v.length > 500) return e.notesTooLong;
        return;
    }
  }

  function validateAll(form: HTMLFormElement): Errors {
    const data = new FormData(form);
    const next: Errors = {};
    (["name", "email", "jca_number", "notes"] as const).forEach((f) => {
      const msg = validateValue(f, String(data.get(f) ?? ""));
      if (msg) next[f] = msg;
    });
    return next;
  }

  function handleBlur(field: FieldName) {
    return (ev: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const msg = validateValue(field, ev.currentTarget.value);
      setErrors((prev) => {
        const next = { ...prev };
        if (msg) next[field] = msg;
        else delete next[field];
        return next;
      });
    };
  }

  async function handleSubmit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    setError(null);
    const form = ev.currentTarget;

    const found = validateAll(form);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      return;
    }
    setErrors({});

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

  const inputBase =
    "w-full bg-white border rounded px-2 py-1.5 text-sm outline-none focus:ring-1 transition-colors";
  const inputClass = (field: FieldName) =>
    `${inputBase} ${
      errors[field]
        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
        : "border-[#e5e5e5] focus:border-[#2563eb] focus:ring-[#2563eb]"
    }`;
  const labelClass = "block text-xs text-[#525252] mb-0.5 font-medium";
  const errorClass = "text-xs text-red-600 mt-1";

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
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? `${formId}-name-error` : undefined}
          onBlur={handleBlur("name")}
          autoComplete="name"
          placeholder={locale === "ja" ? "山田 太郎" : "Taro Yamada"}
          className={inputClass("name")}
        />
        {errors.name && (
          <p id={`${formId}-name-error`} role="alert" className={errorClass}>
            {errors.name}
          </p>
        )}
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
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? `${formId}-email-error` : undefined}
          onBlur={handleBlur("email")}
          autoComplete="email"
          inputMode="email"
          placeholder="you@example.com"
          className={inputClass("email")}
        />
        {errors.email && (
          <p id={`${formId}-email-error`} role="alert" className={errorClass}>
            {errors.email}
          </p>
        )}
      </div>

      <div>
        <label htmlFor={`${formId}-jca`} className={labelClass}>
          {locale === "ja" ? "JCA会員番号(任意)" : "JCA Number (optional)"}
        </label>
        <input
          id={`${formId}-jca`}
          type="text"
          name="jca_number"
          aria-invalid={!!errors.jca_number}
          aria-describedby={errors.jca_number ? `${formId}-jca-error` : undefined}
          onBlur={handleBlur("jca_number")}
          placeholder="J12345"
          className={inputClass("jca_number")}
        />
        {errors.jca_number && (
          <p id={`${formId}-jca-error`} role="alert" className={errorClass}>
            {errors.jca_number}
          </p>
        )}
      </div>

      <div>
        <label htmlFor={`${formId}-notes`} className={labelClass}>
          {locale === "ja" ? "備考" : "Notes"}
        </label>
        <textarea
          id={`${formId}-notes`}
          name="notes"
          aria-invalid={!!errors.notes}
          aria-describedby={errors.notes ? `${formId}-notes-error` : undefined}
          onBlur={handleBlur("notes")}
          rows={2}
          className={`${inputClass("notes")} resize-none`}
        />
        {errors.notes && (
          <p id={`${formId}-notes-error`} role="alert" className={errorClass}>
            {errors.notes}
          </p>
        )}
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
