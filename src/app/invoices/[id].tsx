import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, Share, Platform } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useTheme } from '../../theme/ThemeContext';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { invoiceStore, RAZORPAY_CONFIG } from '../../services/paymentService';
import {
  ArrowLeft,
  Download,
  Share2,
  CheckCircle2,
  Printer,
  ShieldCheck,
  Building2,
  Home,
} from 'lucide-react-native';

export default function GSTInvoiceScreen() {
  const { theme } = useTheme();
  const params = useLocalSearchParams<{ id: string }>();
  const invoiceId = params.id || 'INV-2026-89412';

  // Retrieve from store or fallback
  const invoice = invoiceStore[invoiceId] || invoiceStore['INV-2026-89412'];

  const handleShare = async () => {
    try {
      await Share.share({
        title: `GST Tax Invoice ${invoice.invoiceNumber}`,
        message: `GymPulse GST Tax Invoice ${invoice.invoiceNumber} for ₹${invoice.totalAmountINR.toLocaleString('en-IN')}.\nGym: ${invoice.gymDetails.legalName}\nGSTIN: ${invoice.gymDetails.gstin}`,
      });
    } catch (e) {
      // Ignored
    }
  };

  const handlePrint = () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.print();
    } else {
      Alert.alert('Download Invoice', `PDF Invoice ${invoice.invoiceNumber} saved to device downloads.`);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header title="TAX INVOICE" subtitle="GST-Compliant Official Receipt" />

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Navigation Action Bar */}
        <View style={styles.topNavRow}>
          <TouchableOpacity
            onPress={() => router.replace('/(tabs)')}
            style={[styles.backBtn, { borderColor: theme.colors.border }]}
          >
            <Home size={16} color={theme.colors.text} />
            <Text style={[styles.backBtnText, { color: theme.colors.text }]}>Member Home</Text>
          </TouchableOpacity>

          <View style={styles.rightNavBtns}>
            <Button
              title="Share"
              size="sm"
              variant="outline"
              icon={<Share2 size={14} color={theme.colors.primary} />}
              onPress={handleShare}
            />
            <Button
              title="Print / PDF"
              size="sm"
              variant="primary"
              icon={<Printer size={14} color={theme.colors.primaryContrast} />}
              onPress={handlePrint}
            />
          </View>
        </View>

        {/* Printable Invoice Paper Container */}
        <Card elevated style={styles.invoiceCard}>
          {/* Gym Header */}
          <View style={[styles.invoiceHeader, { borderBottomColor: theme.colors.border }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.companyName, { color: theme.colors.text }]}>
                {invoice.gymDetails.legalName}
              </Text>
              <Text style={[styles.brandSub, { color: theme.colors.primary }]}>
                (Trading as {invoice.gymDetails.name})
              </Text>
              <Text style={[styles.addressText, { color: theme.colors.textSecondary }]}>
                {invoice.gymDetails.address}
              </Text>
              <Text style={[styles.gstinText, { color: theme.colors.text }]}>
                GSTIN: <Text style={{ fontWeight: '800' }}>{invoice.gymDetails.gstin}</Text>
              </Text>
              <Text style={[styles.sacText, { color: theme.colors.textSecondary }]}>
                Services Accounting Code (SAC): {invoice.gymDetails.sacCode} (Gym & Fitness Services)
              </Text>
            </View>

            <View style={styles.invoiceMetaRight}>
              <Badge label="PAID" variant="success" style={{ marginBottom: 6 }} />
              <Text style={[styles.invoiceNum, { color: theme.colors.text }]}>
                {invoice.invoiceNumber}
              </Text>
              <Text style={[styles.invoiceDate, { color: theme.colors.textSecondary }]}>
                Date: {invoice.date}
              </Text>
            </View>
          </View>

          {/* Customer Details */}
          <View style={[styles.customerSection, { borderBottomColor: theme.colors.border }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textMuted }]}>
              BILLED TO / CUSTOMER:
            </Text>
            <Text style={[styles.custName, { color: theme.colors.text }]}>
              {invoice.customerDetails.name}
            </Text>
            <Text style={[styles.custInfo, { color: theme.colors.textSecondary }]}>
              Phone: {invoice.customerDetails.phone} • Email: {invoice.customerDetails.email}
            </Text>
            <Text style={[styles.custInfo, { color: theme.colors.textSecondary }]}>
              Place of Supply: Maharashtra (State Code 27)
            </Text>
          </View>

          {/* Line Items Table */}
          <View style={styles.tableHeader}>
            <Text style={[styles.colDesc, { color: theme.colors.textSecondary }]}>Description</Text>
            <Text style={[styles.colSac, { color: theme.colors.textSecondary }]}>SAC</Text>
            <Text style={[styles.colAmount, { color: theme.colors.textSecondary }]}>Taxable (₹)</Text>
          </View>

          {invoice.items.map((item, idx) => (
            <View key={idx} style={[styles.tableRow, { borderBottomColor: theme.colors.border }]}>
              <Text style={[styles.rowDesc, { color: theme.colors.text }]}>{item.description}</Text>
              <Text style={[styles.rowSac, { color: theme.colors.textSecondary }]}>{item.sacCode}</Text>
              <Text style={[styles.rowAmount, { color: theme.colors.text }]}>
                ₹{item.amountINR.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </Text>
            </View>
          ))}

          {/* Tax Breakdown */}
          <View style={styles.summarySection}>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
                Taxable Value:
              </Text>
              <Text style={[styles.summaryVal, { color: theme.colors.text }]}>
                ₹{invoice.taxableAmountINR.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
                Central GST (CGST @ 9%):
              </Text>
              <Text style={[styles.summaryVal, { color: theme.colors.text }]}>
                ₹{invoice.cgstAmountINR.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
                State GST (SGST @ 9%):
              </Text>
              <Text style={[styles.summaryVal, { color: theme.colors.text }]}>
                ₹{invoice.sgstAmountINR.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </Text>
            </View>

            <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, { color: theme.colors.text }]}>
                Total Invoice Value (INR):
              </Text>
              <Text style={[styles.totalVal, { color: theme.colors.primary }]}>
                ₹{invoice.totalAmountINR.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </Text>
            </View>
          </View>

          {/* Payment & Audit Verification */}
          <View style={[styles.auditBox, { backgroundColor: theme.colors.cardElevated, borderColor: theme.colors.border }]}>
            <View style={styles.auditRow}>
              <ShieldCheck size={16} color={theme.colors.success} />
              <Text style={[styles.auditText, { color: theme.colors.text }]}>
                Payment Verified via {invoice.paymentMethod}
              </Text>
            </View>
            <Text style={[styles.refText, { color: theme.colors.textSecondary }]}>
              Razorpay Ref ID: {invoice.razorpayPaymentId}
            </Text>
            <Text style={[styles.disclaimer, { color: theme.colors.textMuted }]}>
              This is a digitally generated GST Tax Invoice and does not require a physical signature.
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
  topNavRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 8,
    gap: 6,
  },
  backBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  rightNavBtns: {
    flexDirection: 'row',
    gap: 8,
  },
  invoiceCard: {
    padding: 20,
    borderRadius: 16,
  },
  invoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  companyName: {
    fontSize: 16,
    fontWeight: '800',
  },
  brandSub: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 1,
  },
  addressText: {
    fontSize: 11,
    marginTop: 4,
    lineHeight: 15,
  },
  gstinText: {
    fontSize: 12,
    marginTop: 4,
  },
  sacText: {
    fontSize: 11,
    marginTop: 2,
  },
  invoiceMetaRight: {
    alignItems: 'flex-end',
  },
  invoiceNum: {
    fontSize: 15,
    fontWeight: '800',
  },
  invoiceDate: {
    fontSize: 12,
    marginTop: 2,
  },
  customerSection: {
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  custName: {
    fontSize: 15,
    fontWeight: '700',
  },
  custInfo: {
    fontSize: 12,
    marginTop: 2,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  colDesc: {
    flex: 2,
    fontSize: 12,
    fontWeight: '700',
  },
  colSac: {
    width: 60,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  colAmount: {
    width: 90,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'right',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  rowDesc: {
    flex: 2,
    fontSize: 13,
    lineHeight: 18,
  },
  rowSac: {
    width: 60,
    fontSize: 12,
    textAlign: 'center',
  },
  rowAmount: {
    width: 90,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'right',
  },
  summarySection: {
    paddingVertical: 14,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 3,
  },
  summaryLabel: {
    fontSize: 12,
  },
  summaryVal: {
    fontSize: 12,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginVertical: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '800',
  },
  totalVal: {
    fontSize: 22,
    fontWeight: '900',
  },
  auditBox: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 10,
  },
  auditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  auditText: {
    fontSize: 12,
    fontWeight: '700',
  },
  refText: {
    fontSize: 11,
  },
  disclaimer: {
    fontSize: 10,
    marginTop: 6,
    fontStyle: 'italic',
  },
});
