import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { mockPlans } from '../../services/mockData';
import { ArrowLeft, Check, Sparkles, Shield, Tag, ArrowRight } from 'lucide-react-native';
import { router } from 'expo-router';
import { safeGoBack } from '../../utils/navigation';

export default function PlansCatalogScreen() {
  const { theme } = useTheme();
  const [filter, setFilter] = useState<'all' | 'popular' | 'short'>('all');

  const filteredPlans = mockPlans.filter((p) => {
    if (filter === 'popular') return p.popular;
    if (filter === 'short') return p.durationMonths <= 3;
    return true;
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header title="MEMBERSHIP PLANS" subtitle="Exclusive App Pricing & Transformation Packs" />

      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity
          onPress={() => safeGoBack('/(tabs)')}
          style={[styles.backBtn, { borderColor: theme.colors.border }]}
        >
          <ArrowLeft size={16} color={theme.colors.text} />
          <Text style={[styles.backBtnText, { color: theme.colors.text }]}>Back</Text>
        </TouchableOpacity>

        {/* Promo Top Banner */}
        <View style={[styles.promoBanner, { backgroundColor: theme.colors.cardElevated, borderColor: theme.colors.primary }]}>
          <Tag size={20} color={theme.colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.promoTitle, { color: theme.colors.text }]}>
              App-Only Member Discount Active!
            </Text>
            <Text style={[styles.promoSub, { color: theme.colors.textSecondary }]}>
              Save up to ₹6,000 compared to gym desk walk-in rates. Plus 18% GST invoice included.
            </Text>
          </View>
        </View>

        {/* Filter Pills */}
        <View style={styles.filterRow}>
          {[
            { id: 'all', label: 'All Plans (5)' },
            { id: 'popular', label: '⭐ Recommended' },
            { id: 'short', label: '⚡ 1 to 3 Months' },
          ].map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => setFilter(item.id as any)}
              style={[
                styles.filterPill,
                {
                  backgroundColor: filter === item.id ? theme.colors.primary : theme.colors.cardElevated,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  {
                    color: filter === item.id ? theme.colors.primaryContrast : theme.colors.textSecondary,
                    fontWeight: filter === item.id ? '700' : '500',
                  },
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Plans List */}
        {filteredPlans.map((plan) => {
          const savings = plan.basePriceINR - plan.appDiscountPriceINR;

          return (
            <Card
              key={plan.id}
              elevated={plan.popular}
              style={[
                styles.planCard,
                plan.popular && { borderColor: theme.colors.primary, borderWidth: 2 },
              ]}
            >
              {plan.popular && (
                <View style={styles.popularBadgeWrapper}>
                  <Badge label="🔥 MOST POPULAR TRANSFORMATION" variant="primary" />
                </View>
              )}

              <View style={styles.planHeader}>
                <View>
                  <Text style={[styles.planName, { color: theme.colors.text }]}>
                    {plan.name}
                  </Text>
                  <Text style={[styles.planDesc, { color: theme.colors.textSecondary }]}>
                    {plan.description}
                  </Text>
                </View>
                <Badge
                  label={plan.durationMonths > 0 ? `${plan.durationMonths}M` : '1D'}
                  variant="neutral"
                />
              </View>

              {/* Price Container */}
              <View
                style={[
                  styles.priceContainer,
                  { backgroundColor: theme.colors.cardElevated, borderColor: theme.colors.border },
                ]}
              >
                <View>
                  <Text style={[styles.strikeText, { color: theme.colors.textMuted }]}>
                    Walk-in: ₹{plan.basePriceINR.toLocaleString('en-IN')}
                  </Text>
                  <Text style={[styles.mainPrice, { color: theme.colors.primary }]}>
                    ₹{plan.appDiscountPriceINR.toLocaleString('en-IN')}{' '}
                    <Text style={{ fontSize: 13, color: theme.colors.textSecondary }}>
                      {plan.durationMonths > 0 ? `for ${plan.durationMonths} mos` : 'day pass'}
                    </Text>
                  </Text>
                </View>

                {savings > 0 && (
                  <View style={[styles.savingsPill, { backgroundColor: theme.isDark ? '#062B1D' : '#D1FAE5' }]}>
                    <Text style={[styles.savingsText, { color: theme.colors.success }]}>
                      Save ₹{savings.toLocaleString('en-IN')}
                    </Text>
                  </View>
                )}
              </View>

              {/* Features List */}
              <View style={styles.featuresList}>
                {plan.features.map((feat, idx) => (
                  <View key={idx} style={styles.featureItem}>
                    <Check size={16} color={theme.colors.primary} />
                    <Text style={[styles.featureText, { color: theme.colors.text }]}>
                      {feat}
                    </Text>
                  </View>
                ))}
              </View>

              <Button
                title={`Select ${plan.name}`}
                variant={plan.popular ? 'primary' : 'secondary'}
                icon={<ArrowRight size={16} color={plan.popular ? theme.colors.primaryContrast : theme.colors.text} />}
                onPress={() => router.push(`/checkout/${plan.id}`)}
                style={{ marginTop: 14 }}
              />
            </Card>
          );
        })}

        {/* Freeze Policy Note */}
        <Card style={styles.freezeNoteCard}>
          <Shield size={20} color={theme.colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.freezeNoteTitle, { color: theme.colors.text }]}>
              Complimentary Membership Freeze Included
            </Text>
            <Text style={[styles.freezeNoteSub, { color: theme.colors.textSecondary }]}>
              Traveling or unwell? 6-Month plans include 15 free freeze days, and 12-Month plans include 30 days. No questions asked.
            </Text>
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    padding: 16,
    paddingBottom: 48,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 12,
    gap: 6,
  },
  backBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  promoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    marginBottom: 14,
    gap: 12,
  },
  promoTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  promoSub: {
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  filterPill: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 12,
  },
  planCard: {
    padding: 18,
    marginBottom: 14,
  },
  popularBadgeWrapper: {
    marginBottom: 8,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  planName: {
    fontSize: 19,
    fontWeight: '800',
  },
  planDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginVertical: 10,
  },
  strikeText: {
    fontSize: 12,
    textDecorationLine: 'line-through',
  },
  mainPrice: {
    fontSize: 24,
    fontWeight: '800',
    marginTop: 2,
  },
  savingsPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  savingsText: {
    fontSize: 12,
    fontWeight: '800',
  },
  featuresList: {
    gap: 8,
    marginVertical: 10,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 13,
  },
  freezeNoteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    marginTop: 10,
  },
  freezeNoteTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  freezeNoteSub: {
    fontSize: 11,
    marginTop: 2,
  },
});
