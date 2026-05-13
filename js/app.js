let currentScenario = 'below60';
let countdownInterval;

const scenarios = {
  below60: {
    userName: 'Priya Sharma',
    userAge: '42 years',
    userAvatar: 'PS',
    steps: [
      { num: 1, title: 'Device-Bound Login', desc: 'FIDO2 + Biometric prevents scammer access' },
      { num: 2, title: 'Transaction Initiated', desc: 'User enters ₹75,000 transfer' },
      { num: 3, title: 'Risk Detection', desc: 'ML flags high-risk (95/100)' },
      { num: 4, title: 'RBI 1-Hour Delay', desc: 'Mandatory wait for >₹10k transactions' },
      { num: 5, title: 'Cognitive Challenge', desc: 'Solve puzzle → confirm independent decision' },
      { num: 6, title: 'Transaction Complete', desc: 'Multi-layer verification passed' },
      { num: '✕', title: 'Transaction Cancelled', desc: 'User cancelled the transfer safely', cancelled: true }
    ]
  },
  elderly: {
    userName: 'Kamala Devi',
    userAge: '68 years',
    userAvatar: 'KD',
    steps: [
      { num: 1, title: 'Device-Bound Login', desc: 'FIDO2 + Biometric prevents scammer access' },
      { num: 2, title: 'Transaction Initiated', desc: 'Elderly user enters ₹75,000' },
      { num: 3, title: 'Risk Detection', desc: 'ML flags high-risk (95/100)' },
      { num: 4, title: 'Family Notification Sent', desc: 'Trusted contact approval required' },
      { num: 5, title: 'Family Verifies', desc: 'Biometric + FIDO2 + Cognitive check' },
      { num: 6, title: 'Transaction Complete', desc: 'Dual-party verification passed' },
      { num: '✕', title: 'Transaction Cancelled', desc: 'Trusted contact blocked · Elder notified', cancelled: true }
    ]
  }
};

function setScenario(scenario) {
  currentScenario = scenario;
  document.getElementById('btnBelow60').classList.toggle('active', scenario === 'below60');
  document.getElementById('btnElderly').classList.toggle('active', scenario === 'elderly');
  updateFlowSteps();

  const s = scenarios[scenario];
  document.getElementById('userName').textContent = s.userName;
  document.getElementById('userAge').textContent = `Age: ${s.userAge}`;
  document.getElementById('userAvatar').textContent = s.userAvatar;

  if (scenario === 'elderly') {
    // RBI compliance: never expose the transaction amount in a push notification
    document.getElementById('familyNotifText').innerHTML =
      `Your mother Kamala has initiated a <span style="font-weight: 700; color: #FF6B35;">HIGH-RISK transaction</span> to an unknown account.`;
  }
}

function updateFlowSteps() {
  const steps = scenarios[currentScenario].steps;
  const html = steps.map((step, index) => {
    const cancelledClass = step.cancelled ? ' cancelled-step' : '';
    return `
      <div class="flow-step${cancelledClass} ${index === 0 ? 'active' : ''}" onclick="navigateToStep(${index})">
        <div class="step-number">${step.num}</div>
        <div class="step-content">
          <div class="step-title">${step.title}</div>
          <div class="step-desc">${step.desc}</div>
        </div>
      </div>
    `;
  }).join('');
  document.getElementById('flowSteps').innerHTML = html;
}

function navigateToStep(stepIndex) {
  const steps = scenarios[currentScenario].steps;
  if (steps[stepIndex] && steps[stepIndex].cancelled) {
    if (currentScenario === 'below60') {
      cancelTransaction();
    } else {
      declineTransaction();
    }
    return;
  }
  // Step 4 for below60 → cognitive challenge; for elderly → family verification
  if (currentScenario === 'below60' && stepIndex === 4) {
    startCognitiveChallenge();
    return;
  }
  if (currentScenario === 'elderly' && stepIndex === 4) {
    startFamilyVerification();
    return;
  }
  const below60Screens = [0, 1, 2, 4, 8, 5];
  const elderlyScreens  = [0, 1, 2, 3, 9, 5];
  const map = currentScenario === 'below60' ? below60Screens : elderlyScreens;
  if (stepIndex < map.length) goToScreen(map[stepIndex]);
}

