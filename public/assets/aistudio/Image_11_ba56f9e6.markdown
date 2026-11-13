---
name: AURA-PainCare
colors:
  surface: '#150f29'
  surface-dim: '#150f29'
  surface-bright: '#3c3551'
  surface-container-lowest: '#100a24'
  surface-container-low: '#1d1732'
  surface-container: '#221c36'
  surface-container-high: '#2c2641'
  surface-container-highest: '#37314c'
  on-surface: '#e7deff'
  on-surface-variant: '#c7c8ad'
  inverse-surface: '#e7deff'
  inverse-on-surface: '#332c48'
  outline: '#919379'
  outline-variant: '#464833'
  surface-tint: '#bdd200'
  primary: '#ffffff'
  on-primary: '#2e3400'
  primary-container: '#d8ef27'
  on-primary-container: '#5f6a00'
  inverse-primary: '#596400'
  secondary: '#cabeff'
  on-secondary: '#32246b'
  secondary-container: '#4b3e86'
  on-secondary-container: '#bcaefe'
  tertiary: '#ffffff'
  on-tertiary: '#32285d'
  tertiary-container: '#e6deff'
  on-tertiary-container: '#675d95'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d8ef27'
  primary-fixed-dim: '#bdd200'
  on-primary-fixed: '#1a1e00'
  on-primary-fixed-variant: '#434b00'
  secondary-fixed: '#e6deff'
  secondary-fixed-dim: '#cabeff'
  on-secondary-fixed: '#1c0956'
  on-secondary-fixed-variant: '#493c83'
  tertiary-fixed: '#e6deff'
  tertiary-fixed-dim: '#cabefe'
  on-tertiary-fixed: '#1d1247'
  on-tertiary-fixed-variant: '#493f75'
  background: '#150f29'
  on-background: '#e7deff'
  surface-variant: '#37314c'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 3.5rem
    fontWeight: '700'
    lineHeight: 4rem
    letterSpacing: -0.02em
  display-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 2.25rem
    fontWeight: '700'
    lineHeight: 2.75rem
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 2rem
    fontWeight: '600'
    lineHeight: 2.5rem
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 1.5rem
    fontWeight: '600'
    lineHeight: 2rem
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 1.25rem
    fontWeight: '600'
    lineHeight: 1.75rem
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 1.125rem
    fontWeight: '400'
    lineHeight: 1.75rem
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 0.9375rem
    fontWeight: '400'
    lineHeight: 1.5rem
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 0.8125rem
    fontWeight: '400'
    lineHeight: 1.25rem
  metric-xl:
    fontFamily: JetBrains Mono
    fontSize: 3rem
    fontWeight: '700'
    lineHeight: 3.25rem
    letterSpacing: -0.03em
  metric-md:
    fontFamily: JetBrains Mono
    fontSize: 1.5rem
    fontWeight: '600'
    lineHeight: 1.75rem
    letterSpacing: -0.01em
  metric-sm:
    fontFamily: JetBrains Mono
    fontSize: 0.875rem
    fontWeight: '500'
    lineHeight: 1.25rem
  label-bilingual:
    fontFamily: Noto Sans Devanagari
    fontSize: 0.8125rem
    fontWeight: '500'
    lineHeight: 1.25rem
  label-caps:
    fontFamily: Plus Jakarta Sans
    fontSize: 0.6875rem
    fontWeight: '700'
    lineHeight: 1rem
    letterSpacing: 0.08em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-tablet: 1.5rem
  margin-desktop: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 3rem
---

## Brand & Style

This design system drives an artificial intelligence platform engineered for Intensive Care Units (ICU), specifically detecting silent, non-verbal physiological and micro-expression pain indicators through camera feeds. The user group comprises ICU charge nurses, bedside nurses, and intensivists operating in high-acuity, dimly lit, sensory-overloaded environments where split-second clinical decisions are paramount. 

The aesthetic identity is **Futuristic Medical Health-Tech**. It combines deep, non-fatiguing dark surfaces with luminous precision accents to evoke uncompromising clinical confidence, technological foresight, and profound patient empathy. 

