let currentStep = 1;
let selectedAddons = {};

document.addEventListener('DOMContentLoaded', () => {
    initReviewsSlider();
    initStickyCta();
    initFaqAccordion();
});

// FAQ Accordion toggles
function initFaqAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            faqItems.forEach(faq => faq.classList.remove('active'));
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });
}

// Active dot highlighter for reviews slider
function initReviewsSlider() {
    const slider = document.querySelector('.reviews-slider');
    const cards = document.querySelectorAll('.review-card');
    const dots = document.querySelectorAll('.dot');

    if (!slider || !cards.length || !dots.length) return;

    const observerOptions = {
        root: slider,
        threshold: 0.6
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const index = Array.from(cards).indexOf(entry.target);
                dots.forEach(dot => dot.classList.remove('active'));
                if (dots[index]) {
                    dots[index].classList.add('active');
                }
            }
        });
    }, observerOptions);

    cards.forEach(card => observer.observe(card));

    // Allow dots click-to-scroll
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            if (cards[index]) {
                cards[index].scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                    inline: 'center'
                });
            }
        });
    });
}

// Scroll observer to show/hide sticky bottom CTA
function initStickyCta() {
    const stickyCta = document.querySelector('.sticky-cta');
    const heroBtn = document.querySelector('.hero-section .btn-primary');
    const finalSection = document.querySelector('.final-cta-section');
    const finalBtn = finalSection ? finalSection.querySelector('.final-btn') : null;

    if (!stickyCta || !heroBtn) return;

    window.addEventListener('scroll', () => {
        const heroRect = heroBtn.getBoundingClientRect();
        let pastHero = heroRect.bottom < 0;
        let beforeFinal = true;

        if (finalBtn) {
            const finalBtnRect = finalBtn.getBoundingClientRect();
            if (finalBtnRect.top < window.innerHeight) {
                beforeFinal = false;
            }
        }

        if (pastHero && beforeFinal) {
            stickyCta.classList.add('visible');
        } else {
            stickyCta.classList.remove('visible');
        }
    });
}

// Checkout Modal actions
function openCheckoutModal(event) {
    event.preventDefault();
    document.getElementById("checkoutModal").style.display = "block";
    document.body.style.overflow = "hidden";
    resetCheckout();
    location.hash = "details";
}

function resetCheckout() {
    currentStep = 1;
    selectedAddons = {};
    document.getElementById('checkoutFormContainer').style.display = 'block';
    document.getElementById('checkoutSuccessView').style.display = 'none';
    document.getElementById('checkoutStep1').style.display = 'block';
    document.getElementById('checkoutStep2').style.display = 'none';
    document.getElementById('modalHeader').textContent = 'Complete Your Purchase';
    document.getElementById('modalSubtext').style.display = 'block';
    document.getElementById('addonsSummary').innerHTML = '';
    
    // Uncheck all add-ons
    document.querySelectorAll('.addon-checkbox').forEach(cb => cb.checked = false);
    document.querySelectorAll('.addon-card').forEach(card => card.classList.remove('selected-addon'));
    
    updateTotalPrice();
}

function closeCheckoutModal(fromHashChange = false) {
    document.getElementById("checkoutModal").style.display = "none";
    document.body.style.overflow = "auto";
    
    if (!fromHashChange && location.hash) {
        history.pushState("", document.title, window.location.pathname + window.location.search);
    }
}

// Manage modal closing/navigation with browser history
window.addEventListener("hashchange", function() {
    const modal = document.getElementById("checkoutModal");
    const hash = location.hash;

    if (modal.style.display === "block") {
        if (hash === "#details") {
            currentStep = 1;
            document.getElementById('checkoutFormContainer').style.display = 'block';
            document.getElementById('checkoutSuccessView').style.display = 'none';
            document.getElementById('checkoutStep1').style.display = 'block';
            document.getElementById('checkoutStep2').style.display = 'none';
            document.getElementById('modalHeader').textContent = 'Complete Your Purchase';
            document.getElementById('modalSubtext').style.display = 'block';
        } else if (!hash || hash === "#") {
            closeCheckoutModal(true);
        }
    }
});

// Escape key listener
document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
        closeCheckoutModal();
        closeAddonModal();
    }
});

// Selection of tier packages
function selectTier(tierId) {
    document.querySelectorAll('.tier-card').forEach(card => card.classList.remove('selected'));
    
    // Find the clicked card wrapper
    const selectedCard = document.getElementById(`tier-card-${tierId}`);
    if (selectedCard) {
        selectedCard.classList.add('selected');
    }
    
    // Find the radio input
    const radio = document.getElementById(`tier-${tierId}`);
    if (radio) {
        radio.checked = true;

        const tierNames = {
            '1month': '1 Month Access',
            '6months': '6 Months Access',
            'lifetime': 'Lifetime Access'
        };
        
        document.getElementById('selectedTierLabel').textContent = `Ultimate Habit Tracker (${tierNames[tierId]})`;
        document.getElementById('summaryPrice').textContent = '₹' + radio.value;
        updateTotalPrice();
    }
}

