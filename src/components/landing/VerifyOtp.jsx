import { useState, useEffect } from "react";
import { Pencil } from "lucide-react";
import toast from "react-hot-toast"

const VerifyOtp = ({ setOpenVerify, mobile, setIsCheckoutModalOpen, resend }) => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
 const [timer, setTimer] = useState(60);

  const handleChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

 

useEffect(() => {
  if (timer === 0) return;

  const interval = setInterval(() => {
    setTimer((prev) => prev - 1);
  }, 1000);

  return () => clearInterval(interval);
}, [timer]);

  const Verify = async () => {
    const enteredOtp = otp.join("");

    if (enteredOtp.length !== 6) {
      toast.error("Please enter a 6-digit OTP.")
      setError("Please enter a 6-digit OTP.");
      return;
    }
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone: mobile, otp: enteredOtp }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("OTP verified successfully")
        console.log("OTP verified successfully");
        setOpenVerify(false);
        setIsCheckoutModalOpen(true);
      } else {
        setError(data.message || "Invalid OTP. Please try again.");
      }
    } catch (err) {
      toast.success("OTP sent successfully")
      console.error("Error verifying OTP:", err);
      setError("Something went wrong. Please try again.");
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      document.getElementById(`otp-${index - 1}`).focus();
    }
  };

  return (
    <div className="min-h-screen  flex justify-center items-center bg-gray-100 px-4">
      <div className="sm:max-w-md w-full  bg-white rounded-lg shadow border">

        <div className="p-5">

          <p className="text-gray-700 text-sm mb-3">
            Enter the OTP sent to
          </p>

          <div className="flex items-center gap-2 mb-6">
            <span className="font-medium text-gray-900">
              +91 {mobile}
            </span>

            <button onClick={() => setOpenVerify(false)}>
              <Pencil size={16} className="text-gray-600" />
            </button>
          </div>

          <div className="flex justify-between gap-3">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="sm:h-14 sm:w-14 h-12 w-12 rounded border border-gray-300 text-center text-xl font-semibold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
            ))}
          </div>

          {error && (
            <p className="text-red-500 text-xs mt-3">{error}</p>
          )}

          {/* <button
            onClick={Verify}
            disabled={otp.join("").length !== 6}
            className={`mt-6 w-full h-12 rounded-md font-medium transition ${
              otp.join("").length === 6
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            Verify OTP
          </button> */}
          <button
              onClick={Verify}
              disabled={otp.join("").length !== 6 || timer === 0}
              className={`mt-6 w-full h-12 rounded-md font-medium transition ${
                otp.join("").length === 6 && timer > 0
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              Verify OTP
            </button>

                    {timer > 0 ? (
                <p className="text-sm text-gray-500">
                  Resend OTP in <span className="font-medium">{timer}s</span>
                </p>
              ) : (
                <button
                  onClick={() => {
                    resend();
                    setTimer(60);
                    setOtp(["", "", "", "", "", ""]); // OTP boxes clear
                    setError("");
                  }}
                  className="text-blue-600 font-medium hover:underline"
                >
                  Resend OTP
                </button>
              )}

        </div>

        <div className="border-t px-5 py-3">
          <p className="text-[11px] text-gray-400 leading-5">
            By proceeding, you consent to sharing your phone
            number with us. Read more
          </p>
        </div>

      </div>
    </div>
  );
};

export default VerifyOtp;