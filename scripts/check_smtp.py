#!/usr/bin/env python3
"""Check SMTP authentication without sending a message or printing secrets."""
import os
import smtplib
import ssl
import sys


def main():
    host = os.environ.get("TRAVELAI_SMTP_HOST", "smtp.gmail.com")
    stage = "đọc cấu hình"
    server = None
    try:
        port = int(os.environ.get("TRAVELAI_SMTP_PORT", "587"))
        username = os.environ["TRAVELAI_SMTP_USERNAME"]
        password = os.environ["TRAVELAI_SMTP_PASSWORD"]
        stage = "kết nối"
        server = smtplib.SMTP(host, port, timeout=10)
        stage = "thiết lập TLS"
        server.starttls(context=ssl.create_default_context())
        stage = "xác thực"
        server.login(username, password)
    except smtplib.SMTPAuthenticationError as error:
        print("Gmail từ chối đăng nhập. Hãy kiểm tra Gmail gửi thư và tạo mật khẩu ứng dụng mới.", file=sys.stderr)
        print(f"Giai đoạn: {stage}; mã SMTP: {error.smtp_code}.", file=sys.stderr)
        return 1
    except (OSError, ValueError, KeyError, smtplib.SMTPException) as error:
        print("Không kết nối được máy chủ gửi thư an toàn. Kiểm tra mạng và cấu hình SMTP.", file=sys.stderr)
        print(f"Giai đoạn: {stage}; loại lỗi: {type(error).__name__}.", file=sys.stderr)
        return 1
    finally:
        if server is not None:
            try:
                server.close()
            except OSError:
                pass
    print("Đăng nhập máy chủ gửi thư thành công. Chưa gửi email nào.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
