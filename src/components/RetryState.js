import { WifiOff, RefreshCw } from 'lucide-react-native';
import { colors } from '../theme/theme';
import EmptyState from './EmptyState';
import OutlineButton from './OutlineButton';

// The calm "couldn't load" state: no error wall, just a retry.
export default function RetryState({ offline, onRetry, title, subtitle }) {
  return (
    <EmptyState
      icon={<WifiOff size={26} color={colors.gold} />}
      title={title || (offline ? "You're offline" : "Couldn't load the shop")}
      subtitle={
        subtitle ||
        (offline
          ? 'Check your connection and try again. Anything you have already opened is saved.'
          : 'Something went wrong on our side. Please try again in a moment.')
      }
      action={
        <OutlineButton
          label="Try again"
          onPress={onRetry}
          fullWidth={false}
          icon={<RefreshCw size={16} color={colors.gold} />}
        />
      }
    />
  );
}
