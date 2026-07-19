
import api from "../services/api"
import React, { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useCart } from "../context/CartContext";

const PaymentGateway = () => {
  const { clearCart } = useCart();
  const [totall, setTotal]  = useState(0); 
  const [subTotal, setSubTotal] = useState(0);
  const [gst, setGst] = useState(0); 
  const [orderId, setOrderId] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  let { items, subtotal, total, orderData } = location.state || {};

  const loadRazorpay = () => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  };

  useEffect(() => {
    loadRazorpay();
    if (!items || items.length === 0) {
      navigate('/');
    }
  }, [items, navigate]);

  const makePayment = async () => {
    try {
      setLoading(true);
      const res = await api.post(`/payment/create-order`, {
        amount: Number(totall),
        currency: "INR",
        orderData
      }, {withCredentials: true});

      let { order, localOrderId } = res.data;
      setOrderId(order.id);
      
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY || "YOUR_TEST_KEY", // Will use from env if available
        amount: order.amount,
        currency: "INR",
        name: "Brunati",
        description: "Order Payment",
        order_id: order.id,
        handler: async function (response) {
          try {
            const verify = await api.post(`/payment/verify-payment`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              localOrderId,
            });
            
            if (verify.data.success) {
              toast.success("Payment successful! Order placed.");
              clearCart();
              navigate("/"); // Or order success page
            } else {
              toast.error("Payment verification failed.");
              navigate("/");
            }
          } catch (error) {
            toast.error("Error verifying payment.");
            navigate("/");
          }
        },
        theme: {
          color: "#11daac",
        },
        modal: {
            ondismiss: function() {
                setLoading(false);
                toast.error("Payment cancelled");
            }
        }
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      setLoading(false);
      toast.error(error.response?.data?.message || error?.message ||  "Failed to initiate payment");
    }
  };

  useEffect(() => {
    if (items) {
      const amount = items.reduce((totalAmount, item) => {
        return totalAmount + Number(item.price) * Number(item.quantity);
      }, 0); 
      
      let amt = amount * 0.18;
      setGst(amt);
      
      // Calculate final total including delivery if < 500
      let finalTotal = amount + amt;
      if (amount <= 500) {
        finalTotal += 100;
      }
      
      setSubTotal(amount);
      setTotal(Number(finalTotal.toFixed(0)));
    }
  }, [items]);

  if (!items) return <h2 className="text-center mt-10">No items found</h2>;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10 flex justify-center">
      <div className="max-w-4xl w-full bg-white p-6 rounded-xl shadow-md">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">
          Payment Checkout
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-lg font-medium text-gray-700 mb-3">
              Your Items
            </h2>

            <div className="space-y-4">
              {items.map((item, id) => (
                <div key={id} className="flex gap-4 border p-3 rounded-lg">
                  <div className="w-full">
                    <div className="flex justify-between">
                      <p className="font-normal text-gray-900 text-sm">
                        {item.name} {item.size && `(${item.size})`}
                      </p>
                      <p className="text-teal-600 font-medium text-sm">
                        ₹{item.price * item.quantity}
                      </p>
                    </div>
                    <p className="text-gray-600 text-sm mt-1">
                      Qty: {item.quantity}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border p-6 rounded-lg bg-gray-50">
            <h2 className="text-lg font-medium text-gray-800 mb-4">
              Order Summary
            </h2>

            <div className="flex justify-between text-gray-700 mb-2">
              <span>Subtotal</span>
              <span>₹{subTotal}</span>
            </div>

            <div className="flex justify-between text-xs text-gray-700 mb-2">
              <span>Delivery Charge</span>
              <span>{subTotal > 500 ? "Free Delivery" : `₹100`}</span>
            </div>

            <div className="flex justify-between text-xs text-gray-700 mb-2">
              <span>GST (18%)</span>
              <span>₹{gst.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-gray-900 text-lg font-semibold border-t pt-3">
              <span>Total Payable</span>
              <span className="text-teal-600">₹{totall}</span>
            </div>

            <button
              onClick={makePayment}
              disabled={loading}
              className={`w-full mt-6 text-white py-3 rounded-full transition ${loading ? 'bg-gray-400' : 'bg-teal-600 hover:bg-teal-700'}`}
            >
              {loading ? 'Processing...' : 'Pay Now'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentGateway;
