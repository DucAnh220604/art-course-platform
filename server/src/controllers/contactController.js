const ContactMessage = require("../models/ContactMessage");
const nodemailer = require("nodemailer");

const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

exports.sendContactMessage = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng điền đầy đủ thông tin",
      });
    }

    const contactMessage = await ContactMessage.create({
      name,
      email,
      message,
      user: req.user?._id || null,
    });

    res.status(201).json({
      success: true,
      message: "Gửi tin nhắn thành công",
      data: contactMessage,
    });
  } catch (error) {
    console.error("Send contact message error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
};

exports.getAllContactMessages = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const query = {};
    if (status && status !== "all") {
      query.status = status;
    }

    const totalMessages = await ContactMessage.countDocuments(query);
    const messages = await ContactMessage.find(query)
      .populate("user", "username email avatar")
      .populate("reply.repliedBy", "username email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: {
        messages,
        pagination: {
          total: totalMessages,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(totalMessages / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get contact messages error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
};

exports.getContactMessageById = async (req, res) => {
  try {
    const message = await ContactMessage.findById(req.params.id)
      .populate("user", "username email avatar")
      .populate("reply.repliedBy", "username email");

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy tin nhắn",
      });
    }

    res.json({
      success: true,
      data: message,
    });
  } catch (error) {
    console.error("Get contact message error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
};

exports.replyContactMessage = async (req, res) => {
  try {
    const { replyContent } = req.body;

    if (!replyContent) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập nội dung phản hồi",
      });
    }

    const message = await ContactMessage.findById(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy tin nhắn",
      });
    }

    const transporter = createTransporter();

    const mailOptions = {
      from: `"ArtKids Support" <${process.env.EMAIL_USER}>`,
      to: message.email,
      subject: `Phản hồi từ ArtKids - Re: Tin nhắn của bạn`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #38bdf8, #14b8a6); padding: 20px; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">ArtKids</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0;">Trung tâm dạy vẽ cho trẻ em</p>
          </div>
          
          <div style="background: #f8fafc; padding: 30px; border: 1px solid #e2e8f0;">
            <h2 style="color: #0f172a; margin-top: 0;">Xin chào ${message.name},</h2>
            
            <p style="color: #64748b;">Cảm ơn bạn đã liên hệ với chúng tôi. Dưới đây là phản hồi cho tin nhắn của bạn:</p>
            
            <div style="background: #e0f2fe; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0ea5e9;">
              <p style="color: #0369a1; margin: 0; font-style: italic;">"${message.message}"</p>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0;">
              <h3 style="color: #0f172a; margin-top: 0;">Phản hồi:</h3>
              <p style="color: #334155; line-height: 1.6;">${replyContent}</p>
            </div>
            
            <p style="color: #64748b; margin-top: 20px;">
              Nếu bạn có thêm câu hỏi, đừng ngần ngại liên hệ lại với chúng tôi nhé!
            </p>
            
            <p style="color: #64748b;">
              Trân trọng,<br/>
              <strong style="color: #0f172a;">Đội ngũ ArtKids</strong>
            </p>
          </div>
          
          <div style="background: #0f172a; padding: 20px; border-radius: 0 0 10px 10px; text-align: center;">
            <p style="color: #94a3b8; margin: 0; font-size: 14px;">
              © 2024 ArtKids. All rights reserved.
            </p>
            <p style="color: #64748b; margin: 10px 0 0 0; font-size: 12px;">
              123 Nguyễn Huệ, Q.1, TP.HCM | 0909 123 456
            </p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    message.status = "replied";
    message.reply = {
      content: replyContent,
      repliedBy: req.user._id,
      repliedAt: new Date(),
    };
    await message.save();

    res.json({
      success: true,
      message: "Phản hồi thành công",
      data: message,
    });
  } catch (error) {
    console.error("Reply contact message error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi gửi email phản hồi. Vui lòng kiểm tra cấu hình email.",
    });
  }
};

exports.updateMessageStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["pending", "replied", "closed"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Trạng thái không hợp lệ",
      });
    }

    const message = await ContactMessage.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true },
    );

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy tin nhắn",
      });
    }

    res.json({
      success: true,
      message: "Cập nhật trạng thái thành công",
      data: message,
    });
  } catch (error) {
    console.error("Update message status error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
};

exports.deleteContactMessage = async (req, res) => {
  try {
    const message = await ContactMessage.findByIdAndDelete(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy tin nhắn",
      });
    }

    res.json({
      success: true,
      message: "Xóa tin nhắn thành công",
    });
  } catch (error) {
    console.error("Delete contact message error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
};