function goToScreen(screenNumber) {
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.remove('active');
  });

  document.getElementById(`screen${screenNumber}`).classList.add('active');

  const stepMap = { 0: 0, 1: 1, 2: 2, 3: 3, 4: 3, 5: 5, 6: 6, 7: 6, 8: 4, 9: 4 };
  document.querySelectorAll('.flow-step').forEach((step, index) => {
    step.classList.toggle('active', index === stepMap[screenNumber]);
  });

  if (countdownInterval) clearInterval(countdownInterval);

  if (screenNumber === 4) {
    startCountdown();
  }
}

function simulateBiometricAuth() {
  const btn = document.getElementById('authBtn');
  const btnText = document.getElementById('authBtnText');

  btnText.textContent = '🔄 Authenticating...';
  btn.disabled = true;

  setTimeout(() => {
    btnText.textContent = '✓ Biometric Verified';
    setTimeout(() => {
      btnText.textContent = '🔐 Validating FIDO2 Device...';
      setTimeout(() => {
        btnText.textContent = '✓ Device Trusted - Access Granted';
        setTimeout(() => {
          goToScreen(1);
        }, 800);
      }, 1200);
    }, 800);
  }, 1500);
}

function initiateTransfer() {
  goToScreen(2);

  if (currentScenario === 'below60') {
    document.getElementById('rbiDelaySection').innerHTML = `
      <div class="countdown-timer">
        <div style="font-size: 12px; color: rgba(255,255,255,0.85);">RBI MANDATORY DELAY</div>
        <div style="font-size: 28px; font-weight: 700; letter-spacing: 2px; margin: 6px 0;">1 Hour Required</div>
        <div style="font-size: 12px; color: rgba(255,255,255,0.9);">For transactions > ₹10,000</div>
      </div>
    `;
    document.getElementById('actionButtonsSection').innerHTML = `
      <div class="action-buttons">
        <button class="btn btn-secondary" onclick="cancelTransaction()" style="flex: 1;">Cancel</button>
        <button class="btn btn-primary" onclick="goToScreen(4)" style="flex: 1;">View Delay / Override</button>
      </div>
    `;
  } else {
    document.getElementById('rbiDelaySection').innerHTML = `
      <div class="info-card" style="background: #FFF3E0; border-left: 4px solid #FF6B35;">
        <div style="font-weight: 600; margin-bottom: 8px; color: #C2410C;">👵 Elderly User Detected</div>
        <div style="font-size: 12px; color: #78350F;">
          Your registered trusted family member will be notified for approval as per RBI guidelines for senior citizens.
        </div>
      </div>
    `;
    document.getElementById('actionButtonsSection').innerHTML = `
      <div class="action-buttons">
        <button class="btn btn-secondary" onclick="cancelTransaction()" style="flex: 1;">Cancel</button>
        <button class="btn btn-primary" onclick="sendFamilyNotification()" style="flex: 1;">Request Approval</button>
      </div>
    `;
  }
}

function sendFamilyNotification() {
  goToScreen(3);
}

// ── Family Member Verification (Elderly Scenario) ────────────────

let familyCognitiveAttempts = 0;
let currentFamilyChallenge = null;
let familyChallengeQueue = [];

function startFamilyVerification() {
  // Reset to initial bio-step state each time
  familyCognitiveAttempts = 0;
  currentFamilyChallenge = null;
  familyChallengeQueue = [];

  document.getElementById('familyBioStep').style.display = 'block';
  document.getElementById('familyChallengeStep').style.display = 'none';
  document.getElementById('familyAmountDisplay').textContent = '₹ **,***';
  document.getElementById('familyAmountDisplay').style.letterSpacing = '2px';

  const btn = document.getElementById('familyAuthBtn');
  btn.disabled = false;
  btn.textContent = '🔐 Verify with Biometric + FIDO2';

  goToScreen(9);
}

