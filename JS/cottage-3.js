// Mobile menu functionality
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const mobileMenu = document.querySelector('.mobile-menu');
const closeMobileMenu = document.querySelector('.close-mobile-menu');

if (mobileMenuBtn && mobileMenu && closeMobileMenu) {
    mobileMenuBtn.addEventListener('click', function() {
        mobileMenu.classList.add('active');
    });

    closeMobileMenu.addEventListener('click', function() {
        mobileMenu.classList.remove('active');
    });
}

// Gallery functionality
const showAllPhotosBtn = document.querySelector('.show-all-photos');
const modalGallery = document.querySelector('.modal-gallery');
const closeModalBtn = document.querySelector('.close-modal');

if (showAllPhotosBtn && modalGallery && closeModalBtn) {
    showAllPhotosBtn.addEventListener('click', function() {
        modalGallery.classList.add('active');
    });

    closeModalBtn.addEventListener('click', function() {
        modalGallery.classList.remove('active');
    });
}

// Booking calculator functionality
const numGuestsInput = document.getElementById('num-guests');
const numNightsInput = document.getElementById('num-nights');
const nightsDisplay = document.getElementById('nights-display');
const subtotalDisplay = document.getElementById('subtotal');
const serviceFeeDisplay = document.getElementById('service-fee');
const taxesDisplay = document.getElementById('taxes');
const totalDisplay = document.getElementById('total');
const guestsError = document.getElementById('guests-error');

if (numGuestsInput && numNightsInput) {
    const NIGHTLY_RATE = 400;
    const CLEANING_FEE = 200;
    const SERVICE_FEE_PERCENTAGE = 0.15;
    const TAX_PERCENTAGE = 0.13;

    function calculateTotal() {
        const numGuests = parseInt(numGuestsInput.value);
        const numNights = parseInt(numNightsInput.value);

        if (numGuests > 12) {
            guestsError.style.display = 'block';
            return;
        } else {
            guestsError.style.display = 'none';
        }

        const subtotal = NIGHTLY_RATE * numNights;
        const serviceFee = subtotal * SERVICE_FEE_PERCENTAGE;
        const taxes = (subtotal + serviceFee) * TAX_PERCENTAGE;
        const total = subtotal + CLEANING_FEE + serviceFee + taxes;

        nightsDisplay.textContent = numNights;
        subtotalDisplay.textContent = `$${subtotal} CAD`;
        serviceFeeDisplay.textContent = `$${Math.round(serviceFee)} CAD`;
        taxesDisplay.textContent = `$${Math.round(taxes)} CAD`;
        totalDisplay.textContent = `$${Math.round(total)} CAD`;
    }

    numGuestsInput.addEventListener('input', calculateTotal);
    numNightsInput.addEventListener('input', calculateTotal);
    calculateTotal();
}

// Share functionality
const currentUrl = window.location.href;
const title = 'Lakefront Cottage, Kawartha Lakes - Serene Lakefront Retreat';
const description = 'Welcome to a serene retreat. Nestled on the tranquil shore of a beautiful lakefront, enjoy the serenity and view, not to mention a golf course just a couple minutes away!';

// Facebook Share
const shareFacebook = document.getElementById('share-facebook');
if (shareFacebook) {
    shareFacebook.addEventListener('click', function(e) {
        e.preventDefault();
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`, 'facebook-share-dialog', 'width=626,height=436');
    });
}

// Twitter Share
const shareTwitter = document.getElementById('share-twitter');
if (shareTwitter) {
    shareTwitter.addEventListener('click', function(e) {
        e.preventDefault();
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(currentUrl)}`, 'twitter-share-dialog', 'width=626,height=436');
    });
}

// WhatsApp Share
const shareWhatsapp = document.getElementById('share-whatsapp');
if (shareWhatsapp) {
    shareWhatsapp.addEventListener('click', function(e) {
        e.preventDefault();
        window.open(`https://wa.me/?text=${encodeURIComponent(title + ' ' + currentUrl)}`, 'whatsapp-share-dialog', 'width=626,height=436');
    });
}

// Email Share
const shareEmail = document.getElementById('share-email');
if (shareEmail) {
    shareEmail.addEventListener('click', function(e) {
        e.preventDefault();
        window.open(`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(description + '\n\n' + currentUrl)}`, 'email-share-dialog');
    });
}

// Copy Link
const shareCopy = document.getElementById('share-copy');
const copyMessage = document.getElementById('copy-message');
if (shareCopy && copyMessage) {
    shareCopy.addEventListener('click', function() {
        navigator.clipboard.writeText(currentUrl).then(function() {
            copyMessage.classList.add('show');
            setTimeout(function() {
                copyMessage.classList.remove('show');
            }, 2000);
        });
    });
}

