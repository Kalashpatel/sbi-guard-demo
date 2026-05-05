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
      { num: 5, title: 'Emergency Override Option', desc: 'Biometric + FIDO2 re-authentication' },
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
      { num: 5, title: 'Family Approves', desc: 'Face ID verification on family device' },
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
    document.getElementById('familyNotifText').innerHTML =
      `Your mother Kamala is transferring <span style="font-weight: 700;">₹75,000</span> to unknown account.`;
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
  const below60Screens = [0, 1, 2, 4, 4, 5];
  const elderlyScreens  = [0, 1, 2, 3, 3, 5];
  const map = currentScenario === 'below60' ? below60Screens : elderlyScreens;
  if (stepIndex < map.length) goToScreen(map[stepIndex]);
}

function goToScreen(screenNumber) {
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.remove('active');
  });

  document.getElementById(`screen${screenNumber}`).classList.add('active');

  const stepMap = { 0: 0, 1: 1, 2: 2, 3: 3, 4: 3, 5: 5, 6: 6, 7: 6 };
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

function approveFamilyNotification() {
  goToScreen(5);
  document.getElementById('successMessage').textContent =
    'Transaction approved by trusted family member after Face ID verification.';
  document.getElementById('protectionDetails').textContent =
    'Protected by: Risk analysis (95/100), elderly user protection, family approval via Face ID, and device-bound authentication.';
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

function initiateEmergencyOverride() {
  const btn = event.target;
  btn.textContent = '🔄 Verifying Biometric...';
  btn.disabled = true;

  setTimeout(() => {
    btn.textContent = '✓ Biometric Verified';
    setTimeout(() => {
      btn.textContent = '🔐 Validating FIDO2...';
      setTimeout(() => {
        btn.textContent = '✓ Device Authentication Complete';
        setTimeout(() => {
          goToScreen(5);
          document.getElementById('successMessage').textContent =
            'Transaction completed using emergency override with device-bound authentication.';
          document.getElementById('protectionDetails').textContent =
            'Protected by: Risk analysis (95/100), RBI 1-hour delay override via Biometric + FIDO2, and device origin verification.';
        }, 800);
      }, 1200);
    }, 800);
  }, 1500);
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
  goToScreen(0);
  document.getElementById('authBtn').disabled = false;
  document.getElementById('authBtnText').textContent = '🔐 Authenticate with Biometric + FIDO2';
}

// Initialize
updateFlowSteps();
goToScreen(0);