function startFamilyBiometricAuth() {
  const btn = document.getElementById('familyAuthBtn');
  btn.disabled = true;
  btn.textContent = '🔄 Verifying Biometric…';

  setTimeout(() => {
    btn.textContent = '✓ Biometric Verified';
    setTimeout(() => {
      btn.textContent = '🔐 Validating FIDO2 Device…';
      setTimeout(() => {
        btn.textContent = '✓ Device Authentication Complete';
        // Reveal the full amount now that the family member is authenticated
        const amtEl = document.getElementById('familyAmountDisplay');
        amtEl.textContent = '₹ 75,000';
        amtEl.style.letterSpacing = 'normal';
        setTimeout(showFamilyChallengeStep, 700);
      }, 1200);
    }, 800);
  }, 1500);
}

function showFamilyChallengeStep() {
  document.getElementById('familyBioStep').style.display = 'none';
  document.getElementById('familyChallengeStep').style.display = 'block';

  familyChallengeQueue = [makeMathChallenge, makeTransactionChallenge, makeSequenceChallenge]
    .sort(() => Math.random() - 0.5)
    .map(fn => fn());
  currentFamilyChallenge = familyChallengeQueue.shift();
  renderFamilyChallenge();
}

function renderFamilyChallenge() {
  document.getElementById('familyChallengeQuestion').textContent = currentFamilyChallenge.question;
  document.getElementById('familyChallengeResult').textContent = '';

  document.getElementById('familyChallengeOptions').innerHTML = currentFamilyChallenge.options
    .map((opt, i) => `<button class="challenge-option" onclick="selectFamilyChallengeOption(${i})">${opt}</button>`)
    .join('');

  const remaining = 3 - familyCognitiveAttempts;
  document.getElementById('familyAttemptDots').innerHTML = Array.from({ length: 3 }, (_, i) =>
    `<div class="attempt-dot ${i >= remaining ? 'used' : ''}"></div>`
  ).join('');
}

function selectFamilyChallengeOption(index) {
  const btns = document.querySelectorAll('#familyChallengeOptions .challenge-option');
  btns.forEach(b => { b.disabled = true; });

  const resultEl = document.getElementById('familyChallengeResult');

  if (index === currentFamilyChallenge.correctIndex) {
    btns[index].classList.add('correct');
    resultEl.style.color = '#2E7D32';
    resultEl.textContent = '✓ Verified! Approving transaction…';
    setTimeout(() => {
      goToScreen(5);
      document.getElementById('successMessage').textContent =
        'Transaction approved by trusted family member after Biometric + FIDO2 + Cognitive verification.';
      document.getElementById('protectionDetails').innerHTML =
        'Protected by: Risk score 95/100 &nbsp;|&nbsp; Elderly user protection &nbsp;|&nbsp; Family Biometric + FIDO2 verified &nbsp;|&nbsp; 🧠 Cognitive challenge passed.';
    }, 1200);
  } else {
    familyCognitiveAttempts++;
    btns[index].classList.add('wrong');

    if (familyCognitiveAttempts >= 3) {
      resultEl.style.color = '#C62828';
      resultEl.textContent = '✗ Verification failed. Transaction will be declined.';
      setTimeout(declineTransaction, 1500);
    } else {
      resultEl.style.color = '#C62828';
      resultEl.textContent = `✗ Incorrect. ${3 - familyCognitiveAttempts} attempt${3 - familyCognitiveAttempts > 1 ? 's' : ''} remaining.`;
      currentFamilyChallenge = familyChallengeQueue.shift();
      setTimeout(renderFamilyChallenge, 1400);
    }
  }
}

