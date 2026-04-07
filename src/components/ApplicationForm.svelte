<script lang="ts">
  import type { Locale } from "@/i18n";
  import { t } from "@/i18n";
  import { Input } from "@/components/ui/input";
  import { Textarea } from "@/components/ui/textarea";
  import { Label } from "@/components/ui/label";
  import { Button } from "@/components/ui/button";

  interface Props {
    formspreeId: string;
    tournamentName: string;
    locale: Locale;
  }

  type FieldName = "name" | "email" | "jca_number" | "notes";
  type Errors = Partial<Record<FieldName, string>>;

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const JCA_RE = /^[A-Za-z0-9-]{1,20}$/;

  let { formspreeId, tournamentName, locale }: Props = $props();

  let isOpen = $state(false);
  let submitted = $state(false);
  let submitting = $state(false);
  let error = $state<string | null>(null);
  let errors = $state<Errors>({});

  const i = t(locale);
  const e = i.form.errors;

  const formId = `application-form-${formspreeId}`;
  const notesId = `${formId}-notes`;
  const notesErrId = `${notesId}-error`;

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
    return (ev: FocusEvent) => {
      const target = ev.currentTarget as HTMLInputElement | HTMLTextAreaElement;
      const msg = validateValue(field, target.value);
      const nextErrors = { ...errors };
      if (msg) nextErrors[field] = msg;
      else delete nextErrors[field];
      errors = nextErrors;
    };
  }

  async function handleSubmit(ev: SubmitEvent) {
    ev.preventDefault();
    if (submitting) return;
    error = null;
    const form = ev.currentTarget as HTMLFormElement;

    const found = validateAll(form);
    if (Object.keys(found).length > 0) {
      errors = found;
      return;
    }
    errors = {};

    const data = new FormData(form);
    data.append("_subject", `大会申込: ${tournamentName}`);

    submitting = true;
    try {
      const res = await fetch(`https://formspree.io/f/${formspreeId}`, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });

      if (res.ok) {
        submitted = true;
      } else {
        error = i.form.submitError;
      }
    } catch {
      error = i.form.submitError;
    } finally {
      submitting = false;
    }
  }
</script>

{#if submitted}
  <div
    class="flex items-center gap-3 p-4 rounded-md border border-[#2563eb]/20 bg-[#2563eb]/5 text-[#171717] animate-fade-in-up"
    role="status"
    aria-live="polite"
  >
    <span
      class="flex-shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#2563eb] text-white"
      aria-hidden="true"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="3"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
    </span>
    <p class="text-sm font-medium">{i.form.success}</p>
  </div>
{:else if !isOpen}
  <Button
    type="button"
    variant="link"
    onclick={() => (isOpen = true)}
    class="h-auto p-0 text-sm font-medium hover:no-underline hover:opacity-80"
  >
    {i.tournament.register} →
  </Button>
{:else}
  <form
    onsubmit={handleSubmit}
    class="flex flex-col gap-5 animate-fade-in-up border-t border-[#f5f5f5] pt-5"
    aria-label={i.form.ariaLabel(tournamentName)}
    novalidate
  >
    <input type="hidden" name="tournament" value={tournamentName} />
    <!-- Honeypot: ボットが値を入れたら formspree がブロック -->
    <input
      type="text"
      name="_gotcha"
      tabindex={-1}
      autocomplete="off"
      class="hidden"
      aria-hidden="true"
    />

    {#if error}
      <div
        role="alert"
        class="flex items-start gap-3 p-3 rounded-md border border-destructive/30 bg-destructive/10 text-destructive"
      >
        <span class="flex-shrink-0 mt-0.5" aria-hidden="true">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </span>
        <p class="text-sm">{error}</p>
      </div>
    {/if}

    {#each [
      { name: "name" as const, label: i.form.labels.name, required: true, type: "text", autocomplete: "name", placeholder: i.form.placeholders.name },
      { name: "email" as const, label: i.form.labels.email, required: true, type: "email", autocomplete: "email", placeholder: "you@example.com" },
      { name: "jca_number" as const, label: i.form.labels.jcaNumber, required: false, type: "text", autocomplete: "off", placeholder: i.form.placeholders.jcaNumber },
    ] as f}
      {@const id = `${formId}-${f.name}`}
      {@const errorId = `${id}-error`}
      <div class="flex flex-col gap-2">
        <Label for={id} class="text-sm font-medium">
          {f.label}
          {#if f.required}<span aria-hidden="true" class="text-destructive ml-0.5">*</span>{/if}
        </Label>
        <Input
          {id}
          name={f.name}
          type={f.type}
          required={f.required}
          autocomplete={f.autocomplete}
          placeholder={f.placeholder}
          aria-invalid={!!errors[f.name]}
          aria-describedby={errors[f.name] ? errorId : undefined}
          onblur={handleBlur(f.name)}
        />
        {#if errors[f.name]}
          <p id={errorId} role="alert" class="text-xs text-destructive">{errors[f.name]}</p>
        {/if}
      </div>
    {/each}

    <div class="flex flex-col gap-2">
      <Label for={notesId} class="text-sm font-medium">{i.form.labels.notes}</Label>
      <Textarea
        id={notesId}
        name="notes"
        rows={4}
        aria-invalid={!!errors.notes}
        aria-describedby={errors.notes ? notesErrId : undefined}
        onblur={handleBlur("notes")}
      />
      {#if errors.notes}
        <p id={notesErrId} role="alert" class="text-xs text-destructive">{errors.notes}</p>
      {/if}
    </div>

    <div class="flex flex-col gap-2 pt-1">
      <Button
        type="submit"
        class="w-full h-11 text-sm font-semibold"
        disabled={submitting}
      >
        {submitting ? i.form.actions.submitting : i.form.actions.submit}
      </Button>
      <Button
        type="button"
        variant="link"
        onclick={() => (isOpen = false)}
        class="h-auto p-0 text-xs text-muted-foreground hover:text-foreground hover:no-underline"
      >
        {i.form.actions.cancel}
      </Button>
    </div>
  </form>
{/if}
