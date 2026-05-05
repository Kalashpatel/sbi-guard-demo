# G.U.A.R.D. System — SBI YONO Fraud Prevention Demo

**G**uided **U**ser **A**uthentication & **R**isk **D**etection

An interactive prototype demonstrating a multi-layer fraud prevention system for SBI YONO, built to comply with RBI guidelines and protect users from social engineering attacks.

## Live Demo

Open `index.html` in any browser — no server or build step required.

## Features

- **Device-Bound Authentication** — FIDO2 + biometric login prevents scammers from accessing accounts even with stolen credentials
- **ML Risk Scoring** — real-time transaction risk analysis (0–100 score)
- **Age-Based Workflows** — different protection flows for users below 60 vs senior citizens (60+)
- **RBI 1-Hour Delay** — mandatory cooling-off period for transactions above ₹10,000
- **Family Approval** — elderly users require trusted family member approval via Face ID
- **Emergency Override** — device-bound re-authentication for genuine emergencies

## Scenarios

| Scenario | User | Flow |
|----------|------|------|
| Below 60 | Priya Sharma, 42 yrs | Login → Transfer → Risk Alert → RBI Delay → Override |
| Elderly (60+) | Kamala Devi, 68 yrs | Login → Transfer → Risk Alert → Family Notification → Approval |

## File Structure

```
guard-demo/
├── index.html       # Main HTML (screen layouts)
├── css/
│   └── styles.css   # All styles
├── js/
│   └── app.js       # Demo logic and screen transitions
└── README.md
```

## Tech Stack

Pure HTML, CSS, and vanilla JavaScript — no frameworks or dependencies.