// Check/Uncheck add-ons
function toggleAddon(id, price) {
    const checkbox = document.getElementById(`addon-checkbox-${id}`);
    const card = document.getElementById(`addon-card-${id}`);
    
    // If click was on card but not checkbox, toggle checkbox
    if (event.target !== checkbox) {
        checkbox.checked = !checkbox.checked;
    }

    if (checkbox.checked) {
        selectedAddons[id] = price;
        card.classList.add('selected-addon');
    } else {
        delete selectedAddons[id];
        card.classList.remove('selected-addon');
    }
    
    updateTotalPrice();
}

// Update total checkout price sum
function updateTotalPrice() {
    const radio = document.querySelector('input[name="tier"]:checked');
    if (!radio) return;
    
    let basePrice = parseInt(radio.value);
    let total = basePrice;
    
    const addonsSummary = document.getElementById('addonsSummary');
    addonsSummary.innerHTML = '';
    
    for (let id in selectedAddons) {
        total += selectedAddons[id];
        const row = document.createElement('div');
        row.className = 'summary-row';
        const addonNames = { 'workout': 'Workout Planner Add-on', 'expense': 'Expense Tracker Add-on' };
        const name = addonNames[id] || id;
        row.innerHTML = `<span class="product-name">+ ${name}</span><span>₹${selectedAddons[id]}</span>`;
        addonsSummary.appendChild(row);
    }
    
    document.getElementById('totalPrice').textContent = '₹' + total;
}

// Addon Detailed previews
function openAddonModal(type) {
    const modal = document.getElementById("addonModal");
    const title = document.getElementById('modalTitle');
    const mediaContainer = document.getElementById('modalMedia');
    const desc = document.getElementById('modalDesc');

    if (type === 'workout') {
        title.textContent = "Ultimate Workout Planner & Gym Checklist";
        mediaContainer.innerHTML = `<video autoplay loop muted playsinline class="addon-modal-img">
            <source src="https://trackkar.store/assets/workout1.mp4" type="video/mp4">
        </video>`;
        desc.innerHTML = `Struggling to stay consistent with your workouts? Our Google Sheets workout planner makes it simple. Set goals, track progress, and stay motivated—all in one place. Easy to use, fully synced, and built for everyone, from beginners to pros.<br><br><strong>INSTANT DOWNLOAD | 1 TAB | AUTOMATED DASHBOARD</strong>`;
    } else if (type === 'weightloss') {
        title.textContent = "Weight Loss Tracker for Google Sheets";
        mediaContainer.innerHTML = `<img src="https://trackkar.store/assets/weightloss_tracker.png" alt="Details" class="addon-modal-img">`;
        desc.innerHTML = `Keep track of your weight loss with this easy to use weight loss tracker! Simply enter a start date, goal date, start weight and goal weight and keep track of your progress. Milestones and Rewards section has been added as extras.<br><br><strong>INSTANT DOWNLOAD | 1 TAB | AUTOMATED DASHBOARD</strong>`;
    } else if (type === 'expense') {
        title.textContent = "Ultimate Expense Tracker & Budget Planner";
        mediaContainer.innerHTML = `<video autoplay loop muted playsinline class="addon-modal-img">
            <source src="https://trackkar.store/assets/Expense1.mp4" type="video/mp4">
        </video>`;
        desc.innerHTML = `Take control of your spending with a simple, all-in-one Expense Tracker. Log your daily transactions and instantly see where your money is going. With automatic calculations and clear insights, managing your finances becomes effortless.<br><br><strong>INSTANT DOWNLOAD | 1 TAB | AUTOMATED DASHBOARD</strong>`;
    } else {
        title.textContent = "Ultimate Goal Planner & Tracker Visual Board";
        mediaContainer.innerHTML = `<img src="https://trackkar.store/assets/goal_planner.png" alt="Details" class="addon-modal-img">`;
        desc.innerHTML = `Plan smarter and achieve more with our digital Goal Planner for Google Sheets and Excel in Dark Mode. Track goals, monitor progress, and stay motivated with automated features and visual dashboards!<br><br><strong>INSTANT DOWNLOAD | 1 TAB | AUTOMATED DASHBOARD</strong>`;
    }
    modal.style.display = "flex";
}

function closeAddonModal() {
    const video = document.querySelector('#modalMedia video');
    if (video) video.pause();
    document.getElementById("addonModal").style.display = "none";
}

// Sanitize phone entries
function sanitizePhoneInput(input) {
    document.getElementById("phoneError").style.display = "none";
    let value = input.value;
    value = value.replace(/\s+/g, '');
    if (value.startsWith('+')) value = value.substring(1);
    if (value.startsWith('91') && value.length > 2) value = value.substring(2);
    if (value.startsWith('0')) value = value.substring(1);
    if (value !== input.value) input.value = value;
}

