import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { Header } from '@/components/common/Header';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { useNutritionStore } from '@/store/nutritionStore';
import {
  indianDietPlans,
  MEDICAL_DISCLAIMER,
} from '@/services/nutritionService';
import { DietType, MealItem } from '@/types/nutritionAndGoals';
import { safeGoBack } from '@/utils/navigation';
import {
  ArrowLeft,
  Flame,
  Droplets,
  Plus,
  Minus,
  Utensils,
  Leaf,
  Drumstick,
  Egg,
  ShieldAlert,
  Sparkles,
  Info,
  CheckCircle2,
} from 'lucide-react-native';

export default function IndianDietScreen() {
  const { theme } = useTheme();
  const {
    dietType,
    setDietType,
    waterGlasses,
    waterTargetGlasses,
    incrementWater,
    decrementWater,
    resetWater,
  } = useNutritionStore();

  const [activeDietTab, setActiveDietTab] = useState<DietType>(dietType);

  const plan =
    activeDietTab === 'non_veg'
      ? indianDietPlans.non_veg
      : indianDietPlans.veg;

  const waterLiters = (waterGlasses * 0.4).toFixed(1);
  const targetLiters = (waterTargetGlasses * 0.4).toFixed(1);
  const waterPct = Math.min(100, Math.round((waterGlasses / waterTargetGlasses) * 100));

  const handleSelectDiet = (type: DietType) => {
    setActiveDietTab(type);
    setDietType(type);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header title="INDIAN NUTRITION" subtitle="Desi Macro Guidance & Hydration" />

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Navigation Bar */}
        <View style={styles.topNavRow}>
          <TouchableOpacity
            onPress={() => safeGoBack('/(tabs)/progress')}
            style={[styles.backBtn, { borderColor: theme.colors.border }]}
          >
            <ArrowLeft size={16} color={theme.colors.text} />
            <Text style={[styles.backBtnText, { color: theme.colors.text }]}>Progress</Text>
          </TouchableOpacity>

          <Badge variant="success" label="Desi Gym Approved" />
        </View>

        {/* Diet Preference Selector */}
        <Card elevated style={styles.card}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Select Dietary Preference
          </Text>
          <Text style={[styles.sectionSub, { color: theme.colors.textSecondary }]}>
            Curated meal plans tailored for Indian kitchens & local ingredients.
          </Text>

          <View style={styles.dietSelectorRow}>
            <TouchableOpacity
              onPress={() => handleSelectDiet('veg')}
              style={[
                styles.dietOptionBtn,
                {
                  backgroundColor:
                    activeDietTab === 'veg'
                      ? theme.colors.cardElevated
                      : theme.colors.card,
                  borderColor:
                    activeDietTab === 'veg'
                      ? theme.colors.primary
                      : theme.colors.border,
                },
              ]}
            >
              <Leaf
                size={20}
                color={activeDietTab === 'veg' ? '#10B981' : theme.colors.textSecondary}
              />
              <Text
                style={[
                  styles.dietOptionText,
                  {
                    color:
                      activeDietTab === 'veg'
                        ? theme.colors.text
                        : theme.colors.textSecondary,
                    fontWeight: activeDietTab === 'veg' ? '700' : '500',
                  },
                ]}
              >
                100% Veg
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleSelectDiet('non_veg')}
              style={[
                styles.dietOptionBtn,
                {
                  backgroundColor:
                    activeDietTab === 'non_veg'
                      ? theme.colors.cardElevated
                      : theme.colors.card,
                  borderColor:
                    activeDietTab === 'non_veg'
                      ? theme.colors.primary
                      : theme.colors.border,
                },
              ]}
            >
              <Drumstick
                size={20}
                color={activeDietTab === 'non_veg' ? '#EF4444' : theme.colors.textSecondary}
              />
              <Text
                style={[
                  styles.dietOptionText,
                  {
                    color:
                      activeDietTab === 'non_veg'
                        ? theme.colors.text
                        : theme.colors.textSecondary,
                    fontWeight: activeDietTab === 'non_veg' ? '700' : '500',
                  },
                ]}
              >
                Non-Veg
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleSelectDiet('egg_itarian')}
              style={[
                styles.dietOptionBtn,
                {
                  backgroundColor:
                    activeDietTab === 'egg_itarian'
                      ? theme.colors.cardElevated
                      : theme.colors.card,
                  borderColor:
                    activeDietTab === 'egg_itarian'
                      ? theme.colors.primary
                      : theme.colors.border,
                },
              ]}
            >
              <Egg
                size={20}
                color={activeDietTab === 'egg_itarian' ? '#F59E0B' : theme.colors.textSecondary}
              />
              <Text
                style={[
                  styles.dietOptionText,
                  {
                    color:
                      activeDietTab === 'egg_itarian'
                        ? theme.colors.text
                        : theme.colors.textSecondary,
                    fontWeight: activeDietTab === 'egg_itarian' ? '700' : '500',
                  },
                ]}
              >
                Egg-itarian
              </Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Daily Macros Target Summary Card */}
        <Card elevated style={styles.card}>
          <View style={styles.planHeader}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.planTitle, { color: theme.colors.text }]}>
                {plan.title}
              </Text>
              <Text style={[styles.planDesc, { color: theme.colors.textSecondary }]}>
                {plan.description}
              </Text>
            </View>
            <View
              style={[
                styles.calPill,
                {
                  backgroundColor: theme.colors.primary + '18',
                  borderColor: theme.colors.primary,
                },
              ]}
            >
              <Flame size={18} color={theme.colors.primary} />
              <Text style={[styles.calPillValue, { color: theme.colors.primary }]}>
                {plan.caloriesTarget}
              </Text>
              <Text style={[styles.calPillLabel, { color: theme.colors.textSecondary }]}>
                kcal/day
              </Text>
            </View>
          </View>

          {/* Macro Breakdown Grid */}
          <View style={styles.macroGrid}>
            <View
              style={[
                styles.macroCard,
                { backgroundColor: theme.colors.cardElevated, borderColor: theme.colors.border },
              ]}
            >
              <Text style={[styles.macroLabel, { color: theme.colors.textSecondary }]}>
                PROTEIN
              </Text>
              <Text style={[styles.macroValue, { color: '#38BDF8' }]}>
                {plan.proteinGrams}g
              </Text>
              <Text style={[styles.macroSub, { color: theme.colors.textSecondary }]}>
                {Math.round((plan.proteinGrams * 400) / plan.caloriesTarget)}% of cals
              </Text>
            </View>

            <View
              style={[
                styles.macroCard,
                { backgroundColor: theme.colors.cardElevated, borderColor: theme.colors.border },
              ]}
            >
              <Text style={[styles.macroLabel, { color: theme.colors.textSecondary }]}>
                CARBS
              </Text>
              <Text style={[styles.macroValue, { color: '#FBBF24' }]}>
                {plan.carbsGrams}g
              </Text>
              <Text style={[styles.macroSub, { color: theme.colors.textSecondary }]}>
                {Math.round((plan.carbsGrams * 400) / plan.caloriesTarget)}% of cals
              </Text>
            </View>

            <View
              style={[
                styles.macroCard,
                { backgroundColor: theme.colors.cardElevated, borderColor: theme.colors.border },
              ]}
            >
              <Text style={[styles.macroLabel, { color: theme.colors.textSecondary }]}>
                FATS
              </Text>
              <Text style={[styles.macroValue, { color: '#F472B6' }]}>
                {plan.fatsGrams}g
              </Text>
              <Text style={[styles.macroSub, { color: theme.colors.textSecondary }]}>
                {Math.round((plan.fatsGrams * 900) / plan.caloriesTarget)}% of cals
              </Text>
            </View>
          </View>
        </Card>

        {/* Interactive Hydration Station (Water Tracker) */}
        <Card elevated style={styles.card}>
          <View style={styles.waterHeaderRow}>
            <View style={styles.waterTitleWithIcon}>
              <Droplets size={22} color="#38BDF8" />
              <View>
                <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
                  Hydration Station
                </Text>
                <Text style={[styles.cardSub, { color: theme.colors.textSecondary }]}>
                  Crucial for muscle recovery, pump & creatine uptake
                </Text>
              </View>
            </View>

            {waterGlasses >= waterTargetGlasses ? (
              <Badge variant="success" label="Target Met!" />
            ) : (
              <Badge variant="neutral" label={`${waterPct}% Done`} />
            )}
          </View>

          {/* Water Volume Counter */}
          <View style={styles.waterDisplayRow}>
            <View>
              <Text style={[styles.waterBigNumber, { color: theme.colors.text }]}>
                {waterGlasses}{' '}
                <Text style={{ fontSize: 18, color: theme.colors.textSecondary }}>
                  / {waterTargetGlasses} glasses
                </Text>
              </Text>
              <Text style={[styles.waterLitersText, { color: '#38BDF8' }]}>
                {waterLiters} Liters drank today (Target: {targetLiters} L)
              </Text>
            </View>

            {/* Micro Stepper Buttons */}
            <View style={styles.waterButtonsGroup}>
              <TouchableOpacity
                onPress={decrementWater}
                style={[
                  styles.waterStepBtn,
                  { backgroundColor: theme.colors.cardElevated, borderColor: theme.colors.border },
                ]}
              >
                <Minus size={18} color={theme.colors.text} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={incrementWater}
                style={[
                  styles.waterStepBtn,
                  { backgroundColor: '#38BDF8', borderColor: '#38BDF8' },
                ]}
              >
                <Plus size={18} color="#000000" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Progress Bar */}
          <View
            style={[
              styles.progressBarTrack,
              { backgroundColor: theme.colors.cardElevated, borderColor: theme.colors.border },
            ]}
          >
            <View
              style={[
                styles.progressBarFill,
                { width: `${waterPct}%`, backgroundColor: '#38BDF8' },
              ]}
            />
          </View>

          {/* Glass Visual Indicators */}
          <View style={styles.glassRow}>
            {Array.from({ length: waterTargetGlasses }).map((_, idx) => (
              <View
                key={idx}
                style={[
                  styles.glassDot,
                  {
                    backgroundColor:
                      idx < waterGlasses ? '#38BDF8' : theme.colors.border,
                  },
                ]}
              />
            ))}
          </View>
        </Card>

        {/* Meal Schedule & Desi Foods Breakdown */}
        <Text style={[styles.mealsHeading, { color: theme.colors.text }]}>
          Daily Meal Schedule ({plan.meals.length} Meals)
        </Text>

        {plan.meals.map((meal: MealItem, idx: number) => (
          <Card key={idx} elevated style={styles.mealCard}>
            <View style={styles.mealHeaderRow}>
              <View style={styles.mealTimePill}>
                <Utensils size={14} color={theme.colors.primary} />
                <Text style={[styles.mealTimeText, { color: theme.colors.primary }]}>
                  {meal.mealTime}
                </Text>
              </View>

              <Text style={[styles.mealCalsText, { color: theme.colors.textSecondary }]}>
                {meal.calories} kcal • {meal.proteinG}g Protein
              </Text>
            </View>

            <Text style={[styles.mealTitle, { color: theme.colors.text }]}>
              {meal.title}
            </Text>
            <Text style={[styles.mealDesc, { color: theme.colors.textSecondary }]}>
              {meal.description}
            </Text>

            {/* Indian Foods Tags */}
            <View style={styles.foodTagsRow}>
              {meal.indianFoods.map((food, fIdx) => (
                <View
                  key={fIdx}
                  style={[
                    styles.foodTag,
                    {
                      backgroundColor: theme.colors.cardElevated,
                      borderColor: theme.colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.foodTagText, { color: theme.colors.text }]}>
                    {food}
                  </Text>
                </View>
              ))}
            </View>

            {/* Macros Mini Bar */}
            <View style={styles.miniMacroRow}>
              <Text style={[styles.miniMacroItem, { color: theme.colors.textSecondary }]}>
                P: <Text style={{ color: '#38BDF8', fontWeight: '700' }}>{meal.proteinG}g</Text>
              </Text>
              <Text style={[styles.miniMacroItem, { color: theme.colors.textSecondary }]}>
                C: <Text style={{ color: '#FBBF24', fontWeight: '700' }}>{meal.carbsG}g</Text>
              </Text>
              <Text style={[styles.miniMacroItem, { color: theme.colors.textSecondary }]}>
                F: <Text style={{ color: '#F472B6', fontWeight: '700' }}>{meal.fatsG}g</Text>
              </Text>
            </View>
          </Card>
        ))}

        {/* Indian Fitness Nutrition Tips */}
        <Card elevated style={styles.card}>
          <View style={styles.tipsHeaderRow}>
            <Sparkles size={20} color={theme.colors.primary} />
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
              Desi Gym Nutrition Pro-Tips
            </Text>
          </View>

          <View style={styles.tipItem}>
            <CheckCircle2 size={16} color={theme.colors.success} style={{ marginTop: 2 }} />
            <Text style={[styles.tipText, { color: theme.colors.textSecondary }]}>
              <Text style={{ color: theme.colors.text, fontWeight: '700' }}>Sattu vs Whey:</Text> Chana Sattu is fantastic for fiber and micronutrients, but contains ~20g carbs per 100g. Use it for morning fuel or post-workout alongside whey isolate.
            </Text>
          </View>

          <View style={styles.tipItem}>
            <CheckCircle2 size={16} color={theme.colors.success} style={{ marginTop: 2 }} />
            <Text style={[styles.tipText, { color: theme.colors.textSecondary }]}>
              <Text style={{ color: theme.colors.text, fontWeight: '700' }}>Paneer Fat Ratio:</Text> 100g standard paneer has ~18g protein and ~20g fat. Choose low-fat cow milk paneer or mix half paneer with half boiled soya chunks to keep calories in check.
            </Text>
          </View>

          <View style={styles.tipItem}>
            <CheckCircle2 size={16} color={theme.colors.success} style={{ marginTop: 2 }} />
            <Text style={[styles.tipText, { color: theme.colors.textSecondary }]}>
              <Text style={{ color: theme.colors.text, fontWeight: '700' }}>Gut Health & Chaas:</Text> A glass of fresh buttermilk with roasted jeera aids protein digestion and combats bloating from whey and pulses.
            </Text>
          </View>
        </Card>

        {/* Statutory Medical Disclaimer */}
        <Card
          elevated
          style={[
            styles.disclaimerCard,
            { backgroundColor: theme.colors.cardElevated, borderColor: '#F59E0B' },
          ]}
        >
          <View style={styles.disclaimerHeader}>
            <ShieldAlert size={20} color="#F59E0B" />
            <Text style={[styles.disclaimerTitle, { color: '#F59E0B' }]}>
              Important Health Notice
            </Text>
          </View>
          <Text style={[styles.disclaimerBody, { color: theme.colors.textSecondary }]}>
            {MEDICAL_DISCLAIMER}
          </Text>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 16, paddingBottom: 40 },
  topNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  backBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  card: {
    marginBottom: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  sectionSub: {
    fontSize: 13,
    marginBottom: 14,
  },
  dietSelectorRow: {
    flexDirection: 'row',
    gap: 10,
  },
  dietOptionBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderWidth: 1.5,
    gap: 6,
  },
  dietOptionText: {
    fontSize: 13,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 12,
  },
  planTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  planDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  calPill: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  calPillValue: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 2,
  },
  calPillLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  macroGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  macroCard: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  macroLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  macroValue: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 2,
  },
  macroSub: {
    fontSize: 10,
  },
  waterHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  waterTitleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  cardSub: {
    fontSize: 12,
    marginTop: 2,
  },
  waterDisplayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  waterBigNumber: {
    fontSize: 24,
    fontWeight: '900',
  },
  waterLitersText: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  waterButtonsGroup: {
    flexDirection: 'row',
    gap: 10,
  },
  waterStepBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBarTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 0.5,
    marginBottom: 12,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  glassRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  glassDot: {
    flex: 1,
    height: 6,
    marginHorizontal: 2,
    borderRadius: 3,
  },
  mealsHeading: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 10,
    marginBottom: 14,
    letterSpacing: 0.5,
  },
  mealCard: {
    marginBottom: 14,
    padding: 16,
  },
  mealHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  mealTimePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  mealTimeText: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  mealCalsText: {
    fontSize: 12,
    fontWeight: '600',
  },
  mealTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  mealDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 10,
  },
  foodTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  foodTag: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
  },
  foodTagText: {
    fontSize: 11,
    fontWeight: '500',
  },
  miniMacroRow: {
    flexDirection: 'row',
    gap: 16,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#33333340',
  },
  miniMacroItem: {
    fontSize: 12,
  },
  tipsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  tipItem: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  tipText: {
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
  },
  disclaimerCard: {
    marginTop: 8,
    padding: 16,
    borderWidth: 1,
    borderRadius: 12,
  },
  disclaimerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  disclaimerTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  disclaimerBody: {
    fontSize: 12,
    lineHeight: 18,
  },
});
