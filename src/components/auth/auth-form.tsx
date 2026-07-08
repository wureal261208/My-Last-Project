"use client";

import { useState } from "react";
import { Mail, UserPlus } from "lucide-react";
import { login, loginWithGoogle, register } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function AuthForm() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [message, setMessage] = useState("");

  async function submit(formData: FormData) {
    const email = String(formData.get("email"));
    const password = String(formData.get("password"));
    const name = String(formData.get("name") || "Reader");

    try {
      if (mode === "register") await register(email, password, name);
      else await login(email, password);
      setMessage("Đăng nhập thành công.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Có lỗi xảy ra.");
    }
  }

  return (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <CardTitle>{mode === "login" ? "Đăng nhập" : "Tạo tài khoản"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={submit} className="space-y-3">
          {mode === "register" && <Input name="name" placeholder="Tên hiển thị" />}
          <Input name="email" type="email" placeholder="Email" required />
          <Input name="password" type="password" placeholder="Mật khẩu" required />
          <Button className="w-full">
            <Mail className="size-4" />
            {mode === "login" ? "Đăng nhập" : "Đăng ký"}
          </Button>
        </form>

        <Button className="mt-3 w-full" variant="outline" onClick={() => loginWithGoogle()}>
          <UserPlus className="size-4" />
          Google login
        </Button>

        <Button className="mt-3 w-full" variant="ghost" onClick={() => setMode(mode === "login" ? "register" : "login")}>
          {mode === "login" ? "Chưa có tài khoản?" : "Đã có tài khoản?"}
        </Button>

        {message && <p className="mt-3 text-sm text-muted-foreground">{message}</p>}
      </CardContent>
    </Card>
  );
}
