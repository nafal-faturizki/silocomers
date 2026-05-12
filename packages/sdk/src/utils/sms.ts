import { sendOtp } from './otp'

const TWILIO_SID = process.env.TWILIO_ACCOUNT_SID
const TWILIO_TOKEN = process.env.TWILIO_AUTH_TOKEN
const TWILIO_FROM = process.env.TWILIO_FROM || '+10000000000'

export async function sendSmsOtp(to: string) {
  // For dev: use file-backed OTP and log the code. If Twilio credentials provided, placeholder for real call.
  const code = sendOtp(to)
  if (TWILIO_SID && TWILIO_TOKEN) {
    // Placeholder: in production, call Twilio API here.
    // eslint-disable-next-line no-console
    console.log(`(Twilio) send ${code} to ${to} from ${TWILIO_FROM}`)
  } else {
    // eslint-disable-next-line no-console
    console.log(`(mock SMS) OTP for ${to}: ${code}`)
  }
  return code
}
