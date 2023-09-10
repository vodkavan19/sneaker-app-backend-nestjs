export const mailResetPasswordTemplate = (linkVerify) => {
  return `
    <div style="width: 75%; padding: 0 12px; margin: 0 auto;">
      <div style="padding: 12px 0; text-align: center; border-bottom: 1px solid #919eab99">
        <img src="https://res.cloudinary.com/dxtgn6q3g/image/upload/v1685434256/sneakerapp/assest/logo-main-light_y0kmlr.png" alt="" height="60" />        </div>
      <div style="margin-bottom: 12px;">
        <h2>The Sneak xin chào bạn!</h2>
        <p style="font-size: 16px;">Bạn vừa gửi yêu cầu thay đổi mật khẩu đăng nhập cho tài khoản của bạn.</p>
        <p style="font-size: 16px;">Vì lý do bảo mật, vui lòng nhấn xác minh để chúng tôi biết đó là bạn trước khi thay đổi mật khẩu.</p>
        <p style="font-size: 16px;">Mã xác minh này chỉ có hiệu lực trong <b>15 phút</b> kể từ khi bạn gửi yêu cầu.</p>
        <a 
            href=${linkVerify}
            style="display: block; padding: 12px 0; margin: 32px 0; background-color: #00ab55; color: white; text-align: center; text-decoration: none; border-radius: 8px"
        >
          XÁC MINH NGAY
        </a>
        </div>
        <div style="border-top: 1px solid #919eab99; text-align: center; padding: 12px">
          <div style="color: #919eab; font-size: 14px; margin-bottom: 4px;">THE SNEAK - Authentic Sneaker</div>
          <div style="color: #919eab; font-size: 14px; margin-bottom: 4px;">81, MTT, đường 3/2, phường Xuân Khánh, quận Ninh Kiều, Tp.Cần Thơ</div>
          <div style="color: #919eab; font-size: 14px">© Since 2023</div>
        </div>
      </div>
  `
}