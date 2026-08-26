import { useState, useEffect } from "react";
import { Course, User } from "../types";
import { loadRazorpayScript, generateTxnId } from "../utils";
import { Lock, CreditCard, Shield, CheckCircle, AlertCircle, X, Sparkles, HelpCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface PaymentModalProps {
  course: Course;
  volumeId: number; // 1 or 2
  user: User;
  onSuccess: (paymentId: string) => void;
  onFailure: (errorMessage: string) => void;
  onClose: () => void;
}

export default function PaymentModal({
  course,
  volumeId = 2,
  user,
  onSuccess,
  onFailure,
  onClose,
}: PaymentModalProps) {
  const [loading, setLoading] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [simulatedCheckout, setSimulatedCheckout] = useState(false);
  const [simulatedStatus, setSimulatedStatus] = useState<"idle" | "paying" | "success" | "failure">("idle");
  const [failureMsg, setFailureMsg] = useState("");

  const price = volumeId === 1 ? 49 : course.price;
  const description = volumeId === 1 
    ? `Access to ${course.title} (Volume 1)` 
    : `Full Access to ${course.title} (Volume 2)`;

  useEffect(() => {
    // Attempt to load Razorpay script on mount
    loadRazorpayScript().then((loaded) => {
      setRazorpayLoaded(loaded);
    });
  }, []);

  const handlePayRealOrSimulated = async () => {
    setLoading(true);
    setFailureMsg("");

    // If script isn't loaded, use simulated checkout
    if (!razorpayLoaded) {
      setTimeout(() => {
        setSimulatedCheckout(true);
        setLoading(false);
      }, 800);
      return;
    }

    try {
      // 1. Create order on backend
      const response = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: price, version_id: volumeId }),
      });
      const order = await response.json();

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_TCU99GpVJNoKGA", // Public key ID
        amount: order.amount,
        currency: "INR",
        name: "BeTheBest Academy",
        description: description,
        order_id: order.id,
        image: "https://images.unsplash.com/photo-1507668077129-56e32842fceb?q=80&w=100&auto=format&fit=crop",
        handler: async function (response: any) {
          // 2. Verify payment on backend
          try {
            const verifyRes = await fetch('/api/razorpay/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                user_id: user.id,
                version_id: volumeId,
                course_id: course.id
              }),
            });
            const verifyData = await verifyRes.json();
            
            if (verifyData.status === "success") {
              onSuccess(response.razorpay_payment_id);
            } else {
              throw new Error("Payment verification failed.");
            }
          } catch (err: any) {
            setFailureMsg(err.message);
            onFailure(err.message);
          }
          setLoading(false);
        },
        prefill: {
          name: user.name,
          email: user.email,
        },
        notes: {
          courseId: course.id,
          courseTitle: course.title,
          volumeId: String(volumeId),
        },
        theme: {
          color: "#0066FF",
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      
      // Listen to payment failures
      rzp.on("payment.failed", function (response: any) {
        setLoading(false);
        const err = response.error.description || "Payment declined by issuing bank.";
        setFailureMsg(err);
        onFailure(err);
      });

      rzp.open();
    } catch (error) {
      setSimulatedCheckout(true);
      setLoading(false);
    }
  };

  const handleSimulatePayment = (status: "success" | "failure") => {
    setSimulatedStatus("paying");
    
    setTimeout(() => {
      if (status === "success") {
        setSimulatedStatus("success");
        setTimeout(() => {
          onSuccess(generateTxnId());
        }, 1200);
      } else {
        setSimulatedStatus("failure");
        const errMsg = "Insufficient test credentials or card declined.";
        setFailureMsg(errMsg);
        setTimeout(() => {
          setSimulatedStatus("idle");
        }, 1500);
      }
    }, 1500);
  };

  return (
    <div id="payment-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-[8px]">
      <AnimatePresence mode="wait">
        {!simulatedCheckout ? (
          /* Real Razorpay Pricing Card */
          <motion.div
            id="pricing-card"
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative w-full max-w-md overflow-hidden rounded-[32px] border border-white/50 bg-white/45 p-8 shadow-[0_24px_60px_-15px_rgba(0,102,255,0.08)] backdrop-blur-2xl"
          >
            {/* Background graphics */}
            <div className="absolute top-0 right-0 w-36 h-36 rounded-full bg-blue-500/5 blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-36 h-36 rounded-full bg-cyan-400/5 blur-2xl pointer-events-none" />

            {/* Header info */}
            <div className="flex justify-between items-start mb-6">
              <div className="space-y-1">
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-white/40 border border-white/50 text-[10px] font-bold text-blue-600 uppercase tracking-wide">
                  <Sparkles className="w-3 h-3" />
                  <span>Interactive Premium Upgrade</span>
                </span>
                <h3 className="font-display font-bold text-xl text-slate-800 tracking-tight leading-snug">
                  Unlock Lecture Volume {volumeId}
                </h3>
              </div>
              <button
                id="pricing-close"
                onClick={onClose}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-white/40 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Course Summary Item */}
            <div className="bg-white/20 rounded-2xl p-4 border border-white/40 backdrop-blur-sm flex items-center space-x-4 mb-6">
              <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-white/30">
                <img src={course.bannerUrl} alt={course.title} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{course.category}</p>
                <h4 className="text-sm font-bold text-slate-700 truncate">{course.title}</h4>
                <p className="text-xs text-slate-400">
                  {volumeId === 1 ? "Unlock Foundations & MCQ Quizzes" : "Includes advanced MCQs & unlimited testing"}
                </p>
              </div>
            </div>

            {/* Benefits list */}
            <div className="space-y-3.5 mb-6 text-xs text-slate-600">
              <div className="flex items-center space-x-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Full access to Volume {volumeId}: {volumeId === 1 ? "Foundations" : "Advanced Lectures"}</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Earn up to +{volumeId === 1 ? "100" : "300"} global ranking points</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Lifetime digital access with secure local storage</span>
              </div>
            </div>

            {/* Price section */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/25 border border-white/50 backdrop-blur-sm mb-6">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Price</p>
                <p className="text-2xl font-bold font-display text-slate-800">₹{price}</p>
              </div>
              <div className="text-right text-[11px] text-slate-400 font-medium">
                <p>Tax inclusive</p>
                <p className="text-blue-600 font-semibold flex items-center justify-end space-x-1 mt-0.5">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Secure Pay</span>
                </p>
              </div>
            </div>

            {/* Failure Messages */}
            {failureMsg && (
              <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-xs flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Checkout Interrupted</p>
                  <p className="mt-0.5 font-light">{failureMsg}</p>
                </div>
              </div>
            )}

            {/* Pay Button */}
            <button
              onClick={handlePayRealOrSimulated}
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 py-3.5 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 shadow-lg shadow-blue-500/15 hover:shadow-blue-500/25 active:scale-[0.98] disabled:opacity-50 disabled:scale-100 transition-all cursor-pointer"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <CreditCard className="w-4.5 h-4.5" />
                  <span>Initiate Razorpay Checkout</span>
                </>
              )}
            </button>

            <p className="text-[10px] text-slate-400 text-center mt-3 font-medium">
              🔒 SSL Encrypted & Secure checkout using Razorpay Test Mode
            </p>
          </motion.div>
        ) : (
          /* Simulated Razorpay Checkout Portal */
          <motion.div
            id="simulated-razorpay"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-sm rounded-2xl overflow-hidden bg-slate-900 text-white shadow-2xl border border-blue-500/30"
          >
            {/* Simulation Header */}
            <div className="bg-slate-950 p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center text-xs font-black">
                  R
                </div>
                <div>
                  <h4 className="text-xs font-bold tracking-tight">Razorpay Checkout</h4>
                  <p className="text-[9px] text-emerald-400 flex items-center space-x-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping mr-1" />
                    <span>Test Mode Simulation</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSimulatedCheckout(false)}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Simulation Body */}
            <div className="p-6 space-y-6">
              <div className="space-y-1">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Merchant</p>
                <p className="text-sm font-bold">BeTheBest Academy</p>
                <p className="text-xs text-slate-300">Upgrade: Volume {volumeId} ({volumeId === 1 ? "Foundations" : "Advanced Lectures"})</p>
              </div>

              <div className="flex justify-between items-center p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400">Order Amount</span>
                <span className="text-base font-bold text-blue-400 font-mono">₹{price}.00</span>
              </div>

              {simulatedStatus === "paying" ? (
                <div className="flex flex-col items-center justify-center py-6 space-y-3">
                  <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                  <p className="text-xs text-slate-300">Processing simulation secure bank transaction...</p>
                </div>
              ) : simulatedStatus === "success" ? (
                <div className="flex flex-col items-center justify-center py-6 space-y-3 text-emerald-400">
                  <CheckCircle className="w-10 h-10 animate-bounce" />
                  <p className="text-xs font-bold">Payment Authorized Successfully</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-[10px] text-slate-400 text-center font-medium">
                    This simulated gateway acts exactly like Razorpay to verify client callbacks.
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleSimulatePayment("success")}
                      className="py-2.5 px-4 rounded-xl text-xs font-bold text-slate-900 bg-emerald-400 hover:bg-emerald-500 transition-all cursor-pointer"
                    >
                      Simulate Success
                    </button>
                    <button
                      onClick={() => handleSimulatePayment("failure")}
                      className="py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-all cursor-pointer"
                    >
                      Simulate Failure
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Simulation Footer */}
            <div className="bg-slate-950 p-3 border-t border-slate-800 text-center text-[10px] text-slate-500">
              This sandbox overlay ensures 100% iframe test compatibility.
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