function cancelTransaction() {
  goToScreen(6);
  if (currentScenario === 'below60') {
    document.getElementById('cancelMessage').textContent =
      'You have cancelled the ₹75,000 transfer. No money has been sent. The transaction was safely abandoned during the RBI safety window.';
    document.getElementById('cancelProtectionDetails').innerHTML = `
      <div style="font-size: 13px; font-weight: 600; color: #1565C0; margin-bottom: 8px;">🛡️ G.U.A.R.D. Protection Applied</div>
      <div style="font-size: 12px; color: #424242; line-height: 1.6;">
        Risk analysis flagged this transaction at 95/100. You chose to cancel during the RBI 1-hour safety window. Your ₹75,000 remains secure in your account.
      </div>
    `;
  } else {
    document.getElementById('cancelMessage').textContent =
      'You have cancelled the ₹75,000 transfer. Your trusted family member has been notified of the cancellation.';
    document.getElementById('cancelProtectionDetails').innerHTML = `
      <div style="font-size: 13px; font-weight: 600; color: #1565C0; margin-bottom: 8px;">🛡️ G.U.A.R.D. Protection Applied</div>
      <div style="font-size: 12px; color: #424242; line-height: 1.6;">
        Elderly user protection active. Transaction cancelled before family review was completed. Risk score: 95/100. Your funds are safe.
      </div>
    `;
  }
}

function declineTransaction() {
  goToScreen(7);
}

// ── Cognitive Challenge ──────────────────────────────────────────

let cognitiveAttempts = 0;
let currentChallenge = null;
let challengeQueue = [];

function shuffleOptions(correct, wrong1, wrong2) {
  const items = [
    { display: correct, isCorrect: true },
    { display: wrong1, isCorrect: false },
    { display: wrong2, isCorrect: false }
  ];
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return { options: items.map(x => x.display), correctIndex: items.findIndex(x => x.isCorrect) };
}

function makeMathChallenge() {
  const a = Math.floor(Math.random() * 41) + 20;
  const b = Math.floor(Math.random() * 41) + 20;
  const correct = a + b;
  const { options, correctIndex } = shuffleOptions(correct, correct + 11, correct - 9);
  return {
    question: `What is  ${a} + ${b} ?`,
    options: options.map(String),
    correctIndex
  };
}

function makeTransactionChallenge() {
  // Directly tied to the current transaction — makes the user think about what they're doing
  const { options, correctIndex } = shuffleOptions('₹48,456', '₹38,456', '₹58,456');
  return {
    question: `You are transferring ₹75,000 from your savings balance of ₹1,23,456.\n\nHow much will remain in your account?`,
    options,
    correctIndex
  };
}

function makeSequenceChallenge() {
  const start = Math.floor(Math.random() * 5) + 3;
  const step  = Math.floor(Math.random() * 4) + 3;
  const seq   = [start, start + step, start + 2 * step, start + 3 * step];
  const correct = start + 4 * step;
  const { options, correctIndex } = shuffleOptions(correct, correct + step, correct - step + 1);
  return {
    question: `What comes next in the pattern?\n${seq.join(',  ')},  ?`,
    options: options.map(String),
    correctIndex
  };
}

function startCognitiveChallenge() {
  cognitiveAttempts = 0;
  // Shuffle all three types so each attempt shows a different challenge
  challengeQueue = [makeMathChallenge, makeTransactionChallenge, makeSequenceChallenge]
    .sort(() => Math.random() - 0.5)
    .map(fn => fn());
  currentChallenge = challengeQueue.shift();
  goToScreen(8);
  renderChallenge();
}

function renderChallenge() {
  document.getElementById('challengeQuestion').textContent = currentChallenge.question;
  document.getElementById('challengeResult').textContent = '';

  document.getElementById('challengeOptions').innerHTML = currentChallenge.options
    .map((opt, i) => `<button class="challenge-option" onclick="selectChallengeOption(${i})">${opt}</button>`)
    .join('');

  const remaining = 3 - cognitiveAttempts;
  document.getElementById('attemptDots').innerHTML = Array.from({ length: 3 }, (_, i) =>
    `<div class="attempt-dot ${i >= remaining ? 'used' : ''}"></div>`
  ).join('');
}

