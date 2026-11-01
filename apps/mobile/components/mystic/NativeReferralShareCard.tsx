import React, { useMemo, useState } from 'react';
import { Pressable, Share, StyleSheet, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import * as Clipboard from 'expo-clipboard';
import { MYSTIC_REFERRAL_SHARE, buildReferralInviteUrl } from '@template/mystic';
import { monoLabel, theme } from '@template/mobile-ui';

const appOrigin = process.env.EXPO_PUBLIC_APP_URL?.replace(/\/$/, '') ?? 'https://mystichair.co';

type Props = {
  referralCode: string;
  progressCopy?: string | null;
  threshold?: number;
  towardNext?: number;
};

export function NativeReferralShareCard({
  referralCode,
  progressCopy,
  threshold = 5,
  towardNext = 0,
}: Props) {
  const [hint, setHint] = useState<string | null>(null);

  const inviteUrl = useMemo(() => buildReferralInviteUrl(appOrigin, referralCode), [referralCode]);

  function flash(message: string) {
    setHint(message);
    setTimeout(() => setHint(null), 2500);
  }

  async function copyLink() {
    try {
      await Clipboard.setStringAsync(inviteUrl);
      flash('Link copied');
    } catch {
      flash('Copy manually');
    }
  }

  async function copyCode() {
    try {
      await Clipboard.setStringAsync(referralCode);
      flash('Code copied');
    } catch {
      flash('Copy manually');
    }
  }

  async function shareInvite() {
    await Share.share({
      message: `${MYSTIC_REFERRAL_SHARE.inviteBody}\n${inviteUrl}`,
      url: inviteUrl,
    });
  }

  return (
    <View style={styles.box}>
      <Text style={styles.eyebrow}>{MYSTIC_REFERRAL_SHARE.inviteTitle}</Text>
      <Text style={styles.body}>{MYSTIC_REFERRAL_SHARE.inviteBody}</Text>

      <View style={styles.qrWrap}>
        <View style={styles.qrFrame}>
          <QRCode value={inviteUrl} size={132} color={theme.ink} backgroundColor={theme.paper} />
        </View>
        <Text style={styles.code}>{referralCode}</Text>
      </View>

      <View style={styles.actions}>
        <Pressable onPress={() => void shareInvite()} style={styles.btn}>
          <Text style={styles.btnText}>Share invite</Text>
        </Pressable>
        <Pressable onPress={() => void copyLink()} style={styles.btn}>
          <Text style={styles.btnText}>{MYSTIC_REFERRAL_SHARE.copyLink}</Text>
        </Pressable>
        <Pressable onPress={() => void copyCode()} style={styles.btn}>
          <Text style={styles.btnText}>{MYSTIC_REFERRAL_SHARE.copyCode}</Text>
        </Pressable>
      </View>

      {hint ? <Text style={styles.hint}>{hint}</Text> : null}

      {progressCopy ? (
        <View style={styles.progressBlock}>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.min(100, (towardNext / Math.max(1, threshold)) * 100)}%` },
              ]}
            />
          </View>
          <Text style={styles.progressCopy}>{progressCopy}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: theme.goldSoft,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  eyebrow: {
    ...monoLabel,
    color: theme.plum,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: 11,
  },
  body: { marginTop: 6, fontSize: 13, color: theme.muted, lineHeight: 19 },
  qrWrap: { alignItems: 'center', marginTop: 16 },
  qrFrame: {
    padding: 12,
    borderRadius: 16,
    backgroundColor: theme.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.line,
  },
  code: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'monospace',
    color: theme.ink,
  },
  actions: { marginTop: 14, gap: 8 },
  btn: {
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.line,
    backgroundColor: theme.paper,
    paddingVertical: 10,
    alignItems: 'center',
  },
  btnText: { fontSize: 12, fontWeight: '600', color: theme.ink },
  hint: { marginTop: 8, textAlign: 'center', fontSize: 12, color: theme.plum },
  progressBlock: { marginTop: 14 },
  progressTrack: {
    height: 6,
    borderRadius: 999,
    backgroundColor: theme.line,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: theme.gold, borderRadius: 999 },
  progressCopy: { marginTop: 8, fontSize: 12, color: theme.muted, lineHeight: 18 },
});
