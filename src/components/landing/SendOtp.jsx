import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast"
const SendOtp = ({ setOpenVerify, setOpenSend, setMobile: setMobileForParent }) => {
  const [mobile, setMobile] = useState("");
  const [error, setError] = useState("");
  const [notify, setNotify] = useState(true);

  const handleChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");

    if (value.length <= 10) {
      setMobile(value);

      if (value.length === 0) {
        setError("Mobile number is required.");
      } else if (!/^[6-9]\d{9}$/.test(value)) {
        setError("Enter a valid 10-digit mobile number.");
      } else {
        setError("");
      }
    }
  };

  const handleSubmit = async () => {
    if (!mobile) {
      toast.error("Mobile number is required")
      setError("Mobile number is required.");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(mobile)) {
      toast.error("Enter a valid 10-digit mobile number.")
      setError("Enter a valid 10-digit mobile number.");
      return;
    }
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/send-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ mobile }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("OTP sent successfully")
        console.log("OTP sent successfully");
        if (setMobileForParent) setMobileForParent(mobile);
        setOpenSend(false);
        setOpenVerify(true);
      } else {
        setError(data.message || "Failed to send OTP. Please try again.");
      }
    } catch (err) {
      console.error("Error sending OTP:", err);
      setError("Failed to send OTP. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-lg border shadow-sm p-4">

        <h2 className="text-sm font-medium text-gray-700 mb-4">
          Enter your mobile number to continue.
        </h2>

        <div className="flex border rounded-md overflow-hidden">
          <input
            type="text"
            inputMode="numeric"
            placeholder="Mobile Number"
            value={mobile}
            onChange={handleChange}
            className="w-full px-4 py-3 outline-none text-lg"
          />

          <button
            onClick={handleSubmit}
            disabled={!/^[6-9]\d{9}$/.test(mobile)}
            className={`w-32 font-medium transition ${
              /^[6-9]\d{9}$/.test(mobile)
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            Next
          </button>
        </div>

        {error && (
          <p className="text-red-500 text-xs mt-2">
            {error}
          </p>
        )}

        <label className="flex items-center gap-2 mt-4 cursor-pointer">
          <input
            type="checkbox"
            checked={notify}
            onChange={() => setNotify(!notify)}
            className="hidden"
          />

          <CheckCircle2
            size={18}
            className={notify ? "text-gray-500 fill-gray-500" : "text-gray-300"}
          />

          <span className="text-sm text-gray-700">
            Notify me on orders &amp; offers
          </span>
        </label>
      </div>
    </div>
  );
};

export default SendOtp;