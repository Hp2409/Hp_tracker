// Firebase Configuration and Initialization
console.log('[HP Tracker] Initializing Firebase Auth');

const firebaseConfig = {
  apiKey: "AIzaSyDnczxKTkqqHP3gpwFEAM6zEwXBKsN2q-E",
  authDomain: "hp-tracker-c9d56.firebaseapp.com",
  databaseURL: "https://hp-tracker-c9d56-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "hp-tracker-c9d56",
  storageBucket: "hp-tracker-c9d56.firebasestorage.app",
  messagingSenderId: "791153884054",
  appId: "1:791153884054:web:8eebcba830cab91d767bb7",
  measurementId: "G-N9H7DLEBPY"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

const RECAPTCHA_SITE_KEY = '6LeowzMsAAAAAOJIebEUc4s1JuAagFNf-y5h5MIt';

// ============================================================================
// CHECK IF ALREADY LOGGED IN - REDIRECT TO DASHBOARD
// ============================================================================

auth.onAuthStateChanged(user => {
  if (user) {
    console.log('[HP Tracker] User already logged in, redirecting to dashboard');
    window.location.href = '/dashboard.html';
  }
});

// ============================================================================
// UI UTILITY FUNCTIONS
// ============================================================================

// Toggle password visibility
function togglePasswordVisibility(button) {
  const wrapper = button.closest('.input-wrapper');
  const input = wrapper.querySelector('input');
  const eyeIcon = button.querySelector('.eye-icon');
  
  if (input.type === 'password') {
    input.type = 'text';
    eyeIcon.textContent = '🙈';
  } else {
    input.type = 'password';
    eyeIcon.textContent = '👁️';
  }
}

// Clear all form inputs
function clearAllInputs() {
  document.querySelectorAll('input').forEach(input => {
    input.value = '';
    input.classList.remove('error', 'success');
  });
}

// Switch between forms with animation
function switchToSignup() {
  const authCard = document.getElementById('authCard');
  authCard.style.animation = 'fadeOut 0.3s ease';
  
  setTimeout(() => {
    clearAllInputs();
    clearErrors();
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('signupForm').classList.remove('hidden');
    document.getElementById('forgotPasswordForm').classList.add('hidden');
    document.getElementById('authTitle').textContent = 'Create Account';
    authCard.style.animation = 'fadeIn 0.6s ease';
  }, 300);
}

function switchToLogin() {
  const authCard = document.getElementById('authCard');
  authCard.style.animation = 'fadeOut 0.3s ease';
  
  setTimeout(() => {
    clearAllInputs();
    clearErrors();
    document.getElementById('signupForm').classList.add('hidden');
    document.getElementById('loginForm').classList.remove('hidden');
    document.getElementById('forgotPasswordForm').classList.add('hidden');
    document.getElementById('authTitle').textContent = 'Welcome Back';
    authCard.style.animation = 'fadeIn 0.6s ease';
  }, 300);
}

function switchToForgotPassword() {
  const authCard = document.getElementById('authCard');
  authCard.style.animation = 'fadeOut 0.3s ease';
  
  setTimeout(() => {
    clearAllInputs();
    clearErrors();
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('signupForm').classList.add('hidden');
    document.getElementById('forgotPasswordForm').classList.remove('hidden');
    document.getElementById('authTitle').textContent = 'Reset Password';
    authCard.style.animation = 'fadeIn 0.6s ease';
  }, 300);
}

// Clear all error messages
function clearErrors() {
  document.querySelectorAll('.error-message').forEach(el => {
    el.classList.add('hidden');
    el.textContent = '';
  });
  document.querySelectorAll('input').forEach(input => {
    input.classList.remove('error', 'success');
  });
  document.getElementById('successMessage').classList.add('hidden');
}

// Show error message
function showError(elementId, message) {
  const errorEl = document.getElementById(elementId);
  errorEl.textContent = '⚠️ ' + message;
  errorEl.classList.remove('hidden');
  
  const inputId = elementId.replace('Error', '');
  const input = document.getElementById(inputId);
  if (input) {
    input.classList.add('error');
    input.classList.remove('success');
    // Shake animation
    input.style.animation = 'shake 0.5s ease';
    setTimeout(() => input.style.animation = '', 500);
  }
}

// Show success message
function showSuccess(message) {
  const successEl = document.getElementById('successMessage');
  document.getElementById('successText').textContent = message;
  successEl.classList.remove('hidden');
  successEl.style.animation = 'bounceIn 0.5s ease';
}

// ============================================================================
// RECAPTCHA FUNCTIONS
// ============================================================================

async function getRecaptchaToken(action) {
  try {
    if (typeof grecaptcha === 'undefined') {
      console.warn('[HP Tracker] reCAPTCHA not loaded, skipping verification');
      return null;
    }
    
    const token = await grecaptcha.execute(RECAPTCHA_SITE_KEY, { action: action });
    console.log('[HP Tracker] reCAPTCHA token generated for action:', action);
    
    // Show reCAPTCHA badge briefly
    const badge = document.querySelector('.grecaptcha-badge');
    if (badge) {
      badge.style.opacity = '1';
      setTimeout(() => badge.style.opacity = '0', 2000);
    }
    
    return token;
  } catch (error) {
    console.error('[HP Tracker] reCAPTCHA error:', error);
    return null;
  }
}

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

const passwordRules = {
  length: (p) => p.length >= 8,
  uppercase: (p) => /[A-Z]/.test(p),
  lowercase: (p) => /[a-z]/.test(p),
  number: (p) => /[0-9]/.test(p),
  special: (p) => /[!@#$%^&*]/.test(p)
};

// ============================================================================
// EVENT LISTENERS SETUP
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
  // Initialize reCAPTCHA badge styling
  setTimeout(() => {
    const badge = document.querySelector('.grecaptcha-badge');
    if (badge) {
      badge.style.opacity = '0';
      badge.style.transition = 'opacity 0.3s ease';
    }
  }, 1000);

  // Password toggle buttons
  document.querySelectorAll('.password-toggle').forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      togglePasswordVisibility(this);
    });
    
    button.addEventListener('mousedown', (e) => {
      e.preventDefault();
    });
  });

  // Navigation links
  const switchToSignupLink = document.getElementById('switchToSignupLink');
  const switchToLoginLink = document.getElementById('switchToLoginLink');
  const forgotPasswordLink = document.getElementById('forgotPasswordLink');
  const backToLoginLink = document.getElementById('backToLoginLink');

  if (switchToSignupLink) {
    switchToSignupLink.addEventListener('click', (e) => {
      e.preventDefault();
      switchToSignup();
    });
  }

  if (switchToLoginLink) {
    switchToLoginLink.addEventListener('click', (e) => {
      e.preventDefault();
      switchToLogin();
    });
  }

  if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener('click', (e) => {
      e.preventDefault();
      switchToForgotPassword();
    });
  }

  if (backToLoginLink) {
    backToLoginLink.addEventListener('click', (e) => {
      e.preventDefault();
      switchToLogin();
    });
  }

  // Action buttons
  const loginBtn = document.getElementById('loginBtn');
  const signupBtn = document.getElementById('signupBtn');
  const resetBtn = document.getElementById('resetBtn');

  if (loginBtn) {
    loginBtn.addEventListener('click', handleLogin);
  }

  if (signupBtn) {
    signupBtn.addEventListener('click', handleSignup);
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', handlePasswordReset);
  }

  // Real-time password validation
  const signupPasswordInput = document.getElementById('signupPassword');
  if (signupPasswordInput) {
    signupPasswordInput.addEventListener('input', (e) => {
      const password = e.target.value;
      
      Object.keys(passwordRules).forEach(rule => {
        const reqEl = document.getElementById(`req-${rule}`);
        if (reqEl) {
          const icon = reqEl.querySelector('.requirement-icon');
          
          if (passwordRules[rule](password)) {
            reqEl.classList.add('met');
            reqEl.classList.remove('unmet');
            icon.textContent = '✓';
            reqEl.style.animation = 'checkMark 0.3s ease';
          } else {
            reqEl.classList.add('unmet');
            reqEl.classList.remove('met');
            icon.textContent = '○';
            reqEl.style.animation = '';
          }
        }
      });
    });
  }

  // Enter key handlers
  const loginPassword = document.getElementById('loginPassword');
  if (loginPassword) {
    loginPassword.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleLogin();
      }
    });
  }

  const signupConfirmPassword = document.getElementById('signupConfirmPassword');
  if (signupConfirmPassword) {
    signupConfirmPassword.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSignup();
      }
    });
  }

  const resetEmail = document.getElementById('resetEmail');
  if (resetEmail) {
    resetEmail.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handlePasswordReset();
      }
    });
  }
});