Visual principles:
- **Luminescent Hierarchy:** High-contrast optical guidance steers tired eyes directly to critical alerts without triggering alarm fatigue.
- **Deep Glass Layering:** Subtle backdrop filters combined with crisp, semi-translucent lilac borders impart modern spatial depth while maintaining razor-sharp legibility.
- **Sterile Precision:** Monospaced data displays provide zero layout jitter, and bilingual typography guarantees cultural inclusivity and immediate situational comprehension under crisis.
- **Mobile & Tablet First Touch Targets:** Designed for handheld nurse tablets and portable carts with large, forgiving hit targets (minimum 48x48px) and touch buffers.

## Colors

The palette strictly complies with a tailored 60/30/10 ratio to prevent sensory overload while surfacing instantaneous priority triage cues.

### Structural Neutrals (60% — Midnight Violet)
- **Canvas Base:** `#150F29` — Grounding canvas, optimized for low-light ICU environments to minimize eye strain and screen glare.
- **Elevated Surface:** `#1E1638` — Navigation bars, persistent toolbars, and modal bases.
- **Card / Surface Container:** `#2A2145` — Base for patient monitoring cards, sensor pods, and telemetry containers.

### Interface & Secondary Structures (30% — Lilac Haze)
- **Primary Lilac:** `#A99BEA` — Decorative 1px borders (at 25% opacity: `rgba(169, 155, 234, 0.25)`), secondary actions, icon fills, and subtle focus glows.
- **Luminous Lilac:** `#C4B8F7` — Active icons, subheadings, and hover/pressed states for secondary structures.
- **Text High-Contrast:** `#F4F1FF` — Primary labels, vitals headers, and live alerts.
- **Text Subdued:** `#B4ABD6` — Timestamps, secondary telemetry meta-data, and clinical descriptors.

### Action & Signal Accents (10% — Neon Yellow)
- **High-Alert Neon:** `#E8FF3A` — Reserved strictly for primary action buttons (e.g., "Acknowledge Pain Alert"), active toggle pill tabs, core facial pain score digits, and localized micro-glow indicators.

