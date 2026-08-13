export default function (identity) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^[0-9]{10,15}$/;
  let identityKey = "";
  if (emailRegex.test(identity)) {
    identityKey = "email";
  }
  if (phoneRegex.test(identity)) {
    identityKey = "phone";
  }
  return identityKey;
}
