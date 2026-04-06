import { useState } from "react";
import type { Locale } from "@/i18n";
import { t } from "@/i18n";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

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
        className="p-4 bg-muted text-center text-sm text-muted-foreground rounded-md"
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
        className="text-sm text-primary hover:opacity-80 transition-opacity duration-150 font-medium cursor-pointer"
      >
        {i.tournament.register} →
      </button>
    );
  }

  function field(
    name: FieldName,
    labelText: string,
    required: boolean,
    children: (props: {
      id: string;
      name: FieldName;
      "aria-invalid": boolean;
      "aria-describedby": string | undefined;
      onBlur: ReturnType<typeof handleBlur>;
    }) => React.ReactNode
  ) {
    const id = `${formId}-${name}`;
    const errorId = `${id}-error`;
    return (
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={id}>
          {labelText}
          {required && <span aria-hidden="true" className="text-destructive ml-0.5">*</span>}
        </Label>
        {children({
          id,
          name,
          "aria-invalid": !!errors[name],
          "aria-describedby": errors[name] ? errorId : undefined,
          onBlur: handleBlur(name),
        })}
        {errors[name] && (
          <p id={errorId} role="alert" className="text-xs text-destructive">
            {errors[name]}
          </p>
        )}
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 animate-fade-in-up"
      aria-label={locale === "ja" ? `${tournamentName} 参加申込フォーム` : `${tournamentName} registration form`}
      noValidate
    >
      <input type="hidden" name="tournament" value={tournamentName} />

      {error && (
        <p role="alert" className="text-xs text-destructive bg-destructive/10 border border-destructive/30 rounded px-3 py-2">
          {error}
        </p>
      )}

      {field("name", locale === "ja" ? "お名前" : "Name", true, (props) => (
        <Input
          {...props}
          type="text"
          required
          autoComplete="name"
          placeholder={locale === "ja" ? "山田 太郎" : "Taro Yamada"}
        />
      ))}

      {field("email", locale === "ja" ? "メールアドレス" : "Email", true, (props) => (
        <Input
          {...props}
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          placeholder="you@example.com"
        />
      ))}

      {field("jca_number", locale === "ja" ? "JCA会員番号(任意)" : "JCA Number (optional)", false, (props) => (
        <Input {...props} type="text" placeholder="J12345" />
      ))}

      {field("notes", locale === "ja" ? "備考" : "Notes", false, (props) => (
        <Textarea {...props} rows={3} />
      ))}

      <button
        type="submit"
        className="w-full bg-primary text-primary-foreground text-center py-2.5 rounded-md text-sm font-medium hover:opacity-90 active:opacity-80 transition-opacity duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        {locale === "ja" ? "送信する" : "Submit"}
      </button>
      <button
        type="button"
        onClick={() => setIsOpen(false)}
        className="text-xs text-muted-foreground text-center cursor-pointer hover:text-foreground transition-colors duration-150"
      >
        {locale === "ja" ? "閉じる" : "Cancel"}
      </button>
    </form>
  );
}