### Triage & Clinical Severity Palette
Functional medical tokens isolated from general UI styling to convey pain scale indices instantly:
- **Stable (Score 0–2):** `#22C55E`
- **Moderate (Score 0�$�JN���ѐ�����H
���]�\�H
��ܙH��$��N���ѐ�L����H
��ܚ]X�[
��ܙH8�$�L
N���ээQX����\�ܘ\B��\�ܘ\H�[[��\�[X[��[�X�[[\]H�]�[�X�[[���[Y[��X�\�[ێ���H
��[�\��X�H��H	�XY[���
\��Z�\�H�[��N����[X�Y�܈]��[��Z[���[�Y]�X��\��\�Z\�Y�]ܚ\�Y�X�[]H]�\�XX�H\�[��\�ۈ�\�\���H\�^\�[�[ؚ[H�\��[��[�[˂�H
��[[Y]�H	��[X�\��
�]��Z[��[ۛ�N���[ۛ��X�Y�Y�\�\�[��\�H][�[ZX��[�Y]�X�]H
K�ˋ�X[][YHZ[���ܙ\��ۙ�Y[��H�][���[�K\�][ۈ��[�\�H�[�\��]�\����ܝ[ۘ[�Y�[���\�\��[��^[�][YۛY[�\�[���\Y�[YH�[��\˂�H
���[[��X[[�HX�[�
����[��]�[�Y�\�JN���\�Y[ۙ��YH[��\�\�\��X���[[�]H�[[��X[��][�]�ܚ��Xܛ���Y\�LH[�Y\�L�YYX�[�X�[]Y\ˈ�[[��X[Z\�Y��[���]\��X���\�X�[K�][�H�[�\�Y]IH�[]]�H�۝�^�HوHX���\[�Z[��[��\�X�[[�ЍP�������^[�]	��X�[��H^[�]][^�\�H�ZY�^X�H�\�ۜ�]�HܚY[��[�Y\�Y�܈X�]�\��
K�ˋTY��YYX�[����H[�[ؚ[H�\��H�][ۜ΂��H
��[ؚ[H
͎
N����[��KX��[[�^[�]��۝[�[�\��\�X�[�YYو�Y[ۚ]ܜ��ܝY��X�H�HZ[��XY�H��ܙK��]\�X\��[��\�[X
M�
K�\��\Έ\�[X��X�\��]�[��ܘ�HHZ[�[][H��[�[����و��H
��X�]����\�^\�
͎8�$�LNN\
N����X��[[��ZYܚY��\ܝ��YKX�K\�YH�]�
]�H]Y[��[Y\�H�Y]�ܝۈY��[�X�[[[Y]�K��[����ۈ�Y�
K�X\��[��K�\�[X��H
��\����[��[P�HX�
�HL�
N���L�X��[[�ܚY��\�\�][KX�Y]XY�[��Y]��
܈L��ۘ�\��[�]Y[��YY�K�X\��[����[X�]\��K�\�[X���[�[ZX��\�X�[�]\���X�H]�\�Y�HH�\�[[�HX]�^
�X�K^���Y��X�KL�
H�[��\�HY��\�X[��\�[ۈXܛ���[[Y]�H�XY�]˂����[]�][ۈ	�\���\�X[Y\�\��H\�\�H�Y�[�Y�\��[ܜX��\�[Hۈ^Y\�YZY�Y��[�][�\��]\�[�X]�H���Y��΂��H
���\�H^Y\�
]�[
N����ML��X�[��\��X��ܛ�[����YX��ܘ�[��[X�Y[����H�Y�X�[ۋ��H
���\�^Y\�
]�[JN���̐L�MX�]H�X�H�[ZK]�[��\�[�Z^
�X��ܛ�[���ؘJ����K�̊X
KZ\�Y�]HL��X����X�\��[\�[�[�[�[�[ۘ[ܚ\��][�N�\��Y�ؘJM�KMMK����JX��H
��[]�]Y[�[�	�[\��
]�[�N����QLM���]��X�����\�H\��Y�ؘJNM�N���
X�ܙ\�[�H�ٝ[X�Y[��[�]��ΈL�̜M�ؘJL����JK��ؘJM�KMMK���L�X��H
��ܚ]X�[[\��XY�H�]N����[�Z[���ܙH]��]�\�H܈ܚ]X�[H�\��ܙ\�[�[ZX�[H�Y�����H[X��H�]�\�]H��܈
K�ˋээQX
HX���\[�YY�HH��X][��[X�Y[���Έ��ؘJ���M��JX������\\�H[�\��X�H[X��X�\�H[�Y�YY[�\���ܛ�\��Y]\���[H�]�X�Y�X�ZXܛ�]�X]Y[�΂��H
��]Y[��\��	�]H[�[Ί��^X�]H�[Y]�
܈K��\�[X���[�Y^
H�ܛ�\��Y]\��ٝ[�[��HY�]X��[�X�[[��\�ۛY[��[H�ݚY[��[\H�ܛ�\�Y[���܈�]\��Y�\˂�H
���[X\�H�]ۜ�	�[�\�X�]�H[Ί���[H[\�\Y
��[�YY�[�NNN\
H�܈��Z[�[�\Y��ܙ[��H[�]ZX���\�X[��[��[�˂�H
��[�]�Y[�	��X�ۙ\�H�]ۜΊ��
�\�[X���[�Y[Y
H�L�
��\�[X
H�܈��\X���X�\�[[�Yܚ]K��H
��[[Y]�H�\Ί��[\�\Y�܈\�ܙ]H�[�X�[�]\���Y�H��[�Y
�
H�܈�[Y\�X�[ܘ\�[�\��ܘ[H[YK\�X�H��\˂������\ۙ[������]ۜH
���[X\�HX�[ۈ
�[ۈY[��N����X��ܛ�[��N���X^�ML��X
���ZY�
K�\�Y^�\�]�[H�܈ܚ]X�[]�ۙ�\�X][ۜ�
K�ˋ�X�ۛ��Y�H[\���YZ[�\�\�������K�ݙ\���X�H[Z[�[��H��[[��[�ZXܛ�Y���M��ؘJ�̋�MKN�
X��H
���X�ۙ\�HX�[ۈ
[X��\��N����X��ܛ�[��ؘJM�KMMK���L�X�ܙ\�\��Y�ؘJM�KMMK����X^э�Q���ݙ\���X��ܛ�[��ؘJM�KMMK�����X��H
��[Y\��[��H�\�Z\��X�[ێ�������]ۈ�]ЍP���ܙ\�[�ээQXݙ\�X��[��������\��	�]Y[��H�[�\�Y�]��Y]\��X��ܛ�[���ؘJ����K��JX�X�����\�وL�[�H\�ؘJM�KMMK����JX����K��HXY\��۝Z[���Y�[X�\�[��]��Z[��[ۛ�
�����
K]Y[�[�]X[�[��[[��X[\\�Y[�Y[�Y�Y\�
�P�KP�Y�8)!�)"8).8)`8)+
X"�
J�
K�
K�
X�
JN
K
Zn
Z�"���V�&VFFVB&V��F��RvV&6�fVVB��6�'�&FW2�fW&��Bf6����F�&�fV7F�'2&V�FW&VB���V��Ɩ�2F�G2�&v&��b��B�#Cr��b��ࠢ2226��2bFV�V�WG'�&FvW0����6WfW&�G�&FvS���f��VB���6�RF�7����r7W'&V�B��7FGW2�R�r��5$�D�4���v�F�&6�w&�V�B&v&�#CB�c2��B��R��FW�B4cC4cTV�&�&FW"�6�ƖB4cC4cTV����f��FW"6��3�����7F�fS�3Sc3�v�F�4��$TFW�B�7F�fS�4S�dc4&6�w&�V�Bv�F�3Sc#�FW�Bࠢ222��WG2b6ƖFW'0����FW�B�6V&6���WG3���&6�w&�V�B3Sc3��&�&FW"�6�ƖB&v&�c��SR�#3B��2��7F�fRf�7W27FFRG&�vvW'2&�&FW"6���"43D#�cv�B&���6�F�r7�&v&�c��SR�#3B��R��FW�B4cDcdf������F�&W6���B6ƖFW#���G&6�3$#CVv�F�7F�fR&�vR��v�Ɩv�FVB��4S�dc4�6�&7V�"F�V�"v�F�4S�dc46�ƖBf����BG�G&�6�F�rࠢ2226�V6�&��W2bF�vv�R6��G&��0����F�vv�R7v�F6����&6�w&�V�B3$#CVv�F�Ɩ�2&�&FW"�v�V�7F�fS�G&6�f���2v�F�4S�dc4�BF�V�"6��gG2F�3Sc#�����6�V6�&��W3���7V&VBv�F�G�&F�W2�'�&�&FW"4��$T�6�V6�VB7FFRF�7��24S�dc46�V6��&���3$#CV7W&f6Rࠢ222FF�F�����5R�7V6�f�26����V�G0����f�F�V�6RvfVf�&�7G&����֖�6�f2F�7����rƗfR�F�6�֖7&��w&��6RFWFV7F���&FRv�F����FVBƖ�R&V�FW&VB��4��$T�BV����G2��4S�dc4����&�Ɩ�wV�V�6��W'B&��W#���F�W'6�7FV�BF�7BG&vW"f�"&�B6��V�B��7��W2���v�Ɩv�F��r&VB�B��4S�dc4v�F�66��疖�r���F�&��B�.
JN
JN
X�
I^
K��ȃ�����ब)/�)*8))�)a�) �H8))�),8)cx))�8)&�)a�))8).
K^
J�
X"