// Handle multi-step navigation and launch Razorpay Standard checkout
function handleCheckout(event) {
    event.preventDefault();

    if (currentStep === 1) {
        // Validate Step 1
        let phone = document.getElementById("customerPhone").value;
        phone = phone.replace(/\s+/g, '');
        if (phone.startsWith('+')) phone = phone.substring(1);
        if (phone.startsWith('91') && phone.length > 10) phone = phone.substring(2);
        if (phone.startsWith('0') && phone.length > 10) phone = phone.substring(1);

        const errorMsg = document.getElementById("phoneError");
        if (phone.length !== 10) {
            errorMsg.textContent = "Please enter a valid 10-digit phone number.";
            errorMsg.style.display = "block";
            return;
        }
        errorMsg.style.display = "none";

        // Move to Step 2
        currentStep = 2;
        document.getElementById('checkoutStep1').style.display = 'none';
        document.getElementById('checkoutStep2').style.display = 'block';
        document.getElementById('modalHeader').textContent = 'Personalize Your Order';
        document.getElementById('modalSubtext').style.display = 'none';
        
        // Update hash for Step 2
        location.hash = "addons";
        
        // Remove focus from button to prevent stickiness
        const btn = event.submitter || document.getElementById('submitBtn');
        if (btn) {
            btn.classList.add('no-hover');
            btn.blur();
            setTimeout(() => {
                btn.blur();
                btn.classList.remove('no-hover');
            }, 500);
        }
        return;
    }

    // Step 2: Launch Razorpay Checkout Popup
    const phone = document.getElementById("customerPhone").value;
    const email = document.getElementById("customerEmail").value;
    const radio = document.querySelector('input[name="tier"]:checked');
    const tierValue = radio.value;
    const tierId = radio.id.replace('tier-', '');

    const key = window.NXT_STOCK_CONFIG?.RAZORPAY_KEY_ID || "rzp_test_51NgC159ZJ4t2K9";
    const webAppUrl = window.NXT_STOCK_CONFIG?.GOOGLE_SHEET_WEB_APP_URL;

    // Get selected tier label and active addons
    const tierNames = {
        '1month': '1 Month Access',
        '6months': '6 Months Access',
        'lifetime': 'Lifetime Access'
    };
    const tierLabel = tierNames[tierId] || tierId;

    let addonsList = [];
    for (let id in selectedAddons) {
        const addonNames = { 'workout': 'Workout Planner Add-on', 'expense': 'Expense Tracker Add-on' };
        addonsList.push(addonNames[id] || id);
    }
    const addonsText = addonsList.join(', ');

    // Calculate total price
    let basePrice = parseInt(tierValue);
    let total = basePrice;
    for (let id in selectedAddons) {
        total += selectedAddons[id];
    }

    const companyName = window.NXT_STOCK_CONFIG?.COMPANY_NAME || "NxtStockStore";

    const options = {
        key: key,
        amount: total * 100, // Amount in paise (INR subunit)
        currency: "INR",
        name: companyName,
        description: `Habit Tracker (${tierLabel}) ${addonsText ? '+ ' + addonsText : ''}`,
        image: "https://trackkar.store/assets/sl1.png",
        handler: async function (response) {
            // Success Callback: Disable payment button and show loading text
            const submitBtn = document.getElementById('submitBtn');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Confirming Order...';
            }

            // Post transaction data to Google Sheets Apps Script Web App URL
            if (webAppUrl) {
                const payload = {
                    type: "purchase",
                    timestamp: new Date().toISOString(),
                    email: email,
                    phone: phone,
                    tierLabel: tierLabel,
                    addons: addonsText,
                    amount: total,
                    paymentId: response.razorpay_payment_id
                };

                try {
                    await fetch(webAppUrl, {
                        method: "POST",
                        mode: "no-cors",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payload)
                    });
                } catch (err) {
                    console.error("Error logging transaction to spreadsheet:", err);
                }
            }

            // Display Checkout Success Page
            document.getElementById('checkoutFormContainer').style.display = 'none';
            document.getElementById('checkoutSuccessView').style.display = 'block';
            document.getElementById('successEmailDisplay').textContent = email;
            document.getElementById('successPaymentId').textContent = response.razorpay_payment_id;

            // Track Meta Pixel Purchase Event
            if (typeof fbq === 'function') {
                fbq('track', 'Purchase', {
                    value: total,
                    currency: 'INR',
                    content_name: `Habit Tracker (${tierLabel})`,
                    content_category: 'Spreadsheet Template'
                });
            }

            // Reset payment button state
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Proceed to Payment';
            }
        },
        prefill: {
            name: "Customer",
            email: email,
            contact: "+91" + phone
        },
        theme: {
            color: "#4A0E4E" // Theme color matching layout
        }
    };

    // Track Meta Pixel InitiateCheckout Event
    if (typeof fbq === 'function') {
        fbq('track', 'InitiateCheckout', {
            value: total,
            currency: 'INR',
            content_name: `Habit Tracker (${tierLabel})`,
            content_category: 'Spreadsheet Template'
        });
    }

    const rzp = new Razorpay(options);
    rzp.open();
}

// Explicit window registration for global event handlers
window.openCheckoutModal = openCheckoutModal;
window.closeCheckoutModal = closeCheckoutModal;
window.selectTier = selectTier;
window.toggleAddon = toggleAddon;
window.openAddonModal = openAddonModal;
window.closeAddonModal = closeAddonModal;
window.sanitizePhoneInput = sanitizePhoneInput;
window.handleCheckout = handleCheckout;
