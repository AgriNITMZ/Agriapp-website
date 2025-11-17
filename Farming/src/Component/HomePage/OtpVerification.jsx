import React, { useRef } from 'react'

const OtpVerification = () => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (timer > 0 && !canResend) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else if (timer === 0) {
      setCanResend(true);
    }
  }, [timer]);

  const handleChange = (index, value) => {
    if (isNaN(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value !== '' && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (/^\d+$/.test(pastedData)) {
      const newOtp = [...otp];
      pastedData.split('').forEach((char, index) => {
        if (index < 6) newOtp[index] = char;
      });
      setOtp(newOtp);
    }
  };

  const handleSubmit = () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }
    // Simulate API call
    setTimeout(() => {
      if (otpString === '123456') { // Demo validation
        setSuccess(true);
        setError('');
      } else {
        setError('Invalid OTP. Please try again.');
      }
    }, 1000);
  };

  const handleResend = () => {
    setCanResend(false);
    setTimer(30);
    setOtp(['', '', '', '', '', '']);
    setError('');
  };
    
  return (
    <div style={{ maxWidth: '400px', margin: 'auto', padding: '20px', border: '1px solid #ccc', borderRadius: '10px' }}>
    <h2>Verify Your Account</h2>
    <p>Enter the 6-digit code we sent to your phone</p>
    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
      {otp.map((digit, index) => (
        <input
          key={index}
          type="text"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          ref={(ref) => (inputRefs.current[index] = ref)}
          style={{ width: '40px', height: '40px', textAlign: 'center', fontSize: '18px' }}
        />
      ))}
    </div>

    {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
    {success && <div style={{ color: 'green', marginBottom: '10px' }}>OTP verified successfully!</div>}

    <button
      onClick={handleSubmit}
      style={{ width: '100%', padding: '10px', backgroundColor: '#007BFF', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
      disabled={success}
    >
      Verify
    </button>

    <div style={{ textAlign: 'center', marginTop: '20px' }}>
      {canResend ? (
        <button
          onClick={handleResend}
          style={{ background: 'none', border: 'none', color: '#007BFF', cursor: 'pointer' }}
        >
          Resend Code
        </button>
      ) : (
        <p>Resend code in {timer}s</p>
      )}
    </div>
  </div>
  )
}

export default OtpVerification