// Review card animations
const reviewCards = document.querySelectorAll('.review-card');
reviewCards.forEach((card, index) => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = `fadeInUp 0.5s ease forwards ${index * 0.1}s`;
            }
        });
    });
    observer.observe(card);
});

// Feature item hover effects
const featureItems = document.querySelectorAll('.feature-item');
featureItems.forEach(item => {
    item.addEventListener('mouseenter', function() {
        const icon = this.querySelector('.feature-icon');
        icon.style.transform = 'scale(1.2)';
    });

    item.addEventListener('mouseleave', function() {
        const icon = this.querySelector('.feature-icon');
        icon.style.transform = 'scale(1)';
    });
});

// Weather indicator
function createWeatherIndicator() {
    const weatherEl = document.createElement('div');
    weatherEl.className = 'weather-indicator';
    weatherEl.style.position = 'fixed';
    weatherEl.style.top = '20px';
    weatherEl.style.right = '20px';
    weatherEl.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
    weatherEl.style.padding = '10px 15px';
    weatherEl.style.borderRadius = '20px';
    weatherEl.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    weatherEl.style.zIndex = '1000';
    weatherEl.style.transition = 'all 0.3s ease';

    const weatherEmoji = '☀️';
    const weatherDesc = 'Sunny, 25°C';

    weatherEl.innerHTML = `
        <span class="weather-emoji">${weatherEmoji}</span>
        <span class="weather-temp">${Math.floor(15 + Math.random() * 10)}°C</span>
    `;

    weatherEl.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.05)';
        this.textContent = weatherDesc;
    });

    weatherEl.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1)';
        this.innerHTML = `
            <span class="weather-emoji">${weatherEmoji}</span>
            <span class="weather-temp">${Math.floor(15 + Math.random() * 10)}°C</span>
        `;
    });

    document.body.appendChild(weatherEl);
}

// Create weather indicator after a short delay
setTimeout(createWeatherIndicator, 5000);

// Book direct button
function createBookDirectButton() {
    const bookBtn = document.createElement('div');
    bookBtn.className = 'book-direct-btn';
    bookBtn.textContent = 'Book Now!';
    bookBtn.style.position = 'fixed';
    bookBtn.style.left = '20px';
    bookBtn.style.bottom = '20px';
    bookBtn.style.backgroundColor = '#D27D56';
    bookBtn.style.color = 'white';
    bookBtn.style.padding = '10px 20px';
    bookBtn.style.borderRadius = '30px';
    bookBtn.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.2)';
    bookBtn.style.cursor = 'pointer';
    bookBtn.style.zIndex = '100';
    bookBtn.style.fontWeight = 'bold';
    bookBtn.style.opacity = '0';
    bookBtn.style.transform = 'translateY(20px)';
    bookBtn.style.transition = 'all 0.3s ease';
    bookBtn.style.fontFamily = 'var(--font-display)';

    const tooltip = document.createElement('div');
    tooltip.className = 'book-direct-tooltip';
    tooltip.textContent = 'Best rates!';
    tooltip.style.position = 'absolute';
    tooltip.style.top = '-25px';
    tooltip.style.left = '50%';
    tooltip.style.transform = 'translateX(-50%)';
    tooltip.style.backgroundColor = '#FFB84D';
    tooltip.style.color = '#63482D';
    tooltip.style.padding = '3px 8px';
    tooltip.style.borderRadius = '10px';
    tooltip.style.fontSize = '12px';
    tooltip.style.fontWeight = 'bold';
    tooltip.style.opacity = '0';
    tooltip.style.transition = 'opacity 0.3s ease';
    tooltip.style.whiteSpace = 'nowrap';

    bookBtn.appendChild(tooltip);

    bookBtn.addEventListener('mouseenter', function() {
        tooltip.style.opacity = '1';
    });

    bookBtn.addEventListener('mouseleave', function() {
        tooltip.style.opacity = '0';
    });

    bookBtn.addEventListener('click', function() {
        const bookingSection = document.getElementById('booking');
        if (bookingSection) {
            bookingSection.scrollIntoView({ behavior: 'smooth' });
        }
    });

    document.body.appendChild(bookBtn);

    window.addEventListener('scroll', function() {
        if (window.scrollY > 500) {
            bookBtn.style.opacity = '1';
            bookBtn.style.transform = 'translateY(0)';
        } else {
            bookBtn.style.opacity = '0';
            bookBtn.style.transform = 'translateY(20px)';
        }
    });
}

