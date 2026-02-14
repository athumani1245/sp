import React, { useState } from 'react';
import { Alert, Button, Space } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  BellOutlined,
  InfoCircleOutlined,
  CreditCardOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';

/**
 * SubscriptionBanner Component
 * Displays subscription status alerts at the top of the dashboard
 */
const SubscriptionBanner: React.FC = () => {
  const { subscription, hasActiveSubscription } = useAuth();
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(false);

  if (!subscription || dismissed) {
    return null;
  }

  const handleSubscribe = () => {
    navigate('/subscription');
  };

  // Show error if subscription is inactive or expired
  // Check is_active first, then days_left, and finally hasActiveSubscription as fallback
  const isExpired = 
    subscription.is_active === false || 
    (subscription.days_left !== undefined && subscription.days_left <= 0) ||
    (!subscription.is_active && !hasActiveSubscription);

  if (isExpired) {
    return (
      <Alert
        message="Subscription Expired"
        description="Your subscription has expired. Subscribe now to continue accessing all features."
        type="error"
        showIcon
        icon={<ExclamationCircleOutlined />}
        closable
        onClose={() => setDismissed(true)}
        action={
          <Button size="small" type="primary" danger onClick={handleSubscribe}>
            <Space>
              <CreditCardOutlined />
              Subscribe Now
            </Space>
          </Button>
        }
        style={{ marginBottom: '16px' }}
      />
    );
  }

  // Show warning if subscription is ending soon (8 days or less)
  if (subscription.days_left !== undefined && subscription.days_left <= 8 && subscription.days_left > 0) {
    const isTrialEnding = subscription.is_trial;
    return (
      <Alert
        message={isTrialEnding ? "Trial Period Ending Soon!" : "Subscription Ending Soon!"}
        description={
          <span>
            Your {isTrialEnding ? 'trial period' : 'subscription'} expires in <strong>{subscription.days_left} day{subscription.days_left !== 1 ? 's' : ''}</strong>.
            {isTrialEnding ? ' Subscribe to a plan' : ' Renew'} now to avoid service interruption.
          </span>
        }
        type="warning"
        showIcon
        icon={<ClockCircleOutlined />}
        closable
        onClose={() => setDismissed(true)}
        action={
          <Button size="small" type="primary" onClick={handleSubscribe}>
            <Space>
              {isTrialEnding ? <CreditCardOutlined /> : <ReloadOutlined />}
              {isTrialEnding ? 'Subscribe Now' : 'Renew Now'}
            </Space>
          </Button>
        }
        style={{ marginBottom: '16px' }}
      />
    );
  }

  // Show info if subscription is less than 30 days
  if (subscription.days_left !== undefined && subscription.days_left < 30 && subscription.days_left > 8) {
    const isTrialReminder = subscription.is_trial;
    return (
      <Alert
        message={isTrialReminder ? "Trial Period Reminder" : "Subscription Renewal Reminder"}
        description={
          <span>
            Your {isTrialReminder ? 'trial period' : 'subscription'} will expire in <strong>{subscription.days_left} days</strong>.
            Plan ahead and {isTrialReminder ? 'subscribe to a plan' : 'renew'} to continue enjoying uninterrupted service.
          </span>
        }
        type="info"
        showIcon
        icon={<BellOutlined />}
        closable
        onClose={() => setDismissed(true)}
        action={
          <Button size="small" onClick={handleSubscribe}>
            <Space>
              {isTrialReminder ? <CreditCardOutlined /> : <ReloadOutlined />}
              {isTrialReminder ? 'Subscribe Now' : 'Renew Now'}
            </Space>
          </Button>
        }
        style={{ marginBottom: '16px' }}
      />
    );
  }

  // No banner needed for healthy subscriptions with 30+ days remaining
  return null;
};

export default SubscriptionBanner;
