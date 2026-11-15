"use client";

import { useEffect, useRef, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  CircleAlert,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { z } from "zod";
import styles from "./login.module.css";

type FieldErrors = { email?: string; password?: string; token?: string };
export default function LoginPage() {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const vi = locale === "vi";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [totpToken, setTotpToken] = useState("");
  const [show2FA, setShow2FA] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleEnabled, setGoogleEnabled] = useState(false);
  const submitting = useRef(false);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const tokenRef = useRef<HTMLInputElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const defaultDestination = `/${locale}/profile`;
  const requestedDestination = searchParams?.get("callbackUrl");
  const destination =
    requestedDestination &&
    requestedDestination.startsWith(`/${locale}/`) &&
    !requestedDestination.startsWith("//")
      ? requestedDestination
      : defaultDestination;
  const busy = loading || googleLoading || status === "loading";
  useEffect(() => {
    if (status === "authenticated") router.replace(destination);
  }, [destination, router, status]);
  useEffect(() => {
    try {
      const saved = localStorage.getItem("rememberedEmail");
      if (saved) {
        setEmail(saved);
        setRememberMe(true);
      }
    } catch {
      /* Email memory is optional when browser storage is unavailable. */
    }
  }, []);
  useEffect(() => {
    let active = true;
    fetch("/api/auth/providers")
      .then((response) => (response.ok ? response.json() : {}))
      .then((providers: Record<string, unknown>) => {
        if (active) setGoogleEnabled(Boolean(providers?.google));
      })
      .catch(() => {
        if (active) setGoogleEnabled(false);
      });
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    if (error) errorRef.current?.focus();
  }, [error]);
  useEffect(() => {
    if (show2FA) tokenRef.current?.focus();
  }, [show2FA]);
  const loginError = (message: string) => {
    const normalized = message.toLowerCase();
    if (
      normalized.includes("too many") ||
      normalized.includes("throttler") ||
      normalized.includes("rate limit")
    )
      return vi
        ? "Bạn đã thử đăng nhập quá nhiều lần. Vui lòng chờ khoảng 1 phút rồi thử lại."
        : "Too many sign-in attempts. Please wait about a minute and try again.";
    if (normalized.includes("connection") || normalized.includes("fetch"))
      return vi
        ? "Không thể kết nối máy chủ. Vui lòng thử lại sau."
        : "Unable to connect. Please try again later.";
    if (show2FA)
      return vi
        ? "Mã xác thực không hợp lệ hoặc đã hết hạn. Vui lòng thử lại."
        : "The authentication code is invalid or expired. Please try again.";
    if (
      normalized.includes("invalid credentials") ||
      normalized.includes("credentialsignin") ||
      normalized.includes("đăng nhập thất bại")
    )
      return vi
        ? "Email hoặc mật khẩu không chính xác."
        : "Your email or password is incorrect.";
    return vi
      ? "Đăng nhập không thành công. Vui lòng kiểm tra thông tin và thử lại."
      : "Sign-in failed. Please check your details and try again.";
  };
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting.current || busy) return;
    setError("");
    setFieldErrors({});
    if (show2FA) {
      if (!/^\d{6}$/.test(totpToken)) {
        setFieldErrors({
          token: vi
            ? "Vui lòng nhập đủ 6 chữ số."
            : "Enter the full six-digit code.",
        });
        tokenRef.current?.focus();
        return;
      }
    } else {
      const validation = z
        .object({
          email: z
            .string()
            .email(
              vi
                ? "Vui lòng nhập địa chỉ email hợp lệ."
                : "Enter a valid email address.",
            ),
          password: z
            .string()
            .min(1, vi ? "Vui lòng nhập mật khẩu." : "Enter your password."),
        })
        .safeParse({ email: email.trim(), password });
      if (!validation.success) {
        const errors: FieldErrors = {};
        validation.error.issues.forEach((issue) => {
          const key = issue.path[0];
          if (key === "email" || key === "password")
            errors[key] = issue.message;
        });
        setFieldErrors(errors);
        if (errors.email) emailRef.current?.focus();
        else passwordRef.current?.focus();
        return;
      }
    }
    submitting.current = true;
    setLoading(true);
    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: email.trim(),
        callbackUrl: destination,
        ...(show2FA ? { totpToken } : { password }),
      });
      if (result?.error) {
        if (result.error === "2FA_REQUIRED") {
          setShow2FA(true);
          setShowPassword(false);
        } else setError(loginError(result.error));
      } else if (result?.ok) {
        try {
          if (rememberMe) localStorage.setItem("rememberedEmail", email.trim());
          else localStorage.removeItem("rememberedEmail");
        } catch {
          /* Authentication does not depend on browser storage. */
        }
        window.location.assign(destination);
      } else setError(loginError(""));
    } catch {
      setError(
        vi
          ? "Đã xảy ra lỗi kết nối với máy chủ. Vui lòng thử lại."
          : "The connection failed. Please try again.",
      );
    } finally {
      submitting.current = false;
      setLoading(false);
    }
  };
  const handleGoogle = async () => {
    if (busy) return;
    setGoogleLoading(true);
    setError("");
    try {
      await signIn("google", { callbackUrl: destination });
    } catch {
      setError(
        vi
          ? "Chưa thể kết nối với Google. Vui lòng thử lại."
          : "Unable to connect to Google. Please try again.",
      );
    } finally {
      setGoogleLoading(false);
    }
  };
  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <aside
          className={styles.story}
          aria-label={
            vi
              ? "Cộng đồng Vietnam ParaSports"
              : "The Vietnam ParaSports community"
          }
        >
          <Image
            src="/wp169/wp1.jpg"
            alt=""
            fill
            priority
            sizes="(max-width: 767px) 1px, 50vw"
            className={styles.storyImage}
          />
          <div className={styles.storyShade} />
          <Link
            href={`/${locale}`}
            className={styles.brand}
            aria-label={
              vi ? "Trang chủ Vietnam ParaSports" : "Vietnam ParaSports home"
            }
          >
            <Image
              src="/assets/brand/vietnam-parasports-2026-full.png"
              alt="Vietnam ParaSports"
              width={168}
              height={68}
            />
          </Link>
          <div className={styles.storyCopy}>
            <p className={styles.eyebrow}>Vietnam ParaSports · Community</p>
            <h2>
              {vi ? (
                <>
                  Một cộng đồng.
                  <br />
                  Nhiều cơ hội.
                </>
              ) : (
                <>
                  One community.
                  <br />
                  More possibilities.
                </>
              )}
            </h2>
            <p>
              {vi
                ? "Kết nối cùng vận động viên, huấn luyện viên và những người đồng hành. Tiếp tục hành trình thể thao theo cách của bạn."
                : "Connect with athletes, coaches and supporters. Continue your sporting journey in your own way."}
            </p>
            <span className={styles.storyFooter}>
              <span />
              {vi
                ? "Cùng kết nối. Cùng tiến xa."
                : "Connect. Support. Grow together."}
            </span>
          </div>
        </aside>
        <section className={styles.formSide} aria-labelledby="login-heading">
          <Link href={`/${locale}`} className={styles.back}>
            <ArrowLeft size={14} />
            {vi ? "Về trang chủ" : "Back to home"}
          </Link>
          <div className={styles.formContent}>
            <span className={styles.headingIcon}>
              {show2FA ? (
                <ShieldCheck size={22} strokeWidth={1.5} />
              ) : (
                <KeyRound size={22} strokeWidth={1.5} />
              )}
            </span>
            <p className={styles.formEyebrow}>
              {show2FA
                ? vi
                  ? "Bảo mật tài khoản"
                  : "Account security"
                : vi
                  ? "Chào mừng trở lại"
                  : "Welcome back"}
            </p>
            <h1 id="login-heading">
              {show2FA
                ? vi
                  ? "Xác thực tài khoản"
                  : "Verify your account"
                : vi
                  ? "Đăng nhập"
                  : "Sign in"}
            </h1>
            <p className={styles.intro}>
              {show2FA
                ? vi
                  ? "Nhập mã bảo mật 6 số từ ứng dụng xác thực để tiếp tục."
                  : "Enter the six-digit code from your authenticator app to continue."
                : vi
                  ? "Tiếp tục kết nối và khám phá cùng Vietnam ParaSports."
                  : "Stay connected and explore more with Vietnam ParaSports."}
            </p>
            {error && (
              <div
                ref={errorRef}
                tabIndex={-1}
                role="alert"
                className={styles.error}
              >
                <CircleAlert size={17} />
                <p>{error}</p>
              </div>
            )}
            <form onSubmit={handleSubmit} noValidate aria-busy={loading}>
              <fieldset disabled={busy} className={styles.fields}>
                {!show2FA ? (
                  <>
                    <div className={styles.field}>
                      <label htmlFor="login-email">Email</label>
                      <div
                        className={styles.inputWrap}
                        data-invalid={!!fieldErrors.email}
                      >
                        <Mail size={17} />
                        <input
                          ref={emailRef}
                          id="login-email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          required
                          placeholder="name@example.com"
                          value={email}
                          onChange={(event) => setEmail(event.target.value)}
                          aria-invalid={!!fieldErrors.email}
                          aria-describedby={
                            fieldErrors.email ? "login-email-error" : undefined
                          }
                        />
                      </div>
                      {fieldErrors.email && (
                        <p className={styles.fieldError} id="login-email-error">
                          {fieldErrors.email}
                        </p>
                      )}
                    </div>
                    <div className={styles.field}>
                      <div className={styles.labelRow}>
                        <label htmlFor="login-password">
                          {vi ? "Mật khẩu" : "Password"}
                        </label>
                        <Link href={`/${locale}/forgot-password`}>
                          {vi ? "Quên mật khẩu?" : "Forgot password?"}
                        </Link>
                      </div>
                      <div
                        className={styles.inputWrap}
                        data-invalid={!!fieldErrors.password}
                      >
                        <LockKeyhole size={17} />
                        <input
                          ref={passwordRef}
                          id="login-password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          autoComplete="current-password"
                          required
                          placeholder={
                            vi ? "Nhập mật khẩu của bạn" : "Enter your password"
                          }
                          value={password}
                          onChange={(event) => setPassword(event.target.value)}
                          aria-invalid={!!fieldErrors.password}
                          aria-describedby={
                            fieldErrors.password
                              ? "login-password-error"
                              : undefined
                          }
                        />
                        <button
                          type="button"
                          className={styles.passwordToggle}
                          onClick={() => setShowPassword((value) => !value)}
                          aria-label={
                            showPassword
                              ? vi
                                ? "Ẩn mật khẩu"
                                : "Hide password"
                              : vi
                                ? "Hiện mật khẩu"
                                : "Show password"
                          }
                          aria-pressed={showPassword}
                        >
                          {showPassword ? (
                            <EyeOff size={17} />
                          ) : (
                            <Eye size={17} />
                          )}
                        </button>
                      </div>
                      {fieldErrors.password && (
                        <p
                          className={styles.fieldError}
                          id="login-password-error"
                        >
                          {fieldErrors.password}
                        </p>
                      )}
                    </div>
                    <label className={styles.remember}>
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(event) =>
                          setRememberMe(event.target.checked)
                        }
                      />
                      <span>{vi ? "Ghi nhớ email" : "Remember my email"}</span>
                    </label>
                  </>
                ) : (
                  <div className={styles.field}>
                    <label htmlFor="login-token">
                      {vi ? "Mã xác thực 2FA" : "Authentication code"}
                    </label>
                    <input
                      ref={tokenRef}
                      id="login-token"
                      name="totpToken"
                      className={styles.token}
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      minLength={6}
                      maxLength={6}
                      pattern="[0-9]{6}"
                      required
                      placeholder="000000"
                      value={totpToken}
                      onChange={(event) =>
                        setTotpToken(event.target.value.replace(/\D/g, ""))
                      }
                      aria-invalid={!!fieldErrors.token}
                      aria-describedby={
                        fieldErrors.token
                          ? "login-token-error"
                          : "login-token-help"
                      }
                    />
                    {fieldErrors.token ? (
                      <p id="login-token-error" className={styles.fieldError}>
                        {fieldErrors.token}
                      </p>
                    ) : (
                      <p id="login-token-help" className={styles.tokenHelp}>
                        {vi
                          ? "Mã thay đổi định kỳ trong ứng dụng xác thực của bạn."
                          : "Your authenticator app generates a new code periodically."}
                      </p>
                    )}
                  </div>
                )}
                <button type="submit" className={styles.submit}>
                  {loading ? (
                    <>
                      <Loader2 size={17} className={styles.spinner} />
                      {vi ? "Đang xác thực…" : "Verifying…"}
                    </>
                  ) : (
                    <>
                      {show2FA
                        ? vi
                          ? "Xác nhận mã"
                          : "Verify code"
                        : vi
                          ? "Đăng nhập"
                          : "Sign in"}
                      <ArrowRight size={17} />
                    </>
                  )}
                </button>
              </fieldset>
            </form>
            {!show2FA && googleEnabled && (
              <>
                <div className={styles.divider}>
                  <span>{vi ? "hoặc tiếp tục với" : "or continue with"}</span>
                </div>
                <button
                  type="button"
                  className={styles.google}
                  onClick={handleGoogle}
                  disabled={busy}
                >
                  {googleLoading ? (
                    <Loader2 size={17} className={styles.spinner} />
                  ) : (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        fill="#EA4335"
                      />
                    </svg>
                  )}
                  {vi ? "Đăng nhập bằng Google" : "Sign in with Google"}
                </button>
              </>
            )}
            <div className={styles.formFooter}>
              {show2FA ? (
                <button
                  className={styles.backToLogin}
                  disabled={busy}
                  onClick={() => {
                    setShow2FA(false);
                    setTotpToken("");
                    setError("");
                    setFieldErrors({});
                  }}
                >
                  <ArrowLeft size={14} />
                  {vi ? "Quay lại đăng nhập" : "Back to sign in"}
                </button>
              ) : (
                <p>
                  {vi ? "Chưa có tài khoản?" : "New to ParaSports?"}{" "}
                  <Link href={`/${locale}/register`}>
                    {vi ? "Đăng ký ngay" : "Create an account"}
                    <ArrowRight size={13} />
                  </Link>
                </p>
              )}
            </div>
            <p className={styles.securityNote}>
              <ShieldCheck size={13} />
              {vi
                ? "Chỉ đăng nhập trên thiết bị bạn tin cậy."
                : "Use a device you trust to access your account."}
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
