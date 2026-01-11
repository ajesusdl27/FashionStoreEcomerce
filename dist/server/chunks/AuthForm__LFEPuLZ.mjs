import { jsxs, jsx } from 'react/jsx-runtime';
import { useState } from 'react';
import { s as supabase } from './supabase_CyPcJWDY.mjs';

function AuthForm({ mode, redirectTo = "/cuenta" }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const isRegister = mode === "register";
  const isAdminLogin = mode === "admin-login";
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      if (isRegister) {
        if (password !== confirmPassword) {
          setError("Las contraseñas no coinciden");
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setError("La contraseña debe tener al menos 6 caracteres");
          setLoading(false);
          return;
        }
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name
            }
          }
        });
        if (signUpError) {
          setError(signUpError.message);
          setLoading(false);
          return;
        }
        if (data.session) {
          const response = await fetch("/api/auth/set-session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              access_token: data.session.access_token,
              refresh_token: data.session.refresh_token
            })
          });
          if (response.ok) {
            setSuccess("¡Cuenta creada! Redirigiendo...");
            setTimeout(() => {
              window.location.href = redirectTo;
            }, 1500);
          } else {
            setError("Error al establecer la sesión");
          }
        } else {
          setSuccess("¡Revisa tu email para confirmar tu cuenta!");
        }
      } else {
        const formData = new FormData();
        formData.append("email", email);
        formData.append("password", password);
        formData.append("redirectTo", isAdminLogin ? "/admin" : redirectTo);
        const response = await fetch("/api/auth/login", {
          method: "POST",
          body: formData
        });
        const result = await response.json();
        if (!response.ok) {
          setError(result.error || "Error al iniciar sesión");
          setLoading(false);
          return;
        }
        setSuccess("¡Bienvenido! Redirigiendo...");
        setTimeout(() => {
          window.location.href = result.redirectTo;
        }, 1e3);
      }
    } catch (err) {
      setError("Error de conexión. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [
    isRegister && /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx(
        "label",
        {
          htmlFor: "name",
          className: "block text-sm font-medium text-muted-foreground mb-2",
          children: "Nombre completo"
        }
      ),
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "text",
          id: "name",
          value: name,
          onChange: (e) => setName(e.target.value),
          required: true,
          className: "w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground transition-all duration-300\r\n              placeholder:text-muted-foreground\r\n              focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary\r\n              hover:border-muted-foreground",
          placeholder: "Tu nombre"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsxs(
        "label",
        {
          htmlFor: "email",
          className: "block text-sm font-medium text-muted-foreground mb-2",
          children: [
            "Email ",
            /* @__PURE__ */ jsx("span", { className: "text-accent", children: "*" })
          ]
        }
      ),
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "email",
          id: "email",
          value: email,
          onChange: (e) => setEmail(e.target.value),
          required: true,
          className: "w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground transition-all duration-300\r\n            placeholder:text-muted-foreground\r\n            focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary\r\n            hover:border-muted-foreground",
          placeholder: "tu@email.com"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsxs(
        "label",
        {
          htmlFor: "password",
          className: "block text-sm font-medium text-muted-foreground mb-2",
          children: [
            "Contraseña ",
            /* @__PURE__ */ jsx("span", { className: "text-accent", children: "*" })
          ]
        }
      ),
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "password",
          id: "password",
          value: password,
          onChange: (e) => setPassword(e.target.value),
          required: true,
          minLength: 6,
          className: "w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground transition-all duration-300\r\n            placeholder:text-muted-foreground\r\n            focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary\r\n            hover:border-muted-foreground",
          placeholder: "••••••••"
        }
      )
    ] }),
    isRegister && /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsxs(
        "label",
        {
          htmlFor: "confirmPassword",
          className: "block text-sm font-medium text-muted-foreground mb-2",
          children: [
            "Confirmar contraseña ",
            /* @__PURE__ */ jsx("span", { className: "text-accent", children: "*" })
          ]
        }
      ),
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "password",
          id: "confirmPassword",
          value: confirmPassword,
          onChange: (e) => setConfirmPassword(e.target.value),
          required: true,
          minLength: 6,
          className: "w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground transition-all duration-300\r\n              placeholder:text-muted-foreground\r\n              focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary\r\n              hover:border-muted-foreground",
          placeholder: "••••••••"
        }
      )
    ] }),
    error && /* @__PURE__ */ jsx("div", { className: "p-4 bg-accent/10 border border-accent/50 rounded-lg text-accent text-sm animate-fade-in", children: error }),
    success && /* @__PURE__ */ jsx("div", { className: "p-4 bg-primary/10 border border-primary/50 rounded-lg text-primary text-sm animate-fade-in", children: success }),
    /* @__PURE__ */ jsx(
      "button",
      {
        type: "submit",
        disabled: loading,
        className: "w-full inline-flex items-center justify-center font-heading tracking-wider\r\n          px-6 py-4 text-base\r\n          bg-primary text-primary-foreground \r\n          hover:shadow-[0_0_20px_rgba(204,255,0,0.4)] hover:scale-[1.02]\r\n          active:scale-[0.98]\r\n          transition-all duration-300 touch-target\r\n          focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary\r\n          disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
        children: loading ? /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxs("svg", { className: "animate-spin h-5 w-5", viewBox: "0 0 24 24", children: [
            /* @__PURE__ */ jsx(
              "circle",
              {
                className: "opacity-25",
                cx: "12",
                cy: "12",
                r: "10",
                stroke: "currentColor",
                strokeWidth: "4",
                fill: "none"
              }
            ),
            /* @__PURE__ */ jsx(
              "path",
              {
                className: "opacity-75",
                fill: "currentColor",
                d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              }
            )
          ] }),
          isRegister ? "Registrando..." : "Iniciando sesión..."
        ] }) : isRegister ? "CREAR CUENTA" : "INICIAR SESIÓN"
      }
    )
  ] });
}

export { AuthForm as A };
