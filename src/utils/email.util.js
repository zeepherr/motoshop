import { resolveMx } from "node:dns/promises";
import nodeMailer from "nodemailer";
import { config } from "../config";

export const hashValidMailDomain = async (email) => {
  // check real email or not ?
  const domain = email.split("@")[1];
  if (!domain) {
    return false;
  }
  try {
    const records = await resolveMx(domain); //mx stands for email exchange record
    return (
      records.length > 0 &&
      records.some((record) => record.exchange && record.exchange !== ".")
    );
  } catch {
    return false;
  }
};

//otp sender

const transporter = nodeMailer.createTransport({
  service: "gmail",
  auth: {
    user: config.mail_user,
    pass: config.mail_app_password,
  },
});

export const sendRegistrationOtp = async (email, otp) => {
  return transporter.sendMail({
    from: `"HrungMoto" <${config.mail_user}>`,

    to: email,

    subject: "Verify your email address",

    text: [
      `Your verification code is ${otp}.`,
      "",
      `This code will expire in ${OTP_EXPIRES_MINUTES} minutes.`,
      "",
      "If you did not request this registration, you can ignore this email.",
    ].join("\n"),

    html: `
      <h2>Email Verification</h2>

      <p>Your verification code is:</p>

      <h1>${otp}</h1>

      <p>
        This code will expire in
        <strong>${OTP_EXPIRES_MINUTES} minutes</strong>.
      </p>

      <p>
        If you did not request this registration,
        you can ignore this email.
      </p>
    `,
  });
};
