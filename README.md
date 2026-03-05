***Thanh toán khóa học bằng Sandbox VNPay***

**Cần có ngrok: Dùng để tạo tunnel cho VNPay gọi IPN về máy cá nhân.**

1. Tải ngrok: **ngrok.com**
   <img width="1267" height="829" alt="image" src="https://github.com/user-attachments/assets/d741d50e-c602-4dc3-a488-f896941eaef4" />

3. Mở terminal (CMD, PowerShell hoặc Git Bash) tại thư mục chứa file ngrok và chạy lệnh (chỉ cần chạy 1 lần đầu tiên): **ngrok config add-authtoken <MÃ_TOKEN_CỦA_BẠN>** (Mã Token lấy được trong trang ngrok.com sau khi đăng nhập)
   <img width="2212" height="992" alt="image" src="https://github.com/user-attachments/assets/7d9934ab-09db-40bd-b742-94bf824d2a5b" />
4. Chạy lệnh: **ngrok http 5000**
   (5000 là port của nodejs)
5. Sau khi chạy sẽ được đống thông tin. Chú ý dòng: **Forwarding** https://creola-lignivorous-seriously.ngrok-free.dev -> http://localhost:5000. Copy dòng **https://creola-lignivorous-seriously.ngrok-free.dev**

 **File .env ở server thêm vào:**
VNP_TMN_CODE=QSGQ1EJ5
VNP_HASH_SECRET=SV5BUKNGH1A9AALP0I6IGK9L0G6FTG7L
VNP_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNP_RETURN_URL=**https://creola-lignivorous-seriously.ngrok-free.dev**/api/payments/vnpay-return => thay dòng in đậm bằng dòng đã copy trên bước 4
VNP_IPN_URL=**https://creola-lignivorous-seriously.ngrok-free.dev**/api/payments/vnpay-ipn => thay dòng in đậm bằng dòng đã copy trên bước 4
CLIENT_URL=http://localhost:5173

**Tài khoản VNPay**
Ngân hàng:	**NCB**
Số thẻ:	**9704198526191432198**
Tên chủ thẻ:	**NGUYEN VAN A**
Ngày phát hành:	**07/15**
Mật khẩu OTP:	**123456**