function selectChallengeOption(index) {
  const btns = document.querySelectorAll('.challenge-option');
  btns.forEach(b => { b.disabled = true; });

  const resultEl = document.getElementById('challengeResult');

  if (index === currentChallenge.correctIndex) {
    btns[index].classList.add('correct');
    resultEl.style.color = '#2E7D32';
    resultEl.textContent = '✓ Correct! Verifying your identity…';
    setTimeout(runBiometricAuth, 900);
  } else {
    cognitiveAttempts++;
    btns[index].classList.add('wrong');

    if (cognitiveAttempts >= 3) {
      resultEl.style.color = '#C62828';
      resultEl.textContent = '✗ Incorrect. Transaction has been blocked for your protection.';
      setTimeout(blockDueToFailedChallenge, 1500);
    } else {
      resultEl.style.color = '#C62828';
      resultEl.textContent = `✗ Incorrect. ${3 - cognitiveAttempts} attempt${3 - cognitiveAttempts > 1 ? 's' : ''} remaining.`;
      currentChallenge = challengeQueue.shift();
      setTimeout(renderChallenge, 1400);
    }
  }
}

function runBiometricAuth() {
  // Replace challenge card content with biometric animation
  document.getElementById('challengeCard').innerHTML = `
    <div style="text-align: center; padding: 16px 0;">
      <div style="font-size: 48px; margin-bottom: 14px;">🔐</div>
      <div id="bioStatus" style="font-size: 15px; font-weight: 600; color: #1C3F7A;">Verifying Biometric…</div>
      <div style="font-size: 12px; color: #888; margin-top: 8px;">Please hold still</div>
    </div>
  `;
  const s = document.getElementById('bioStatus');
  setTimeout(() => { s.textContent = '✓ Biometric Verified'; }, 1000);
  setTimeout(() => { s.textContent = '🔐 Validating FIDO2 Device…'; }, 1900);
  setTimeout(() => { s.textContent = '✓ Device Authentication Complete'; }, 3200);
  setTimeout(() => {
    goToScreen(5);
    document.getElementById('successMessage').textContent =
      'Transaction completed — cognitive challenge passed and device-bound authentication verified.';
    document.getElementById('protectionDetails').innerHTML =
      '🧠 Cognitive verification passed &nbsp;|&nbsp; Risk score 95/100 &nbsp;|&nbsp; RBI delay overridden via Biometric + FIDO2 &nbsp;|&nbsp; Device origin verified.';
  }, 4000);
}

function blockDueToFailedChallenge() {
  goToScreen(6);
  document.getElementById('cancelMessage').textContent =
    'Transaction blocked. Cognitive verification failed 3 times — a precautionary measure to protect you from potential scam.';
  document.getElementById('cancelProtectionDetails').innerHTML = `
    <div style="font-size: 13px; font-weight: 600; color: #1565C0; margin-bottom: 8px;">🛡️ G.U.A.R.D. Protection Applied</div>
    <div style="font-size: 12px; color: #424242; line-height: 1.6;">
      Cognitive challenge failed 3 times. Transaction automatically blocked as a protective measure. If this was genuine, visit your nearest SBI branch or call <strong>1930</strong>.
    </div>
  `;
}

function startCountdown() {
  let seconds = 3587;
  updateCountdownDisplay(seconds);
  countdownInterval = setInterval(() => {
    seconds--;
    updateCountdownDisplay(seconds);
    if (seconds <= 0) clearInterval(countdownInterval);
  }, 1000);
}

function updateCountdownDisplay(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  document.getElementById('countdown').textContent =
    `${mins}:${secs.toString().padStart(2, '0')}`;
}

function resetDemo() {
  cognitiveAttempts = 0;
  challengeQueue = [];
  currentChallenge = null;
  familyCognitiveAttempts = 0;
  familyChallengeQueue = [];
  currentFamilyChallenge = null;
  goToScreen(0);
  document.getElementById('authBtn').disabled = false;
  document.getElementById('authBtnText').textContent = '🔐 Authenticate with Biometric + FIDO2';
}

// Initialize
updateFlowSteps();
goToScreen(0);
