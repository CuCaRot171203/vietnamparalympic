"use client";

import { apiClient } from "@/lib/api-client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import AuthShell from "@/components/AuthShell";
import styles from "../login/login.module.css";
import Link from "next/link";
import {
  Mail,
  Lock,
  User,
  Phone,
  Calendar,
  Users,
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { z } from "zod";

const registerValidation = z.object({
  fullName: z.string().min(1, "Vui lòng nhập họ tên"),
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(8, "Mật khẩu tối thiểu 8 ký tự"),
});

export default function RegisterPage() {
  const locale = useLocale();
  const vi = locale === "vi";
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("MALE");
  const [role, setRole] = useState("USER");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError("");
    setFieldErrors({});

    const validation = registerValidation.safeParse({
      fullName,
      email,
      password,
    });
    if (!validation.success) {
      const errors: Record<string, string> = {};
      validation.error.issues.forEach((err: any) => {
        if (err.path[0]) errors[err.path[0]] = err.message;
      });
      setFieldErrors(errors);
      return;
    }

    setLoading(true);

    try {
      const res = await apiClient.request("/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          password,
          phoneNumber,
          dob,
          gender,
          role,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "Đăng ký thất bại");
        return;
      }

      router.push("/" + locale + "/login?registered=true");
    } catch (err) {
      setError("Có lỗi xảy ra khi kết nối máy chủ");
    } finally {
      setLoading(false);
    }
  };

  const field = (
    id: string,
    label: string,
    type: string,
    value: string,
    change: (value: string) => void,
    Icon: typeof User,
    placeholder = "",
    errorKey?: string,
    autoComplete?: string,
  ) => (
    <div className={styles.field}>
      <label htmlFor={id}>{label}</label>
      <div
        className={styles.inputWrap}
        data-invalid={Boolean(errorKey && fieldErrors[errorKey])}
      >
        <Icon size={17} aria-hidden="true" />
        <input
          id={id}
          name={id}
          type={type}
          value={value}
          onChange={(event) => change(event.target.value)}
          placeholder={placeholder}
          required
          autoComplete={autoComplete}
          aria-invalid={Boolean(errorKey && fieldErrors[errorKey])}
          aria-describedby={
            errorKey && fieldErrors[errorKey] ? id + "-error" : undefined
          }
        />
      </div>
      {errorKey && fieldErrors[errorKey] && (
        <p className={styles.fieldError} id={id + "-error"}>
          {fieldErrors[errorKey]}
        </p>
      )}
    </div>
  );
  return (
    <AuthShell locale={locale} mode="register">
      <div className={styles.formContent}>
        <span className={styles.headingIcon}>
          <User size={22} aria-hidden="true" />
        </span>
        <p className={styles.formEyebrow}>
          {vi
            ? "Trở thành một phần của cộng đồng"
            : "Become part of the community"}
        </p>
        <h1>{vi ? "Đăng ký tài khoản" : "Create an account"}</h1>
        <p className={styles.intro}>
          {vi
            ? "Bắt đầu hành trình của bạn cùng Vietnam ParaSports."
            : "Start your journey with Vietnam ParaSports."}
        </p>
        {error && (
          <div className={styles.error} role="alert">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} aria-busy={loading}>
          <fieldset className={styles.fields} disabled={loading}>
            <div className={styles.registerGrid}>
              <div>
                <h2 className={styles.groupTitle}>
                  {vi ? "Thông tin tài khoản" : "Account details"}
                </h2>
                {field(
                  "register-fullname",
                  vi ? "Họ và tên" : "Full name",
                  "text",
                  fullName,
                  setFullName,
                  User,
                  vi ? "Họ tên của bạn" : "Your full name",
                  "fullName",
                  "name",
                )}
                {field(
                  "register-email",
                  "Email",
                  "email",
                  email,
                  setEmail,
                  Mail,
                  "name@example.com",
                  "email",
                  "email",
                )}
                <div className={styles.field}>
                  <label htmlFor="register-password">
                    {vi ? "Mật khẩu" : "Password"}
                  </label>
                  <div
                    className={styles.inputWrap}
                    data-invalid={Boolean(fieldErrors.password)}
                  >
                    <Lock size={17} aria-hidden="true" />
                    <input
                      id="register-password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      minLength={8}
                      required
                      placeholder={
                        vi ? "Tối thiểu 8 ký tự" : "At least 8 characters"
                      }
                      aria-invalid={Boolean(fieldErrors.password)}
                      aria-describedby={
                        fieldErrors.password
                          ? "register-password-error"
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
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                  {fieldErrors.password && (
                    <p
                      className={styles.fieldError}
                      id="register-password-error"
                    >
                      {fieldErrors.password}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <h2 className={styles.groupTitle}>
                  {vi ? "Hồ sơ cá nhân" : "Your profile"}
                </h2>
                {field(
                  "register-phone",
                  vi ? "Số điện thoại" : "Phone number",
                  "tel",
                  phoneNumber,
                  setPhoneNumber,
                  Phone,
                  vi ? "Số điện thoại liên hệ" : "Your phone number",
                  undefined,
                  "tel",
                )}
                <div className={styles.twoFields}>
                  {field(
                    "register-dob",
                    vi ? "Ngày sinh" : "Date of birth",
                    "date",
                    dob,
                    setDob,
                    Calendar,
                    "",
                    undefined,
                    "bday",
                  )}
                  <div className={styles.field}>
                    <label htmlFor="register-gender">
                      {vi ? "Giới tính" : "Gender"}
                    </label>
                    <div className={styles.inputWrap}>
                      <select
                        id="register-gender"
                        value={gender}
                        onChange={(event) => setGender(event.target.value)}
                      >
                        <option value="MALE">{vi ? "Nam" : "Male"}</option>
                        <option value="FEMALE">{vi ? "Nữ" : "Female"}</option>
                        <option value="OTHER">{vi ? "Khác" : "Other"}</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className={styles.field}>
                  <label htmlFor="register-role">
                    {vi ? "Vai trò trong cộng đồng" : "Community role"}
                  </label>
                  <div className={styles.inputWrap}>
                    <Users size={17} aria-hidden="true" />
                    <select
                      id="register-role"
                      value={role}
                      onChange={(event) => setRole(event.target.value)}
                    >
                      <option value="USER">
                        {vi ? "Thành viên" : "Member"}
                      </option>
                      <option value="ATHLETE">
                        {vi ? "Vận động viên khuyết tật" : "Para athlete"}
                      </option>
                      <option value="COACH">
                        {vi
                          ? "Huấn luyện viên / Giảng viên"
                          : "Coach / Instructor"}
                      </option>
                      <option value="ASSISTANT">
                        {vi ? "Người hỗ trợ chuyên môn" : "Sport assistant"}
                      </option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <button type="submit" className={styles.submit}>
              {loading ? (
                <>
                  <Loader2 size={17} className={styles.spinner} />
                  {vi ? "Đang tạo tài khoản..." : "Creating account..."}
                </>
              ) : (
                <>
                  {vi ? "Đăng ký tài khoản" : "Create account"}
                  <ArrowRight size={17} aria-hidden="true" />
                </>
              )}
            </button>
          </fieldset>
        </form>
        <div className={styles.formFooter}>
          <p>
            {vi ? "Đã có tài khoản?" : "Already a member?"}{" "}
            <Link href={"/" + locale + "/login"}>
              {vi ? "Đăng nhập ngay" : "Sign in"}
              <ArrowRight size={13} aria-hidden="true" />
            </Link>
          </p>
        </div>
      </div>
    </AuthShell>
  );
}