// ============================================================================
// LOGIN HANDLER
// ============================================================================

async function handleLogin() {
  clearErrors();
  
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value.trim();
  const loginBtn = document.getElementById('loginBtn');

  let hasError = false;
  
  if (!email) {
    showError('loginEmailError', 'Email is required');
    hasError = true;
  } else if (!isValidEmail(email)) {
    showError('loginEmailError', 'Please enter a valid email address');
    hasError = true;
  }

  if (!password) {
    showError('loginPasswordError', 'Password is required');
    hasError = true;
  }

  if (hasError) return;

  loginBtn.disabled = true;
  loginBtn.classList.add('loading');
  loginBtn.style.transform = 'scale(0.98)';

  try {
    const recaptchaToken = await getRecaptchaToken('login');
    console.log('[HP Tracker] Login with reCAPTCHA protection');

    await auth.signInWithEmailAndPassword(email, password);
    
    showSuccess('Login successful! Redirecting...');
    console.log('[HP Tracker] Login successful');
    
    // Clear inputs and redirect to dashboard
    clearAllInputs();
    
    setTimeout(() => {
      window.location.href = '/dashboard.html';
    }, 1000);
    
  } catch (err) {
    console.error('[HP Tracker] Login error:', err);
    
    let errorMessage = 'Login failed. Please try again.';
    if (err.code === 'auth/user-not-found') {
      errorMessage = 'No account found with this email';
    } else if (err.code === 'auth/wrong-password') {
      errorMessage = 'Incorrect password';
    } else if (err.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email address';
    } else if (err.code === 'auth/too-many-requests') {
      errorMessage = 'Too many failed attempts. Please try again later.';
    } else if (err.code === 'auth/invalid-credential') {
      errorMessage = 'Invalid email or password';
    }
    
    showError('loginPasswordError', errorMessage);
  } finally {
    loginBtn.disabled = false;
    loginBtn.classList.remove('loading');
    loginBtn.style.transform = '';
  }
}

