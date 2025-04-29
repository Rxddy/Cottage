// Main JavaScript for Cyberpunk LakeFront Cottage
document.addEventListener('DOMContentLoaded', function() {
    // Initialize header transparency
    const header = document.querySelector('header');
    
    // Make header transparent initially and change on scroll
    if (window.scrollY <= 50) {
        header.classList.add('js-header-transparent');
    }
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
            header.classList.remove('js-header-transparent');
        } else {
            header.classList.remove('scrolled');
            header.classList.add('js-header-transparent');
        }
    });
    
    // Create cursor trail elements
    for (let i = 0; i < 15; i++) {
        const trail = document.createElement('div');
        trail.classList.add('cursor-fx');
        document.body.appendChild(trail);
    }
    
    // Initialize cursor trail
    const trails = document.querySelectorAll('.cursor-fx');
    const coords = { x: 0, y: 0 };
    let cursorVisible = false;
    
    document.addEventListener('mousemove', function(e) {
        coords.x = e.clientX;
        coords.y = e.clientY;
        
        if (!cursorVisible) {
            cursorVisible = true;
            trails.forEach(trail => trail.style.opacity = 1);
        }
    });
    
    document.addEventListener('mouseout', function() {
        cursorVisible = false;
        trails.forEach(trail => trail.style.opacity = 0);
    });
    
    // Animate trails
    function animateTrails() {
        let delay = 0;
        
        trails.forEach(trail => {
            setTimeout(() => {
                trail.style.left = `${coords.x}px`;
                trail.style.top = `${coords.y}px`;
                trail.style.opacity = cursorVisible ? 1 - (delay / 30) : 0;
                trail.style.width = `${5 + delay}px`;
                trail.style.height = `${5 + delay}px`;
                trail.style.zIndex = 9999 - delay;
            }, delay * 30);
            
            delay++;
        });
        
        requestAnimationFrame(animateTrails);
    }
    
    animateTrails();
    
    // Add glitch text effect to section titles
    document.querySelectorAll('.section-title').forEach(title => {
        const text = title.textContent;
        title.innerHTML = `<span data-text="${text}">${text}</span>`;
        title.classList.add('glitch-text');
    });
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Modal Gallery functionality
    const showAllPhotosBtn = document.querySelector('.show-all-photos');
    const modalGallery = document.querySelector('.modal-gallery');
    const closeModalBtn = document.querySelector('.close-modal');

    if (showAllPhotosBtn && modalGallery && closeModalBtn) {
        showAllPhotosBtn.addEventListener('click', function() {
            modalGallery.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
        });

        closeModalBtn.addEventListener('click', function() {
            modalGallery.classList.remove('active');
            document.body.style.overflow = ''; // Restore scrolling
        });

        // Close modal when clicking outside the images
        modalGallery.addEventListener('click', function(e) {
            if (e.target === modalGallery) {
                modalGallery.classList.remove('active');
                document.body.style.overflow = '';
            }
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
        const SERVICE_FEE_RATE = 0.15; // 15% service fee
        const TAX_RATE = 0.13; // 13% tax

        function calculateTotal() {
            const numNights = parseInt(numNightsInput.value) || 1;
            const numGuests = parseInt(numGuestsInput.value) || 1;

            // Update nights display
            if (nightsDisplay) nightsDisplay.textContent = numNights;

            // Calculate subtotal (nightly rate × number of nights)
            const subtotal = NIGHTLY_RATE * numNights;
            if (subtotalDisplay) subtotalDisplay.textContent = `$${subtotal} CAD`;

            // Calculate service fee (15% of subtotal)
            const serviceFee = Math.round(subtotal * SERVICE_FEE_RATE);
            if (serviceFeeDisplay) serviceFeeDisplay.textContent = `$${serviceFee} CAD`;

            // Calculate taxes (13% of subtotal + cleaning fee + service fee)
            const preTaxTotal = subtotal + CLEANING_FEE + serviceFee;
            const taxes = Math.round(preTaxTotal * TAX_RATE);
            if (taxesDisplay) taxesDisplay.textContent = `$${taxes} CAD`;

            // Calculate total
            const total = preTaxTotal + taxes;
            if (totalDisplay) totalDisplay.textContent = `$${total} CAD`;

            // Validate number of guests
            if (guestsError) {
                if (numGuests > 12) {
                    guestsError.style.display = 'block';
                } else {
                    guestsError.style.display = 'none';
                }
            }
        }

        // Add event listeners for input changes
        numGuestsInput.addEventListener('input', calculateTotal);
        numNightsInput.addEventListener('input', calculateTotal);

        // Initial calculation
        calculateTotal();
    }

    // Mobile menu functionality
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileMenu = document.querySelector('.mobile-menu');
    const closeMobileMenu = document.querySelector('.close-mobile-menu');

    if (mobileMenuBtn && mobileMenu && closeMobileMenu) {
        mobileMenuBtn.addEventListener('click', function() {
            mobileMenu.classList.add('active');
            document.body.style.overflow = 'hidden';
        });

        closeMobileMenu.addEventListener('click', function() {
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        });

        // Close mobile menu when clicking a link
        const mobileLinks = mobileMenu.querySelectorAll('a');
        mobileLinks.forEach(link => {
            link.addEventListener('click', function() {
                mobileMenu.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
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
            window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(description + '\n\n' + currentUrl)}`;
        });
    }

    // Copy Link
    const shareCopy = document.getElementById('share-copy');
    const copyMessage = document.getElementById('copy-message');
    if (shareCopy && copyMessage) {
        shareCopy.addEventListener('click', function() {
            navigator.clipboard.writeText(currentUrl).then(function() {
                copyMessage.classList.add('show');
                setTimeout(() => {
                    copyMessage.classList.remove('show');
                }, 2000);
            });
        });
    }
    
    // Add cyberpunk button class to all booking buttons
    document.querySelectorAll('.btn').forEach(btn => {
        if (!btn.classList.contains('cyber-btn')) {
            btn.classList.add('cyber-btn');
        }
    });
});