// Create book direct button
createBookDirectButton();

// Day/night cycle
function updateDayNightCycle() {
    const hour = new Date().getHours();
    const body = document.body;

    if (hour >= 5 && hour < 8) {
        body.style.backgroundColor = '#F8F4EA';
    } else if (hour >= 8 && hour < 17) {
        body.style.backgroundColor = '#FBF7F0';
    } else if (hour >= 17 && hour < 21) {
        body.style.backgroundColor = '#FAF3E3';
    } else {
        body.style.backgroundColor = '#F5F0E5';
    }
}

// Set initial day/night cycle and update every hour
updateDayNightCycle();
setInterval(updateDayNightCycle, 3600000);

// Page loader
function createCozyPageLoader() {
    const loader = document.createElement('div');
    loader.className = 'page-loader';
    loader.style.position = 'fixed';
    loader.style.top = '0';
    loader.style.left = '0';
    loader.style.width = '100%';
    loader.style.height = '100%';
    loader.style.backgroundColor = '#FBF7F0';
    loader.style.display = 'flex';
    loader.style.flexDirection = 'column';
    loader.style.alignItems = 'center';
    loader.style.justifyContent = 'center';
    loader.style.zIndex = '10000';
    loader.style.transition = 'opacity 0.5s ease, visibility 0.5s ease';

    loader.innerHTML = `
        <div style="font-family: var(--font-handwritten); font-size: 2rem; margin-bottom: 20px; color: #D27D56;">Welcome to our Cottage</div>
        <div style="width: 50px; height: 50px; border: 5px solid #F7F3E9; border-top-color: #D27D56; border-radius: 50%; animation: spin 1s linear infinite;"></div>
        <div style="font-family: var(--font-body); margin-top: 20px; color: #9C6F44;">Preparing your cozy experience...</div>
    `;

    const style = document.createElement('style');
    style.textContent = `
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);

    document.body.appendChild(loader);

    window.addEventListener('load', function() {
        setTimeout(() => {
            loader.style.opacity = '0';
            loader.style.visibility = 'hidden';
            
            setTimeout(() => {
                if (document.body.contains(loader)) {
                    document.body.removeChild(loader);
                }
            }, 500);
        }, 800);
    });
}

// Create page loader
createCozyPageLoader();

// Special offer
function createSpecialOffer() {
    if (window.scrollY < 300) return;

    const offer = document.createElement('div');
    offer.className = 'special-offer';
    offer.style.position = 'fixed';
    offer.style.bottom = '80px';
    offer.style.right = '-300px';
    offer.style.width = '250px';
    offer.style.backgroundColor = '#FFF9EC';
    offer.style.borderRadius = '10px';
    offer.style.boxShadow = '0 5px 20px rgba(0, 0, 0, 0.15)';
    offer.style.padding = '15px';
    offer.style.zIndex = '999';
    offer.style.transition = 'right 0.5s ease';
    offer.style.borderLeft = '4px solid #FFB84D';

    offer.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <div style="font-family: var(--font-display); font-weight: bold; color: #63482D;">Special Offer!</div>
            <button class="close-offer" style="background: none; border: none; font-size: 16px; cursor: pointer; color: #9C6F44;">×</button>
        </div>
        <div style="font-family: var(--font-handwritten); font-size: 1.2rem; margin-bottom: 10px; color: #D27D56;">10% OFF</div>
        <div style="font-family: var(--font-body); font-size: 0.9rem; margin-bottom: 10px; color: #9C6F44;">Book a 7+ night stay and get 10% off your total!</div>
        <div style="font-family: var(--font-body); font-size: 0.8rem; color: #9D8E84; font-style: italic;">Use code: COZY10</div>
    `;

    document.body.appendChild(offer);

    setTimeout(() => {
        offer.style.right = '20px';
    }, 500);

    const closeBtn = offer.querySelector('.close-offer');
    closeBtn.addEventListener('click', function() {
        offer.style.right = '-300px';
        setTimeout(() => {
            if (document.body.contains(offer)) {
                document.body.removeChild(offer);
            }
        }, 500);
    });

    setTimeout(() => {
        if (document.body.contains(offer)) {
            offer.style.right = '-300px';
            setTimeout(() => {
                if (document.body.contains(offer)) {
                    document.body.removeChild(offer);
                }
            }, 500);
        }
    }, 15000);
}

// Show special offer after some time
setTimeout(createSpecialOffer, 25000);

// Image hover effects
document.querySelectorAll('img').forEach(img => {
    img.addEventListener('mousemove', function(e) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;
        
        this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
    });

    img.addEventListener('mouseleave', function() {
        this.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
    });
});     