exports.generateOTP = (limit) => {
  const digits = "0123456789";
  let OTP = "";

  for (let i = 0; i < limit; i++) {
    OTP += digits[Math.floor(Math.random() * digits.length)];
  }

  return OTP;
};
