/**
 * usePhoneChange Hook
 * Manages phone number change with OTP verification
 */

import { useState, useEffect, useRef } from 'react';
import {
  sendOtpForPhoneChange,
  verifyOtpAndChangePhone,
  resendOtpForPhoneChange
} from '../../../services/profileService';

export const usePhoneChange = (refreshProfile) => {
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [phoneStep, setPhoneStep] = useState('input'); // 'input', 'otp', 'success'
  const [newPhone, setNewPhone] = useState('');
  const [phoneOtp, setPhoneOtp] = useState(['', '', '', '']);
  const [phoneError, setPhoneError] = useState('');
  const [phoneSuccess, setPhoneSuccess] = useState('');
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [otpToken, setOtpToken] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [canResendOtp, setCanResendOtp] = useState(false);
  
  const otpInputRefs = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null)
  ];

  // OTP countdown timer
  useEffect(() => {
    let interval = null;
    if (phoneStep === 'otp' && countdown > 0 && !canResendOtp) {
      interval = setInterval(() => {
        setCountdown(countdown => countdown - 1);
      }, 1000);
    } else if (countdown === 0) {
      setCanResendOtp(true);
    }
    return () => clearInterval(interval);
  }, [phoneStep, countdown, canResendOtp]);

  const handleSendOtp = async () => {
    setPhoneError('');
    setPhoneSuccess('');

    if (!newPhone) {
      setPhoneError('Please enter a phone number');
      return;
    }

    setPhoneLoading(true);
    try {
      const result = await sendOtpForPhoneChange({ new_phone: newPhone });

      if (result.success) {
        setOtpToken(result.data.token);
        setPhoneStep('otp');
        setCountdown(60);
        setCanResendOtp(false);
        setPhoneSuccess('OTP sent successfully! Check your phone.');
      } else {
        setPhoneError(result.error);
      }
    } catch (err) {
      setPhoneError('Failed to send OTP');
    } finally {
      setPhoneLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...phoneOtp];
    newOtp[index] = value;
    setPhoneOtp(newOtp);

    if (value && index < 3) {
      otpInputRefs[index + 1].current?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !phoneOtp[index] && index > 0) {
      otpInputRefs[index - 1].current?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    setPhoneError('');
    const otpCode = phoneOtp.join('');

    if (otpCode.length !== 4) {
      setPhoneError('Please enter the complete 4-digit OTP');
      return;
    }

    setPhoneLoading(true);
    try {
      const result = await verifyOtpAndChangePhone({
        token: otpToken,
        otp: otpCode,
        new_phone: newPhone
      });

      if (result.success) {
        setPhoneSuccess('Phone number changed successfully!');
        setPhoneStep('success');
        if (refreshProfile) await refreshProfile();
        setTimeout(() => {
          closePhoneModal();
        }, 2000);
      } else {
        setPhoneError(result.error);
      }
    } catch (err) {
      setPhoneError('Failed to verify OTP');
    } finally {
      setPhoneLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setPhoneError('');
    setPhoneLoading(true);

    try {
      const result = await resendOtpForPhoneChange({ token: otpToken });

      if (result.success) {
        setCountdown(60);
        setCanResendOtp(false);
        setPhoneSuccess('OTP resent successfully!');
        setTimeout(() => setPhoneSuccess(''), 3000);
      } else {
        setPhoneError(result.error);
      }
    } catch (err) {
      setPhoneError('Failed to resend OTP');
    } finally {
      setPhoneLoading(false);
    }
  };

  const openPhoneModal = () => {
    setShowPhoneModal(true);
    setPhoneStep('input');
    setNewPhone('');
    setPhoneOtp(['', '', '', '']);
    setPhoneError('');
    setPhoneSuccess('');
  };

  const closePhoneModal = () => {
    setShowPhoneModal(false);
    setPhoneStep('input');
    setNewPhone('');
    setPhoneOtp(['', '', '', '']);
    setPhoneError('');
    setPhoneSuccess('');
    setCountdown(60);
    setCanResendOtp(false);
  };

  return {
    showPhoneModal,
    phoneStep,
    newPhone,
    phoneOtp,
    phoneError,
    phoneSuccess,
    phoneLoading,
    countdown,
    canResendOtp,
    otpInputRefs,
    setNewPhone,
    handleSendOtp,
    handleOtpChange,
    handleOtpKeyDown,
    handleVerifyOtp,
    handleResendOtp,
    openPhoneModal,
    closePhoneModal,
  };
};