// ============================================================================
// SIGNUP HANDLER
// ============================================================================

async function handleSignup() {
  clearErrors();
  
  const name = document.getElementById('signupName').value.trim();
  const email = document.getElementById('signupEmail').value.trim();
  const password = document.getElementById('signupPassword').value.trim();
  const confirmPassword = document.getElementById('signupConfirmPassword').value.trim();
  const signupBtn = document.getElementById('signupBtn');

  let hasError = false;
  
  if (!name) {
    showError('signupNameError', 'Name is required');
    hasError = true;
  } else if (name.length < 2) {
    showError('signupNameError', 'Name must be at least 2 characters');
    hasError = true;
  }

  if (!email) {
    showError('signupEmailError', 'Email is required');
    hasError = true;
  } else if (!isValidEmail(email)) {
    showError('signupEmailError', 'Please enter a valid email address (e.g., user@example.com)');
    hasError = true;
  }

  if (!password) {
    showError('signupPasswordError', 'Password is required');
    hasError = true;
  } else {
    const failedRules = Object.keys(passwordRules).filter(rule => !passwordRules[rule](password));
    if (failedRules.length > 0) {
      const input = document.getElementById('signupPassword');
      input.classList.add('error');
      input.scrollIntoView({ behavior: 'smooth', block: 'center' });
      hasError = true;
    }
  }

  if (!confirmPassword) {
    showError('signupConfirmError', 'Please confirm your password');
    hasError = true;
  } else if (password !== confirmPassword) {
    showError('signupConfirmError', 'Passwords do not match');
    hasError = true;
  }

  if (hasError) return;

  signupBtn.disabled = true;
  signupBtn.classList.add('loading');
  signupBtn.style.transform = 'scale(0.98)';

  try {
    const recaptchaToken = await getRecaptchaToken('signup');
    console.log('[HP Tracker] Signup with reCAPTCHA protection');

    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    
    await userCredential.user.updateProfile({
      displayName: name
    });
    
    showSuccess('Account created successfully! Redirecting...');
    console.log('[HP Tracker] Signup successful');
    
    // Clear inputs and redirect to dashboard
    clearAllInputs();
    
    setTimeout(() => {
      window.location.href = '/dashboard.html';
    }, 1500);
    
  } catch (err) {
    console.error('[HP Tracker] Signup error:', err);
    
    let errorMessage = 'Signup failed. Please try again.';
    if (err.code === 'auth/email-already-in-use') {
      errorMessage = 'This email is already registered. Please login instead.';
      showError('signupEmailError', errorMessage);
    } else if (err.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email address';
      showError('signupEmailError', errorMessage);
    } else if (err.code === 'auth/weak-password') {
      errorMessage = 'Password is too weak. Please use a stronger password.';
      showError('signupPasswordError', errorMessage);
    } else {
      showError('signupConfirmError', errorMessage);
    }
  } finally {
    signupBtn.disabled = false;
    signupBtn.classList.remove('loading');
    signupBtn.style.transform = '';
  }
}

// ============================================================================
// PASSWORD RESET HANDLER
// ============================================================================

async function handlePasswordReset() {
  clearErrors();
  
  const email = document.getElementById('resetEmail').value.trim();
  const resetBtn = document.getElementById('resetBtn');

  if (!email) {
    showError('resetEmailError', 'Email is required');
    return;
  }
  
  if (!isValidEmail(email)) {
    showError('resetEmailError', 'Please enter a valid email address');
    return;
  }

  resetBtn.disabled = true;
  resetBtn.classList.add('loading');
  resetBtn.style.transform = 'scale(0.98)';

  try {
    const recaptchaToken = await getRecaptchaToken('password_reset');
    console.log('[HP Tracker] Password reset with reCAPTCHA protection');

    await auth.sendPasswordResetEmail(email);
    
    showSuccess('Password reset email sent! Check your inbox.');
    console.log('[HP Tracker] Password reset email sent to:', email);
    
    // Clear the input
    document.getElementById('resetEmail').value = '';
    
    setTimeout(() => {
      switchToLogin();
    }, 3000);
    
  } catch (err) {
    console.error('[HP Tracker] Password reset error:', err);
    
    let errorMessage = 'Failed to send reset email. Please try again.';
    if (err.code === 'auth/user-not-found') {
      errorMessage = 'No account found with this email address';
    } else if (err.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email address';
    } else if (err.code === 'auth/too-many-requests') {
      errorMessage = 'Too many requests. Please try again later.';
    }
    
    showError('resetEmailError', errorMessage);
  } finally {
    resetBtn.disabled = false;
    resetBtn.classList.remove('loading');
    resetBtn.style.transform = '';
  }
}