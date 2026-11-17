import { AuthField } from "@/features/auth/components/auth-field";

type LoginFormFieldsProps = {
  mode: "login" | "register" | "password-reset";
};

export function LoginFormFields({ mode }: LoginFormFieldsProps) {
  const isRegistering = mode === "register";
  const isPasswordResetting = mode === "password-reset";

  return (
    <>
      {isRegistering && (
        <AuthField
          id="username"
          name="username"
          label="Username"
          type="text"
          autoComplete="username"
          required
          maxLength={255}
          placeholder="What should we call you?"
        />
      )}

      <AuthField
        id="email"
        name="email"
        label="Email address"
        type="email"
        autoComplete="email"
        required
        maxLength={255}
        placeholder="you@example.com"
      />

      {!isPasswordResetting && (
        <AuthField
          id="password"
          name="password"
          label="Password"
          type="password"
          autoComplete={isRegistering ? "new-password" : "current-password"}
          required
          minLength={isRegistering ? 8 : undefined}
          maxLength={isRegistering ? 72 : undefined}
          hint={
            isRegistering ? (
              <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--color-muted)]">
                8 characters minimum
              </span>
            ) : undefined
          }
          placeholder="Enter your password"
        />
      )}

      {isRegistering && (
        <AuthField
          id="currency"
          name="currency"
          label="Currency"
          type="text"
          defaultValue="MGA"
          autoComplete="country-currency"
          required
          maxLength={20}
          inputClassName="uppercase"
          placeholder="MGA"
        />
      )}
    </>
  );
}
